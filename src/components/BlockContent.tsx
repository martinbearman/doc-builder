"use client";

import type { DocumentBlock } from "@/types/document";
import { Markdown } from "@/lib/markdown";

export function BlockContent({ block }: { block: DocumentBlock }) {
  switch (block.type) {
    case "heading": {
      const Tag = (`h${block.level}` as "h1" | "h2" | "h3");
      return (
        <Tag className="font-semibold text-zinc-900 dark:text-zinc-100">
          <Markdown content={block.text} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <div className="text-zinc-700 dark:text-zinc-300">
          <Markdown content={block.text} />
        </div>
      );
    case "bullets":
      return (
        <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
          {block.items.map((item, i) => (
            <li key={i}>
              <Markdown content={item} />
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-zinc-200 dark:border-zinc-700 text-sm">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800">
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="border-b border-zinc-200 dark:border-zinc-700 px-3 py-2 text-left font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-zinc-100 dark:border-zinc-800">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "image":
      return (
        <figure>
          {block.url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={block.url}
              alt={block.alt ?? ""}
              className="max-w-full h-auto rounded border border-zinc-200 dark:border-zinc-700"
            />
          ) : (
            <div className="flex items-center justify-center min-h-[120px] rounded border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-sm">
              No image URL
            </div>
          )}
          {block.caption && (
            <figcaption className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
}
