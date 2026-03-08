"use client";

import { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setHighlight, clearSuggestions, setLastResponse } from "@/store/slices/llmSlice";
import type { DocumentBlock } from "@/types/document";
import type { SelectedBlockContext } from "@/types/context";

function blockToSummary(block: DocumentBlock): string {
  switch (block.type) {
    case "heading":
      return `[Heading ${block.level}] ${block.text}`;
    case "paragraph":
      return block.text;
    case "bullets":
      return block.items.join(" • ");
    case "table":
      const headerLine = block.headers.join(" | ");
      const rowLines = block.rows.map((r) => r.join(" | "));
      return [headerLine, ...rowLines].join("\n");
    case "image":
      return [block.url, block.alt, block.caption].filter(Boolean).join(" — ");
    default:
      return "";
  }
}

export function LLMPanel() {
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const replyEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const { pages, currentPageId } = useAppSelector((s) => s.document);
  const { contextModeEnabled, selectedBlockIds } = useAppSelector(
    (s) => s.contextMode
  );
  const { items } = useAppSelector((s) => s.contextBucket);

  const page = pages.find((p) => p.id === currentPageId);
  const selectedBlocks = page
    ? page.blocks.filter((b) => selectedBlockIds.includes(b.id))
    : [];
  const selectedContext: SelectedBlockContext[] = selectedBlocks.map((b) => ({
    blockId: b.id,
    type: b.type,
    summary: blockToSummary(b),
  }));
  const bucketText = items
    .filter((i) => i.resolvedText)
    .map((i) => (i.label ? `[${i.label}]\n${i.resolvedText}` : i.resolvedText))
    .join("\n\n---\n\n");

  useEffect(() => {
    replyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamedText]);

  const handleSubmit = async () => {
    const message = input.trim();
    if (!message || streaming) return;
    setStreaming(true);
    setStreamedText("");
    dispatch(clearSuggestions());

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          selectedContext,
          bucketText: bucketText || undefined,
        }),
      });
      if (!res.ok || !res.body) {
        setStreamedText("Error: " + (res.statusText || "Failed to stream"));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let highlightPayload: { blockIds?: string[]; suggestions?: Record<string, string> } | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                full += parsed.text;
                setStreamedText(full);
              }
              if (parsed.highlight) {
                highlightPayload = parsed.highlight;
              }
            } catch {
              // ignore parse errors for non-JSON lines
            }
          }
        }
      }

      dispatch(setLastResponse(full));
      if (highlightPayload?.blockIds?.length) {
        dispatch(
          setHighlight({
            blockIds: highlightPayload.blockIds,
            suggestions: highlightPayload.suggestions,
          })
        );
      }
    } catch (err) {
      setStreamedText("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden flex flex-col">
      <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 font-medium">
        Ask about the document
      </div>
      <div className="p-3 space-y-2">
        <textarea
          placeholder={
            contextModeEnabled && selectedBlockIds.length > 0
              ? "Ask about the selected content…"
              : "Ask about the document or select blocks and enable Context (C)…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-2 bg-white dark:bg-zinc-800 text-sm min-h-[80px] resize-y"
          disabled={streaming}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={streaming || !input.trim()}
            className="text-sm bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 px-3 py-1.5 rounded disabled:opacity-50"
          >
            {streaming ? "Sending…" : "Send"}
          </button>
          <button
            type="button"
            onClick={() => dispatch(clearSuggestions())}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            Clear suggestions
          </button>
        </div>
      </div>
      {streamedText && (
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 max-h-60 overflow-auto text-sm whitespace-pre-wrap">
          {streamedText}
          <div ref={replyEndRef} />
        </div>
      )}
    </div>
  );
}
