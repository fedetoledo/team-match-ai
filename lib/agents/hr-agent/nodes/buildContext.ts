import { Profile } from '@/app/api/search-profiles/types';
import { HRAgentStateType } from '../graph';

export const buildContext = (state: HRAgentStateType): HRAgentStateType => {
  const profilesContext =
    state.matchingProfiles?.map(buildProfileContext).join('\n') || '';

  return {
    context: profilesContext,
  };
};

const buildProfileContext = (profile: Profile, index: number) => {
  const similarityScore = (profile.similarity * 100).toFixed(1);

  return `
    Profile ${index + 1}:
    ${profile.summary}

    Details:
    - Name: ${profile.name}
    - Position: ${profile.position}
    - Seniority: ${profile.seniority}
    - Experience: ${profile.experience_years}
    - Skills: ${profile.skills?.join(', ') || 'N/A'}
    - Email: ${profile.email || 'N/A'}
    - Location: ${profile.location || 'N/A'}
    - Office: ${profile.office || 'N/A'}
    - Similarity Score: ${similarityScore}%
    --------------------
  `;
};
