export const BATCH_SIZE = 10;
export const DELAY_BETWEEN_BATCHES = 500;

export type SeedLog =
  | {
      error: string;
      reason: string;
    }
  | {
      message: string;
    };
