import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  budget: z.number(),
  currentAmount: z.number(),
});

export type Category = z.infer<typeof categorySchema>;

export const categoriesSchema = z.array(categorySchema);
