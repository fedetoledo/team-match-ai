// @ts-strict-ignore
import { NextResponse } from 'next/server';
import Airtable, { FieldSet, Records } from 'airtable';
import { google } from '@ai-sdk/google';
import { embedMany } from 'ai';
import { sql } from '@/lib/db';

const EMBEDDING_MODEL = 'text-embedding-004';
const BATCH_SIZE = 10; // Process 10 records at a time (Gemini has higher limits)
const DELAY_BETWEEN_BATCHES = 500; // 500ms delay between batches

interface Profile {
  id: string;
  fields: {
    Surname: string;
    Hours: number;
    'Selling Category': string;
    Job: string;
    Status: string;
    'Sell Hours': string;
    Location: string;
    Email: string;
    'Starting Date': string;
    Seniority: string;
    'Birth Date': string;
    'Days of Presenteeism': string[];
    Skills: string[];
    Name: string;
    Duration: string;
    Area: string;
    'Full Name': string;
    Office: string;
    Position: string;
    'Seniority Cat': string;
    Age: number;
    DNI: string;
    CUIL: string;
    'Profile Picture': Array<{
      id: string;
      url: string;
      filename: string;
      size: number;
      type: string;
      thumbnails: {
        small: { url: string; width: number; height: number };
        large: { url: string; width: number; height: number };
        full: { url: string; width: number; height: number };
      };
    }>;
  };
}

type SeedLog =
  | {
      error: string;
      reason: string;
    }
  | {
      message: string;
    };

const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_ID,
  GOOGLE_GENERATIVE_AI_API_KEY,
} = process.env;

const checkEnvVars = () => {
  const missingVars = [
    !AIRTABLE_API_KEY && 'AIRTABLE_API_KEY',
    !AIRTABLE_BASE_ID && 'AIRTABLE_BASE_ID',
    !AIRTABLE_TABLE_ID && 'AIRTABLE_TABLE_ID',
    !GOOGLE_GENERATIVE_AI_API_KEY && 'GOOGLE_GENERATIVE_AI_API_KEY',
  ]
    .filter(Boolean)
    .join(', ');

  return {
    missingEnvVars: missingVars,
    hasMissing: missingVars.length > 0,
  };
};

const getAirtableData = async (logs: SeedLog[]) => {
  // Initialize clients
  const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
    AIRTABLE_BASE_ID!,
  );

  logs.push({ message: 'Fetching records from Airtable...' });
  const records = await airtable(AIRTABLE_TABLE_ID!)
    .select({
      filterByFormula: "Status = 'Active'",
    })
    .all();
  logs.push({ message: `Fetched ${records.length} records.` });

  return records.filter((record) => record.fields['Status'] === 'Active');
};

const generateInitialTables = async (logs: SeedLog[]) => {
  // Enable the pgvector extension
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
  logs.push({ message: '✓ Enabled pgvector extension.' });

  // Create the table to store the data and embeddings
  await sql`
      CREATE TABLE IF NOT EXISTS employee_profiles_techmatch (
        id SERIAL PRIMARY KEY,
        record_id TEXT UNIQUE,
        name TEXT,
        position TEXT,
        skills TEXT[],
        location TEXT,
        office TEXT,
        seniority TEXT,
        experience_years TEXT,
        email TEXT,
        summary TEXT,
        summary_embedding VECTOR(768)
      );
    `;

  await sql`
    CREATE TABLE IF NOT EXISTS record_search (
      id SERIAL PRIMARY KEY,
      query TEXT,
      response TEXT,
      input_tokens INTEGER,
      output_tokens INTEGER,
      username TEXT default 'federico',
      model_used TEXT default 'gemini-2.5-flash-lite',
      created_at TIMESTAMP DEFAULT NOW()
    );
    `;
};

interface ProcessedProfile {
  id: string;
  name: string;
  position: string;
  skills: string[];
  location: string;
  office: string;
  seniority: string;
  experience_years: string;
  email: string;
  summary: string;
}

const insertManyRecords = async (
  data: ProcessedProfile[],
  embeddings: number[][],
) => {
  for (let i = 0; i < data.length; i++) {
    const profile = data[i];
    const embedding = embeddings[i];

    await sql`
      INSERT INTO employee_profiles_techmatch (record_id, name, position, skills, location, office, seniority, experience_years, email, summary, summary_embedding) VALUES (${
        profile.id
      }, ${profile.name}, ${profile.position}, ${sql.array(profile.skills)}, ${
        profile.location
      }, ${profile.office}, ${profile.seniority}, ${profile.experience_years}, ${
        profile.email
      }, ${profile.summary}, ${JSON.stringify(embedding)})
    `;
  }
};

const processRecordsInBatches = async (
  records: Records<FieldSet>,
  logs: SeedLog[],
) => {
  let processedCount = 0;
  const totalBatches = Math.ceil(records.length / BATCH_SIZE);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    logs.push({
      message: `Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`,
    });

    // Prepare batch data
    const batchData = batch.map((record) => {
      const fields = record.fields as Profile['fields'];

      const profile = {
        id: record.id,
        name: fields['Full Name'] || 'N/A',
        position: fields['Position'] || fields['Job'] || 'N/A',
        skills: fields['Skills'] || [],
        location: fields['Location'] || 'N/A',
        office: fields['Office'] || 'N/A',
        seniority: fields['Seniority'] || 'N/A',
        experience_years: fields['Duration'] || 'N/A',
        email: fields['Email'] || 'N/A',
        summary: '',
      };

      const summary = `
Professional Profile: ${profile.name}
- Job Title: ${profile.position}
- Location: ${profile.office}, ${profile.location}
- Seniority Level: ${profile.seniority}
- Years of Experience: ${profile.experience_years}
`;

      profile.summary = summary
        .replace(/\s*\n\s*/g, ' ') // replace newlines with spaces
        .trim();

      return profile;
    });

    //Generate embeddings for the entire batch using Vercel AI SDK
    const batchContents = batchData.map((item) => item.summary);
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel(EMBEDDING_MODEL),
      values: batchContents,
    });

    // Insert all records from the batch into the database at once
    await insertManyRecords(batchData, embeddings);

    processedCount += batch.length;
    logs.push({
      message: `✓ Processed batch ${batchNumber}/${totalBatches} (${processedCount}/${records.length})`,
    });

    if (i + BATCH_SIZE < records.length) {
      logs.push({
        message: `Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`,
      });
      await new Promise((resolve) =>
        setTimeout(resolve, DELAY_BETWEEN_BATCHES),
      );
    }
  }

  logs.push({
    message: `✅ Successfully seeded/updated ${processedCount} employee profiles.`,
  });

  return {
    processedCount,
  };
};

export async function GET() {
  const logs: SeedLog[] = [];
  try {
    const { missingEnvVars, hasMissing } = checkEnvVars();

    if (hasMissing) {
      return Response.json(
        {
          error: `Missing required environment variables: ${missingEnvVars}`,
        },
        {
          status: 400,
        },
      );
    }

    // Generate initial tables
    await generateInitialTables(logs);

    // Fetch records from Airtable
    const records = await getAirtableData(logs);

    // Process records in batches
    const { processedCount } = await processRecordsInBatches(records, logs);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully seeded ${processedCount} employee profiles`,
        processed: processedCount,
        total: records.length,
        logs,
      },
      { status: 200 },
    );
  } catch (error) {
    logs.push({
      error: 'An error occurred during seeding',
      reason: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error',
        logs,
      },
      { status: 500 },
    );
  }
}
