import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { embedMany } from 'ai';
import { db } from '@/lib/db';
import { fakeProfiles, FakeProfile } from '@/lib/data/fake-profiles';
import { DEFAULT_EMBEDDING_MODEL_NAME } from '@/lib/constants';
import { BATCH_SIZE, DELAY_BETWEEN_BATCHES, SeedLog } from './utils';

const { GOOGLE_GENERATIVE_AI_API_KEY, EMPLOYEE_PROFILE_TABLE } = process.env;

const checkEnvVars = () => {
  const missingVars = [
    !GOOGLE_GENERATIVE_AI_API_KEY && 'GOOGLE_GENERATIVE_AI_API_KEY',
    !EMPLOYEE_PROFILE_TABLE && 'EMPLOYEE_PROFILE_TABLE',
  ]
    .filter(Boolean)
    .join(', ');

  return {
    missingEnvVars: missingVars,
    hasMissing: missingVars.length > 0,
  };
};

const generateInitialTables = async (logs: SeedLog[]) => {
  const table = EMPLOYEE_PROFILE_TABLE!;

  // Drop existing table and index
  await db.execute(`DROP INDEX IF EXISTS ${table}_idx`);
  await db.execute(`DROP TABLE IF EXISTS ${table}`);

  // Create the employee profiles table with vector column
  await db.execute(`
    CREATE TABLE ${table} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id TEXT UNIQUE,
      name TEXT,
      position TEXT,
      skills TEXT,
      location TEXT,
      office TEXT,
      seniority TEXT,
      experience_years TEXT,
      email TEXT,
      summary TEXT,
      summary_embedding F32_BLOB(3072)
    )
  `);

  logs.push({
    message: `✓ Created ${table} table.`,
  });

  // Create vector index for cosine similarity search
  await db.execute(`
    CREATE INDEX ${table}_idx ON ${table} (
      libsql_vector_idx(summary_embedding, 'metric=cosine', 'compress_neighbors=float8', 'max_neighbors=50')
    )
  `);

  logs.push({ message: `✓ Created vector index ${table}_idx.` });

  // Create record_search table
  const recordSearchTable = process.env.RECORD_SEARCH_TABLE!;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${recordSearchTable} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT,
      response TEXT,
      input_tokens INTEGER,
      output_tokens INTEGER,
      username TEXT DEFAULT 'demo',
      model_used TEXT DEFAULT 'gemini-2.5-flash-lite',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  logs.push({ message: '✓ Created record_search table.' });
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
  const table = EMPLOYEE_PROFILE_TABLE!;

  for (let i = 0; i < data.length; i++) {
    const profile = data[i];
    const embedding = embeddings[i];

    await db.execute({
      sql: `INSERT INTO ${table} (record_id, name, position, skills, location, office, seniority, experience_years, email, summary, summary_embedding)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, vector(?))`,
      args: [
        profile.id,
        profile.name,
        profile.position,
        JSON.stringify(profile.skills),
        profile.location,
        profile.office,
        profile.seniority,
        profile.experience_years,
        profile.email,
        profile.summary,
        JSON.stringify(embedding),
      ],
    });
  }
};

const processRecordsInBatches = async (
  records: FakeProfile[],
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
    const batchData = batch.map((profile) => {
      const processedProfile = {
        id: profile.id,
        name: profile.name,
        position: profile.position,
        skills: profile.skills,
        location: profile.location,
        office: profile.office,
        seniority: profile.seniority,
        experience_years: profile.experience_years,
        email: profile.email,
        summary: '',
      };

      const summary = `
Professional Profile: ${processedProfile.name}
- Job Title: ${processedProfile.position}
- Location: ${processedProfile.office}, ${processedProfile.location}
- Seniority Level: ${processedProfile.seniority}
- Years of Experience: ${processedProfile.experience_years}
`;

      processedProfile.summary = summary.replace(/\s*\n\s*/g, ' ').trim();

      return processedProfile;
    });

    // Generate embeddings for the entire batch using Vercel AI SDK
    const batchContents = batchData.map((item) => item.summary);
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel(DEFAULT_EMBEDDING_MODEL_NAME),
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
    message: `Successfully seeded/updated ${processedCount} employee profiles.`,
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

    logs.push({ message: `Loading ${fakeProfiles.length} fake profiles...` });

    // Process records in batches
    const { processedCount } = await processRecordsInBatches(
      fakeProfiles,
      logs,
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully seeded ${processedCount} employee profiles`,
        processed: processedCount,
        total: fakeProfiles.length,
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
        details:
          error instanceof Error ? JSON.stringify(error) : 'Unknown error',
        logs,
      },
      { status: 500 },
    );
  }
}
