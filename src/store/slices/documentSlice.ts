import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  DocumentBlock,
  Page,
  PageSize,
  BlockPosition,
} from "@/types/document";
import {
  createEmptyPage,
  getNextPosition,
  createBlockPosition,
} from "@/types/document";

function sortBlocksByPosition(blocks: DocumentBlock[]): DocumentBlock[] {
  return [...blocks].sort((a, b) => {
    if (a.position.rowIndex !== b.position.rowIndex)
      return a.position.rowIndex - b.position.rowIndex;
    return a.position.columnIndex - b.position.columnIndex;
  });
}

const initialState = {
  pages: [createEmptyPage()] as Page[],
  currentPageId: "" as string,
  pageSize: "a4" as PageSize,
};

// Set currentPageId to first page id when initializing
const firstPageId = initialState.pages[0]!.id;
initialState.currentPageId = firstPageId;

export const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setPageSize(state, action: PayloadAction<PageSize>) {
      state.pageSize = action.payload;
    },
    addPage(state) {
      const newPage = createEmptyPage();
      state.pages.push(newPage);
      state.currentPageId = newPage.id;
    },
    removePage(state, action: PayloadAction<string>) {
      const idx = state.pages.findIndex((p) => p.id === action.payload);
      if (idx === -1) return;
      state.pages.splice(idx, 1);
      if (state.pages.length === 0) {
        state.pages.push(createEmptyPage());
      }
      if (state.currentPageId === action.payload) {
        state.currentPageId = state.pages[Math.max(0, idx - 1)]!.id;
      }
    },
    setCurrentPage(state, action: PayloadAction<string>) {
      if (state.pages.some((p) => p.id === action.payload)) {
        state.currentPageId = action.payload;
      }
    },
    setBlocks(state, action: PayloadAction<{ pageId: string; blocks: DocumentBlock[] }>) {
      const page = state.pages.find((p) => p.id === action.payload.pageId);
      if (page) page.blocks = action.payload.blocks;
    },
    addBlock(state, action: PayloadAction<{ pageId: string; block: DocumentBlock }>) {
      const page = state.pages.find((p) => p.id === action.payload.pageId);
      if (!page) return;
      const pos = getNextPosition(page.blocks);
      const block = { ...action.payload.block, position: pos };
      page.blocks.push(block);
    },
    updateBlock(
      state,
      action: PayloadAction<{ pageId: string; blockId: string; updates: Partial<DocumentBlock> }>
    ) {
      const page = state.pages.find((p) => p.id === action.payload.pageId);
      if (!page) return;
      const block = page.blocks.find((b) => b.id === action.payload.blockId);
      if (!block) return;
      Object.assign(block, action.payload.updates);
    },
    removeBlock(state, action: PayloadAction<{ pageId: string; blockId: string }>) {
      const page = state.pages.find((p) => p.id === action.payload.pageId);
      if (page) {
        page.blocks = page.blocks.filter((b) => b.id !== action.payload.blockId);
      }
    },
    reorderBlocks(
      state,
      action: PayloadAction<{
        pageId: string;
        activeId: string;
        overId: string;
        newPositions: { blockId: string; position: BlockPosition }[];
      }>
    ) {
      const page = state.pages.find((p) => p.id === action.payload.pageId);
      if (!page) return;
      for (const { blockId, position } of action.payload.newPositions) {
        const block = page.blocks.find((b) => b.id === blockId);
        if (block) block.position = position;
      }
      page.blocks = sortBlocksByPosition(page.blocks);
    },
    setBlockPosition(
      state,
      action: PayloadAction<{
        pageId: string;
        blockId: string;
        position: BlockPosition;
      }>
    ) {
      const page = state.pages.find((p) => p.id === action.payload.pageId);
      if (!page) return;
      const block = page.blocks.find((b) => b.id === action.payload.blockId);
      if (block) block.position = action.payload.position;
      page.blocks = sortBlocksByPosition(page.blocks);
    },
  },
});

export const {
  setPageSize,
  addPage,
  removePage,
  setCurrentPage,
  setBlocks,
  addBlock,
  updateBlock,
  removeBlock,
  reorderBlocks,
  setBlockPosition,
} = documentSlice.actions;

export default documentSlice.reducer;
