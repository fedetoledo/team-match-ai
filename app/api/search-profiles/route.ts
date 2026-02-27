import { hrAgent } from '@/lib/agents/hr-agent/graph';
import { streamObject } from 'ai';
import { getSelectedModelServer } from '@/lib/llm_model';
import { profileSchema } from './schema';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    const agentResult = await hrAgent.invoke({ input });

    if (agentResult.error) {
      return Response.json(
        { error: 'Agent processing error', details: agentResult.error },
        { status: 500 },
      );
    }

    const model = await getSelectedModelServer();

    // Now stream the response directly using AI SDK
    const result = streamObject({
      model,
      output: 'array',
      schema: profileSchema,
      temperature: 0,
      onFinish: async ({ usage }) => {
        fetch(`${process.env.API_BASE_URL}/record-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: input,
            response: agentResult.context,
            inputTokens:
              (agentResult.tokenUsage?.inputTokens || 0) +
              (usage.inputTokens || 0),
            outputTokens:
              (agentResult.tokenUsage?.outputTokens || 0) +
              (usage.outputTokens || 0),
            username: 'demo',
            modelUsed: model.modelId,
          }),
        }).catch((err) =>
          console.error('Failed to record search:', err),
        );
      },
      prompt: `Structure the following developer profiles information into JSON format.

Profiles found:
${agentResult.context}

Rules for structuring the information:
- You can only use the profiles from the list above.
- Do not invent or make up profile information that is not in the list.
- If the "summary" field is empty, add a summary explaining why the profile is a good candidate for the position. Try not to just list the skills. Use seniority and skills together for the summary.
- Return an array of JSON objects.
- Each object represents a developer profile.
- If there are no profiles, return an empty array: [].
`,
    });

    // Return the stream in the format expected by useObject
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in search API:', error);
    return new Response(
      JSON.stringify({
        error: 'Error processing search request',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
