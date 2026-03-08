"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DocumentBlock } from "@/types/document";
import { BlockContent } from "./BlockContent";
import { BlockEditor } from "./BlockEditor";
import { useAppDispatch } from "@/store/hooks";
import { removeBlock } from "@/store/slices/documentSlice";
import { toggleBlockSelection } from "@/store/slices/contextModeSlice";
import { clsx } from "clsx";

type SortableBlockProps = {
  block: DocumentBlock;
  pageId: string;
  isContextMode: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  suggestion?: string;
};

export function SortableBlock({
  block,
  pageId,
  isContextMode,
  isSelected,
  isHighlighted,
  suggestion,
}: SortableBlockProps) {
  const [editing, setEditing] = useState(false);
  const dispatch = useAppDispatch();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { block, pageId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleBlockClick = () => {
    if (isContextMode) {
      dispatch(toggleBlockSelection(block.id));
    } else if (!editing) {
      setEditing(true);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group flex items-start gap-2 rounded-lg border p-3 transition-colors",
        isDragging && "opacity-50 shadow-lg z-10",
        isSelected && "ring-2 ring-green-500",
        isHighlighted && "ring-2 ring-amber-500 border-amber-500",
        !isSelected && !isHighlighted && "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
      )}
    >
      {!editing && (
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GrabIcon />
        </button>
      )}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={handleBlockClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleBlockClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Edit block"
      >
        {editing ? (
          <BlockEditor
            block={block}
            pageId={pageId}
            onDone={() => setEditing(false)}
          />
        ) : (
          <>
            <BlockContent block={block} />
            {suggestion && (
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
                {suggestion}
              </div>
            )}
          </>
        )}
      </div>
      {!editing && (
        <button
          type="button"
          className="shrink-0 p-1 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove block"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(removeBlock({ pageId, blockId: block.id }));
          }}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

function GrabIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M7 2a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h2zm6 0a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V4a2 2 0 012-2h2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4m1 4h6m-6 0h-2" />
    </svg>
  );
}
