"use client";

import { useRef, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addBlock, setPageSize } from "@/store/slices/documentSlice";
import { toggleContextMode } from "@/store/slices/contextModeSlice";
import type { PageSize } from "@/types/document";
import { createBlock } from "@/lib/defaultBlocks";
import { ESTIMATED_BLOCK_HEIGHT } from "@/config";
import { PageCanvas } from "./PageCanvas";
import { PageSidebar } from "./PageSidebar";
import { ContextBucketPanel } from "./ContextBucketPanel";
import { LLMPanel } from "./LLMPanel";
import { clsx } from "clsx";
import {
  HeadingIcon,
  PilcrowIcon,
  ListBulletIcon,
  TableIcon,
  ImageIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";

export function DocumentBuilderView() {
  const dispatch = useAppDispatch();
  const { pages, currentPageId, pageSize } = useAppSelector((s) => s.document);
  const contextModeEnabled = useAppSelector(
    (s) => s.contextMode.contextModeEnabled
  );
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const [pageHasRoom, setPageHasRoom] = useState(true);
  const [showPageFullMessage, setShowPageFullMessage] = useState(false);

  const page = pages.find((p) => p.id === currentPageId);
  const blockCount = page?.blocks.length ?? 0;

  const measurePageHasRoom = () => {
    const container = contentAreaRef.current;
    const grid = container?.querySelector<HTMLElement>("[data-page-content]");
    if (!container || !grid || container.clientHeight === 0) return;
    const contentHeight = grid.getBoundingClientRect().height;
    const availableHeight = container.clientHeight;
    setPageHasRoom(
      contentHeight + ESTIMATED_BLOCK_HEIGHT <= availableHeight
    );
  };

  useEffect(() => {
    if (blockCount === 0) {
      setPageHasRoom(true);
      return;
    }
    const id = setTimeout(measurePageHasRoom, 0);
    return () => clearTimeout(id);
  }, [currentPageId, blockCount]);

  const handleAddBlock = (type: Parameters<typeof createBlock>[0]) => {
    if (blockCount === 0) {
      dispatch(
        addBlock({
          pageId: currentPageId,
          block: createBlock(type),
        })
      );
      return;
    }
    const container = contentAreaRef.current;
    const grid = container?.querySelector<HTMLElement>("[data-page-content]");
    if (container && grid && container.clientHeight > 0) {
      const contentHeight = grid.getBoundingClientRect().height;
      const availableHeight = container.clientHeight;
      if (contentHeight + ESTIMATED_BLOCK_HEIGHT > availableHeight) {
        setShowPageFullMessage(true);
        setTimeout(() => setShowPageFullMessage(false), 2000);
        return;
      }
    }
    dispatch(
      addBlock({
        pageId: currentPageId,
        block: createBlock(type),
      })
    );
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Toolbar */}
      <header className="no-print shrink-0 flex flex-wrap items-center gap-4 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <span className="font-semibold text-lg">Document Builder</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Add:</span>
          {(
            [
              { type: "heading", Icon: HeadingIcon },
              { type: "paragraph", Icon: PilcrowIcon },
              { type: "bullets", Icon: ListBulletIcon },
              { type: "table", Icon: TableIcon },
              { type: "image", Icon: ImageIcon },
            ] as const
          ).map(({ type, Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleAddBlock(type)}
              disabled={!pageHasRoom}
              className="p-2 rounded border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none"
              aria-label={`Add ${type} block`}
              title={pageHasRoom ? type : "Page full"}
            >
              <Icon className="size-4" />
            </button>
          ))}
        {showPageFullMessage && (
          <span className="text-sm text-amber-600 dark:text-amber-400">
            Page full
          </span>
        )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Page size:</span>
          <select
            value={pageSize}
            onChange={(e) =>
              dispatch(setPageSize(e.target.value as PageSize))
            }
            className="text-sm border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800"
          >
            <option value="a4">A4</option>
            <option value="a5">A5</option>
            <option value="letter">Letter</option>
            <option value="a3">A3</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => dispatch(toggleContextMode())}
          className={clsx(
            "text-sm font-medium px-3 py-1 rounded border",
            contextModeEnabled
              ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200"
              : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          C — Context
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Export as PDF (opens print dialog)"
        >
          <DownloadIcon className="size-4" />
          Export PDF
        </button>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="no-print">
          <PageSidebar />
        </div>
        {/* Main canvas */}
        <main className="flex-1 overflow-auto p-6 flex justify-center">
          <PageCanvas contentAreaRef={contentAreaRef} />
        </main>

        {/* Sidebar: context bucket + LLM */}
        <aside className="no-print w-80 shrink-0 border-l border-zinc-200 dark:border-zinc-800 p-4 space-y-4 overflow-auto bg-white dark:bg-zinc-900">
          <ContextBucketPanel />
          <LLMPanel />
        </aside>
      </div>
    </div>
  );
}
