"use client";

import { useState, useEffect } from "react";
import type { DocumentBlock, BlockWidth } from "@/types/document";
import { useAppDispatch } from "@/store/hooks";
import { updateBlock } from "@/store/slices/documentSlice";

type BlockEditorProps = {
  block: DocumentBlock;
  pageId: string;
  onDone: () => void;
};

export function BlockEditor({ block, pageId, onDone }: BlockEditorProps) {
  const dispatch = useAppDispatch();
  const [local, setLocal] = useState<DocumentBlock>(block);

  useEffect(() => {
    setLocal(block);
  }, [block]);

  const save = () => {
    dispatch(updateBlock({ pageId, blockId: block.id, updates: local }));
    onDone();
  };

  const widthOptions: { value: BlockWidth; label: string }[] = [
    { value: "full", label: "100%" },
    { value: "half", label: "50%" },
    { value: "third", label: "33%" },
  ];

  const handleWidthChange = (width: BlockWidth) => {
    setLocal((prev) => ({ ...prev, width }));
    dispatch(updateBlock({ pageId, blockId: block.id, updates: { width } }));
  };

  const widthSelector = (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500">Width:</span>
      <select
        value={local.width ?? "full"}
        onChange={(e) => handleWidthChange(e.target.value as BlockWidth)}
        className="text-sm border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800"
      >
        {widthOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  switch (local.type) {
    case "heading":
      return (
        <div className="space-y-2">
          {widthSelector}
          <select
            value={local.level}
            onChange={(e) =>
              setLocal({
                ...local,
                level: Number(e.target.value) as 1 | 2 | 3,
              })
            }
            className="border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800"
          >
            <option value={1}>Heading 1</option>
            <option value={2}>Heading 2</option>
            <option value={3}>Heading 3</option>
          </select>
          <textarea
            value={local.text}
            onChange={(e) => setLocal({ ...local, text: e.target.value })}
            className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 min-h-[2rem] bg-white dark:bg-zinc-800"
            rows={2}
            autoFocus
          />
          <button
            type="button"
            onClick={save}
            className="text-sm bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 px-3 py-1 rounded"
          >
            Done
          </button>
        </div>
      );
    case "paragraph":
      return (
        <div className="space-y-2">
          {widthSelector}
          <textarea
            value={local.text}
            onChange={(e) => setLocal({ ...local, text: e.target.value })}
            className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 min-h-[4rem] bg-white dark:bg-zinc-800"
            rows={4}
            autoFocus
          />
          <button
            type="button"
            onClick={save}
            className="text-sm bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 px-3 py-1 rounded"
          >
            Done
          </button>
        </div>
      );
    case "bullets":
      return (
        <div className="space-y-2">
          {widthSelector}
          {local.items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const next = [...local.items];
                  next[i] = e.target.value;
                  setLocal({ ...local, items: next });
                }}
                className="flex-1 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800"
              />
              <button
                type="button"
                onClick={() => {
                  const next = local.items.filter((_, j) => j !== i);
                  setLocal({ ...local, items: next.length ? next : [""] });
                }}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setLocal({ ...local, items: [...local.items, ""] })
            }
            className="text-sm text-zinc-600 dark:text-zinc-400"
          >
            + Add item
          </button>
          <button
            type="button"
            onClick={save}
            className="block text-sm bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 px-3 py-1 rounded mt-2"
          >
            Done
          </button>
        </div>
      );
    case "table":
      return (
        <div className="space-y-2 overflow-x-auto">
          {widthSelector}
          <div>
            <span className="text-xs text-zinc-500">Headers</span>
            <div className="flex gap-2 flex-wrap">
              {local.headers.map((h, i) => (
                <input
                  key={i}
                  type="text"
                  value={h}
                  onChange={(e) => {
                    const next = [...local.headers];
                    next[i] = e.target.value;
                    setLocal({ ...local, headers: next });
                  }}
                  className="w-24 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800"
                />
              ))}
              <button
                type="button"
                onClick={() =>
                  setLocal({
                    ...local,
                    headers: [...local.headers, ""],
                    rows: local.rows.map((r) => [...r, ""]),
                  })
                }
                className="text-sm text-zinc-600"
              >
                + Col
              </button>
            </div>
          </div>
          <div>
            <span className="text-xs text-zinc-500">Rows</span>
            {local.rows.map((row, ri) => (
              <div key={ri} className="flex gap-2 flex-wrap items-center mt-1">
                {row.map((cell, ci) => (
                  <input
                    key={ci}
                    type="text"
                    value={cell}
                    onChange={(e) => {
                      const next = local.rows.map((r) => [...r]);
                      next[ri]![ci] = e.target.value;
                      setLocal({ ...local, rows: next });
                    }}
                    className="w-24 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const next = local.rows.filter((_, j) => j !== ri);
                    setLocal({
                      ...local,
                      rows: next.length ? next : [local.headers.map(() => "")],
                    });
                  }}
                  className="text-red-600 text-sm"
                >
                  Remove row
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setLocal({
                  ...local,
                  rows: [
                    ...local.rows,
                    local.headers.map(() => ""),
                  ],
                })
              }
              className="text-sm text-zinc-600 mt-1"
            >
              + Add row
            </button>
          </div>
          <button
            type="button"
            onClick={save}
            className="block text-sm bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 px-3 py-1 rounded mt-2"
          >
            Done
          </button>
        </div>
      );
    case "image":
      return (
        <div className="space-y-2">
          {widthSelector}
          <input
            type="url"
            placeholder="Image URL"
            value={local.url}
            onChange={(e) => setLocal({ ...local, url: e.target.value })}
            className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800"
          />
          <input
            type="text"
            placeholder="Alt text"
            value={local.alt ?? ""}
            onChange={(e) => setLocal({ ...local, alt: e.target.value })}
            className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800"
          />
          <input
            type="text"
            placeholder="Caption"
            value={local.caption ?? ""}
            onChange={(e) => setLocal({ ...local, caption: e.target.value })}
            className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-800"
          />
          <button
            type="button"
            onClick={save}
            className="text-sm bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 px-3 py-1 rounded"
          >
            Done
          </button>
        </div>
      );
    default:
      return null;
  }
}
