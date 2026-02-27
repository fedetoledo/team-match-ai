import { sql } from '@/lib/db';
import { Profile } from '@/app/api/search-profiles/types';
import { TOP_K_RETRIEVAL, TOP_N_RESULTS } from '@/lib/constants';
import { HRAgentNode, HRAgentStateType } from '../graph';
import { parseRequirements, rerankProfiles } from '../utils/reranking';

export const getMatchingProfiles = async (
  state: HRAgentStateType,
): Promise<HRAgentStateType> => {
  try {
    // Step 1: Vector search - get top-K most similar profiles
    const topKProfiles = await sql<Array<Profile>>`
      SELECT
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
        1 - (summary_embedding <=> ${JSON.stringify(state.inputEmbedding)}) as similarity
      FROM ${sql(process.env.EMPLOYEE_PROFILE_TABLE!)}
      ORDER BY similarity DESC
      LIMIT ${TOP_K_RETRIEVAL}
    `;

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
      similarity: rp.finalScore, // Use final score as the new similarity
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
