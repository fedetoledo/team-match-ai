import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { query, response, inputTokens, outputTokens } = await req.json();

    // Store the record in the database
    await sql`
      INSERT INTO record_search (query, response, input_tokens, output_tokens, created_at)
      VALUES (${query}, ${response}, ${inputTokens}, ${outputTokens}, NOW())
    `;

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error storing record search:', error);
    return Response.json(
      {
        error: 'Failed to record search',
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
