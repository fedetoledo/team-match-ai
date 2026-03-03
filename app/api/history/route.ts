import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    const records = await db.execute({
      sql: `SELECT * FROM ${process.env.RECORD_SEARCH_TABLE} WHERE username = ?`,
      args: [username],
    });

    return Response.json(records.rows);
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
