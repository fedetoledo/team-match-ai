import { db } from '@/lib/db';

export interface QueryHistory {
  id: number;
  query: string;
  response: string;
  input_tokens: number;
  output_tokens: number;
  username: string;
  created_at: string;
  model_used: string;
}

export async function getSearchHistory(
  username: string,
): Promise<QueryHistory[]> {
  const records = await db.execute({
    sql: `SELECT * FROM ${process.env.RECORD_SEARCH_TABLE} WHERE username = ?`,
    args: [username],
  });

  return records.rows.map((row) => ({ ...row })) as unknown as QueryHistory[];
}
