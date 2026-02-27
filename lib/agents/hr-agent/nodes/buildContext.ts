import { Profile } from '@/app/api/search-profiles/types';
import { HRAgentNode, HRAgentStateType } from '../graph';

export const buildContext = (state: HRAgentStateType): HRAgentStateType => {
  try {
    const profilesContext =
      state.matchingProfiles?.map(buildProfileContext).join('\n') || '';

    return {
      context: profilesContext,
    };
  } catch (error) {
    return {
      error: {
        reason: `Failed to build context: ${(error as Error).message}`,
        step: HRAgentNode.BuildContext,
      },
    };
  }
};

const buildProfileContext = (profile: Profile, index: number) => {
  const similarityScore = ((profile.similarity ?? 0) * 100).toFixed(1);

  return `
    Profile ${index + 1}:
    ${profile.summary ?? 'N/A'}

    Details:
    - Name: ${profile.name ?? 'N/A'}
    - Position: ${profile.position ?? 'N/A'}
    - Seniority: ${profile.seniority ?? 'N/A'}
    - Experience: ${profile.experience_years ?? 'N/A'}
    - Skills: ${profile.skills?.join(', ') || 'N/A'}
    - Email: ${profile.email || 'N/A'}
    - Location: ${profile.location || 'N/A'}
    - Office: ${profile.office || 'N/A'}
    - Similarity Score: ${similarityScore}%
    --------------------
  `;
};
