"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addBlock, setPageSize, addPage, setCurrentPage, removePage } from "@/store/slices/documentSlice";
import { toggleContextMode } from "@/store/slices/contextModeSlice";
import type { PageSize } from "@/types/document";
import { createBlock } from "@/lib/defaultBlocks";
import { PageCanvas } from "./PageCanvas";
import { ContextBucketPanel } from "./ContextBucketPanel";
import { LLMPanel } from "./LLMPanel";
import { clsx } from "clsx";
import {
  HeadingIcon,
  PilcrowIcon,
  ListBulletIcon,
  TableIcon,
  ImageIcon,
} from "@radix-ui/react-icons";

export function DocumentBuilderView() {
  const dispatch = useAppDispatch();
  const { pages, currentPageId, pageSize } = useAppSelector((s) => s.document);
  const contextModeEnabled = useAppSelector(
    (s) => s.contextMode.contextModeEnabled
  );

  return (
    <div className="flex flex-col h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Toolbar */}
      <header className="shrink-0 flex flex-wrap items-center gap-4 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
              onClick={() =>
                dispatch(
                  addBlock({
                    pageId: currentPageId,
                    block: createBlock(type),
                  })
                )
              }
              className="p-2 rounded border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label={`Add ${type} block`}
              title={type}
            >
              <Icon className="size-4" />
            </button>
          ))}
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
          onClick={() => dispatch(addPage())}
          className="text-sm px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          + Add page
        </button>
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
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Main canvas */}
        <main className="flex-1 overflow-auto p-6 flex justify-center">
          <div className="space-y-4">
            {/* Page tabs */}
            <div className="flex flex-wrap gap-2 justify-center">
              {pages.map((page, idx) => (
                <div key={page.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => dispatch(setCurrentPage(page.id))}
                    className={clsx(
                      "px-3 py-1.5 rounded text-sm border",
                      currentPageId === page.id
                        ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200"
                        : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    )}
                  >
                    Page {idx + 1}
                  </button>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => dispatch(removePage(page.id))}
                      className="p-1 text-zinc-400 hover:text-red-600 text-xs"
                      aria-label={`Remove page ${idx + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <PageCanvas />
          </div>
        </main>

        {/* Sidebar: context bucket + LLM */}
        <aside className="w-80 shrink-0 border-l border-zinc-200 dark:border-zinc-800 p-4 space-y-4 overflow-auto bg-white dark:bg-zinc-900">
          <ContextBucketPanel />
          <LLMPanel />
        </aside>
      </div>
    </div>
  );
}
