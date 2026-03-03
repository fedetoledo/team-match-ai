import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { query, response, inputTokens, outputTokens } = await req.json();

    await db.execute({
      sql: `INSERT INTO ${process.env.RECORD_SEARCH_TABLE} (query, response, input_tokens, output_tokens, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))`,
      args: [query, response, inputTokens, outputTokens],
    });

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
