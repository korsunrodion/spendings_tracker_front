import { z } from "zod";
import { categorySchema } from "./category";

export const transactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  category: categorySchema,
  subCategory: z.string().optional(),
  sum: z.number(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const transactionsSchema = z.array(transactionSchema);
