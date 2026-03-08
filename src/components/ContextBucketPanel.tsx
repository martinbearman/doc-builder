"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem, removeItem, setResolvedText } from "@/store/slices/contextBucketSlice";
import { clsx } from "clsx";

export function ContextBucketPanel() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.contextBucket.items);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"url" | "pdf">("url");

  const handleAdd = () => {
    const value = type === "url" ? url : url.trim();
    if (!value) return;
    dispatch(addItem({ type, urlOrKey: value, label: label || undefined }));
    setUrl("");
    setLabel("");
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 text-left font-medium"
      >
        <span>References / Context bucket</span>
        <span className="text-zinc-500">{open ? "▼" : "▶"}</span>
      </button>
      {open && (
        <div className="p-3 space-y-3 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "url" | "pdf")}
              className="border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800 text-sm"
            >
              <option value="url">URL</option>
              <option value="pdf">PDF (URL or key)</option>
            </select>
            <input
              type="text"
              placeholder={type === "url" ? "https://..." : "PDF URL or key"}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 min-w-0 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800 text-sm"
            />
          </div>
          <input
            type="text"
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800 text-sm"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="text-sm bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900 px-3 py-1 rounded"
          >
            Add reference
          </button>
          <ul className="space-y-2 max-h-40 overflow-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 text-sm py-1 border-b border-zinc-100 dark:border-zinc-800"
              >
                <span className="truncate min-w-0" title={item.urlOrKey}>
                  {item.label || item.urlOrKey}
                </span>
                <span
                  className={clsx(
                    "text-xs shrink-0",
                    item.resolvedText ? "text-green-600 dark:text-green-400" : "text-zinc-400"
                  )}
                >
                  {item.resolvedText ? "Resolved" : "Pending"}
                </span>
                {!item.resolvedText && item.type === "url" && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const r = await fetch("/api/context", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: item.type,
                            urlOrKey: item.urlOrKey,
                          }),
                        });
                        const data = await r.json();
                        if (data.text)
                          dispatch(setResolvedText({ id: item.id, text: data.text }));
                      } catch {
                        // ignore
                      }
                    }}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:underline shrink-0"
                  >
                    Resolve
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(removeItem(item.id))}
                  className="text-red-600 hover:underline shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
