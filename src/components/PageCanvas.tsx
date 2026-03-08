"use client";

import { useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { reorderBlocks } from "@/store/slices/documentSlice";
import { GRID_COLUMNS } from "@/config";
import { createBlockPosition, getBlockGridSpan } from "@/types/document";
import type { DocumentBlock } from "@/types/document";
import { SortableBlock } from "./SortableBlock";

export type PageCanvasProps = {
  contentAreaRef?: React.RefObject<HTMLDivElement | null>;
};

function sortBlocksByPosition(blocks: DocumentBlock[]): DocumentBlock[] {
  return [...blocks].sort((a, b) => {
    if (a.position.rowIndex !== b.position.rowIndex)
      return a.position.rowIndex - b.position.rowIndex;
    return a.position.columnIndex - b.position.columnIndex;
  });
}

export function PageCanvas({ contentAreaRef }: PageCanvasProps) {
  const dispatch = useAppDispatch();
  const { pages, currentPageId, pageSize } = useAppSelector((s) => s.document);
  const { contextModeEnabled, selectedBlockIds } = useAppSelector(
    (s) => s.contextMode
  );
  const { highlightedBlockIds, suggestionsByBlockId } = useAppSelector(
    (s) => s.llm
  );

  const page = pages.find((p) => p.id === currentPageId);
  const sortedBlocks = page ? sortBlocksByPosition(page.blocks) : [];
  const blockIds = sortedBlocks.map((b) => b.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !page) return;
      const oldIndex = blockIds.indexOf(active.id as string);
      const newIndex = blockIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(sortedBlocks, oldIndex, newIndex);
      const newPositions = reordered.map((block, i) => ({
        blockId: block.id,
        position: createBlockPosition(i, 0),
      }));
      dispatch(
        reorderBlocks({
          pageId: currentPageId,
          activeId: active.id as string,
          overId: over.id as string,
          newPositions,
        })
      );
    },
    [blockIds, currentPageId, dispatch, page, sortedBlocks]
  );

  // Exact physical proportions; size independent of content so canvas is
  // always full page when empty; content scrolls inside.
  const pageStyles: Record<
    string,
    { width: string; aspectRatio: string }
  > = {
    a4: { width: "210mm", aspectRatio: "210 / 297" },
    a5: { width: "148mm", aspectRatio: "148 / 210" },
    letter: { width: "8.5in", aspectRatio: "8.5 / 11" },
    a3: { width: "297mm", aspectRatio: "297 / 420" },
  };
  const style = pageStyles[pageSize] ?? pageStyles.a4;

  return (
    <div
      className="bg-white dark:bg-zinc-900 shadow-lg rounded-lg overflow-hidden shrink-0 relative"
      style={{
        width: style.width,
        maxWidth: "100%",
        aspectRatio: style.aspectRatio,
      }}
    >
      <div
        ref={contentAreaRef}
        className="absolute inset-0 overflow-auto p-6"
      >
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={blockIds}
            strategy={rectSortingStrategy}
          >
            <div
              className="grid gap-3 w-full"
              style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)` }}
            >
              {sortedBlocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  pageId={currentPageId}
                  gridColumnSpan={getBlockGridSpan(block)}
                  isContextMode={contextModeEnabled}
                  isSelected={selectedBlockIds.includes(block.id)}
                  isHighlighted={highlightedBlockIds.includes(block.id)}
                  suggestion={suggestionsByBlockId[block.id]}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
