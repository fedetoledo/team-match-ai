import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    const records = await sql`
      SELECT * FROM record_search WHERE username = ${username}
    `;

    return Response.json(records);
  } catch (error) {
    console.error('Error fetching search history:', error);
    return Response.json(
      {
        error: 'Failed to fetch search history',
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
