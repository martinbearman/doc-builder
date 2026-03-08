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
import { createBlockPosition } from "@/types/document";
import type { DocumentBlock } from "@/types/document";
import { SortableBlock } from "./SortableBlock";

const COLUMNS = 2;

function sortBlocksByPosition(blocks: DocumentBlock[]): DocumentBlock[] {
  return [...blocks].sort((a, b) => {
    if (a.position.rowIndex !== b.position.rowIndex)
      return a.position.rowIndex - b.position.rowIndex;
    return a.position.columnIndex - b.position.columnIndex;
  });
}

export function PageCanvas() {
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
        position: createBlockPosition(
          Math.floor(i / COLUMNS),
          i % COLUMNS
        ),
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

  const aspectRatios: Record<string, string> = {
    a4: "210 / 297",
    a5: "148 / 210",
    letter: "8.5 / 11",
    a3: "297 / 420",
  };
  const aspectRatio = aspectRatios[pageSize] ?? "210 / 297";

  return (
    <div
      className="bg-white dark:bg-zinc-900 shadow-lg rounded-lg overflow-hidden flex flex-col"
      style={{
        maxWidth: "min(21cm, 100%)",
        aspectRatio,
      }}
    >
      <div className="flex-1 overflow-auto p-6">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={blockIds}
            strategy={rectSortingStrategy}
          >
            <div
              className="grid gap-3 w-full"
              style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)` }}
            >
              {sortedBlocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  pageId={currentPageId}
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
