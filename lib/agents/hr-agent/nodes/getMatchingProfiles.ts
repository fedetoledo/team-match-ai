import { db } from '@/lib/db';
import { Profile } from '@/app/api/search-profiles/types';
import { TOP_K_RETRIEVAL, TOP_N_RESULTS } from '@/lib/constants';
import { HRAgentNode, HRAgentStateType } from '../graph';
import { parseRequirements, rerankProfiles } from '../utils/reranking';

const TABLE = process.env.EMPLOYEE_PROFILE_TABLE!;

function parseSkills(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  // JSON array: ["React","Node.js"]
  if (trimmed.startsWith('[')) {
    try { return JSON.parse(trimmed); } catch { /* fall through */ }
  }
  // Postgres array literal: {React,Node.js}
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed.slice(1, -1).split(',').map(s => s.trim());
  }
  // Comma-separated fallback
  return trimmed.split(',').map(s => s.trim());
}

export const getMatchingProfiles = async (
  state: HRAgentStateType,
): Promise<HRAgentStateType> => {
  try {
    // Step 1: Vector search - get top-K most similar profiles by cosine distance
    const vectorQuery = JSON.stringify(state.inputEmbedding);

    const result = await db.execute({
      sql: `SELECT
              record_id,
              name,
              position,
              skills,
              location,
              office,
              seniority,
              experience_years,
              email,
              summary,
              1 - vector_distance_cos(summary_embedding, vector32(?)) as similarity
            FROM ${TABLE}
            ORDER BY vector_distance_cos(summary_embedding, vector32(?))
            LIMIT ?`,
      args: [vectorQuery, vectorQuery, TOP_K_RETRIEVAL],
    });

    const topKProfiles = result.rows.map(row => ({
      ...row,
      skills: parseSkills(row.skills),
    })) as unknown as Array<Profile>;

    if (!topKProfiles || topKProfiles.length === 0) {
      return {
        matchingProfiles: [],
      };
    }

    // Step 2: Parse requirements from the input query
    const requirements = parseRequirements(state.input || '');

    // Step 3: Rerank profiles based on multiple criteria
    const rankedProfiles = rerankProfiles(topKProfiles, requirements);

    // Step 4: Return top-N results
    const topNProfiles = rankedProfiles.slice(0, TOP_N_RESULTS);

    // Map back to Profile type with updated similarity (now finalScore)
    const results: Profile[] = topNProfiles.map(rp => ({
      record_id: rp.record_id,
      name: rp.name,
      position: rp.position,
      skills: rp.skills,
      location: rp.location,
      office: rp.office,
      seniority: rp.seniority,
      experience_years: rp.experience_years,
      email: rp.email,
      summary: rp.summary,
      similarity: rp.finalScore,
    }));

    return {
      matchingProfiles: results,
    };
  } catch (error) {
    return {
      error: {
        reason: `Failed to fetch matching profiles: ${
          (error as Error).message
        }`,
        step: HRAgentNode.GetMatchingProfiles,
      },
    };
  }
};
