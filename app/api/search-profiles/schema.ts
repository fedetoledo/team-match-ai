import z from 'zod';

export const profileSchema = z.object({
  fullName: z.string().describe('Full name of the developer'),
  jobTitle: z.string().describe('Job title or position'),
  seniority: z.string().describe('Seniority level'),
  experienceYears: z.string().describe('Years of experience'),
  skills: z
    .array(z.string())
    .describe('List of main technical skills'),
  location: z.string().describe('Location'),
  office: z.string().describe('Office or work mode'),
  email: z.string().describe('Contact email'),
  similarityScore: z.string().describe('Match percentage'),
  summary: z
    .string()
    .describe(
      'Brief summary of the professional profile and why it matches the requirement'
    ),
});
