import { z } from "zod";

// Block position for 2D layout (row and column)
export const blockPositionSchema = z.object({
  rowIndex: z.number(),
  columnIndex: z.number(),
});
export type BlockPosition = z.infer<typeof blockPositionSchema>;

// Heading block
export const headingBlockSchema = z.object({
  id: z.string(),
  type: z.literal("heading"),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  text: z.string(),
  position: blockPositionSchema,
});
export type HeadingBlock = z.infer<typeof headingBlockSchema>;

// Paragraph block
export const paragraphBlockSchema = z.object({
  id: z.string(),
  type: z.literal("paragraph"),
  text: z.string(),
  position: blockPositionSchema,
});
export type ParagraphBlock = z.infer<typeof paragraphBlockSchema>;

// Bullets block
export const bulletsBlockSchema = z.object({
  id: z.string(),
  type: z.literal("bullets"),
  items: z.array(z.string()),
  position: blockPositionSchema,
});
export type BulletsBlock = z.infer<typeof bulletsBlockSchema>;

// Table block
export const tableBlockSchema = z.object({
  id: z.string(),
  type: z.literal("table"),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  position: blockPositionSchema,
});
export type TableBlock = z.infer<typeof tableBlockSchema>;

// Image block
export const imageBlockSchema = z.object({
  id: z.string(),
  type: z.literal("image"),
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  position: blockPositionSchema,
});
export type ImageBlock = z.infer<typeof imageBlockSchema>;

// Document block union
export const documentBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  bulletsBlockSchema,
  tableBlockSchema,
  imageBlockSchema,
]);
export type DocumentBlock =
  | HeadingBlock
  | ParagraphBlock
  | BulletsBlock
  | TableBlock
  | ImageBlock;

// Page
export const pageSchema = z.object({
  id: z.string(),
  blocks: z.array(documentBlockSchema),
});
export type Page = z.infer<typeof pageSchema>;

// Page size
export const pageSizeSchema = z.enum(["a4", "a5", "letter", "a3"]);
export type PageSize = z.infer<typeof pageSizeSchema>;

// Document
export const documentSchema = z.object({
  pages: z.array(pageSchema),
  currentPageId: z.string(),
  pageSize: pageSizeSchema,
});
export type Document = z.infer<typeof documentSchema>;

// Helpers
export function createBlockPosition(row: number, col: number): BlockPosition {
  return { rowIndex: row, columnIndex: col };
}

export function createEmptyPage(id?: string): Page {
  return {
    id: id ?? crypto.randomUUID(),
    blocks: [],
  };
}

export function getNextPosition(blocks: DocumentBlock[]): BlockPosition {
  if (blocks.length === 0) return { rowIndex: 0, columnIndex: 0 };
  let maxRow = -1;
  let maxCol = -1;
  for (const b of blocks) {
    maxRow = Math.max(maxRow, b.position.rowIndex);
    maxCol = Math.max(maxCol, b.position.columnIndex);
  }
  return { rowIndex: maxRow + 1, columnIndex: 0 };
}
