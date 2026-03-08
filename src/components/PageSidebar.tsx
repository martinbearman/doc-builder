"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addPage, setCurrentPage, removePage } from "@/store/slices/documentSlice";
import { clsx } from "clsx";
import { PlusIcon } from "@radix-ui/react-icons";

export function PageSidebar() {
  const dispatch = useAppDispatch();
  const { pages, currentPageId } = useAppSelector((s) => s.document);

  return (
    <aside className="w-48 shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
        Pages
      </span>
      <div className="flex flex-col gap-1 flex-1 min-h-0 overflow-auto">
        {pages.map((page, idx) => (
          <div key={page.id} className="flex items-center gap-1 group">
            <button
              type="button"
              onClick={() => dispatch(setCurrentPage(page.id))}
              className={clsx(
                "flex-1 min-w-0 text-left px-2 py-1.5 rounded text-sm border truncate",
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
                className="p-1 text-zinc-400 hover:text-red-600 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove page ${idx + 1}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => dispatch(addPage())}
        className="mt-2 flex items-center justify-center gap-1.5 w-full px-2 py-2 rounded border border-dashed border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm"
        aria-label="Add page"
      >
        <PlusIcon className="size-4" />
        Add page
      </button>
    </aside>
  );
}
