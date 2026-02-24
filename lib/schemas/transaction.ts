import { z } from "zod";
import { categorySchema } from "./category";

export const transactionSchema = z.object({
  _id: z.string(),
  description: z.string(),
  category: categorySchema,
  subCategory: z.string().optional(),
  sum: z.number(),
  date: z.string().optional(),
  source: z.enum(["privat", "mono"]).optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const transactionsSchema = z.array(transactionSchema);
