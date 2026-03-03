import { getSearchHistory } from '@/lib/history';

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    const rows = await getSearchHistory(username);
    return Response.json(rows);
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
