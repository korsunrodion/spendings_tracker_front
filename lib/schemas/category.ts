import { z } from "zod";

export const categorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  subCategories: z.array(z.string()).optional(),
  aiDescription: z.string().optional(),
  budget: z.number().optional(),
  group: z.string().optional(),
  position: z.number().optional(),
  currentAmount: z.number().optional(),
});

export type Category = z.infer<typeof categorySchema>;

export const categoriesSchema = z.array(categorySchema);

export const categoryGroupSchema = z.object({
  _id: z.string(),
  name: z.string(),
  position: z.number(),
  categories: z.array(categorySchema),
  type: z.enum(["income", "expense"]),
  deletedAt: z.iso.datetime().optional(),
});

export type CategoryGroup = z.infer<typeof categoryGroupSchema>;

export const categoryGroupsSchema = z.array(categoryGroupSchema);
