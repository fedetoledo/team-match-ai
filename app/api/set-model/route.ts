import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { model } = body;

    if (!model || typeof model !== 'string') {
      return Response.json(
        { error: 'Invalid or missing model field' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set('selectedModel', model, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error: 'Failed to set model',
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
