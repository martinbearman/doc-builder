import type {
  DocumentBlock,
  HeadingBlock,
  ParagraphBlock,
  BulletsBlock,
  TableBlock,
  ImageBlock,
} from "@/types/document";
import { createBlockPosition } from "@/types/document";

function uid() {
  return crypto.randomUUID();
}

export function createHeadingBlock(): HeadingBlock {
  return {
    id: uid(),
    type: "heading",
    level: 1,
    text: "New Heading",
    position: createBlockPosition(0, 0),
  };
}

export function createParagraphBlock(): ParagraphBlock {
  return {
    id: uid(),
    type: "paragraph",
    text: "",
    position: createBlockPosition(0, 0),
  };
}

export function createBulletsBlock(): BulletsBlock {
  return {
    id: uid(),
    type: "bullets",
    items: [""],
    position: createBlockPosition(0, 0),
  };
}

export function createTableBlock(): TableBlock {
  return {
    id: uid(),
    type: "table",
    headers: [""],
    rows: [[""]],
    position: createBlockPosition(0, 0),
  };
}

export function createImageBlock(): ImageBlock {
  return {
    id: uid(),
    type: "image",
    url: "",
    position: createBlockPosition(0, 0),
  };
}

export function createBlock(type: DocumentBlock["type"]): DocumentBlock {
  switch (type) {
    case "heading":
      return createHeadingBlock();
    case "paragraph":
      return createParagraphBlock();
    case "bullets":
      return createBulletsBlock();
    case "table":
      return createTableBlock();
    case "image":
      return createImageBlock();
    default:
      return createParagraphBlock();
  }
}
