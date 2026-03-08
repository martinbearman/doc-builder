# Document Builder

A standalone document builder app with multiple pages, 2D block layout, context selection, and LLM-assisted Q&A with block highlighting.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS
- **Package manager:** pnpm
- **State:** Redux Toolkit + react-redux
- **Drag-and-drop:** @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (rectSortingStrategy for 2D)
- **LLM:** Vercel AI SDK + OpenAI (streaming + tool for block highlighting)
- **Validation:** Zod

## Setup

```bash
pnpm install
```

Optional: add `.env.local` with your OpenAI API key for real LLM responses:

```
OPENAI_API_KEY=sk-...
```

Without it, the chat API returns a short demo message.

## Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Page size:** A4, A5, Letter, A3
- **Multiple pages:** Add/remove pages, switch via tabs
- **Blocks:** Heading (1–3), Paragraph, Bullets, Table, Image. Add via toolbar; click to edit inline; drag handle to reorder (2D grid).
- **Markdown:** Block text is rendered as Markdown (plain strings in data).
- **Context (C):** Toggle context mode, click blocks to select; selected blocks are sent with LLM questions.
- **Context bucket:** Add URL (or PDF key) references; “Resolve” fetches URL content for the LLM.
- **LLM panel:** Ask questions; response streams. If the model calls the highlight tool, blocks are highlighted with optional per-block suggestions. “Clear suggestions” resets.
- **Export:** PDF/Word can be added later (see spec).

## Project structure

- `src/types/` — Block, page, document, context bucket types + Zod
- `src/store/` — Redux store and slices (document, context mode, bucket, LLM)
- `src/components/` — DocumentBuilderView, PageCanvas, SortableBlock, BlockContent, BlockEditor, ContextBucketPanel, LLMPanel, Providers
- `src/lib/` — defaultBlocks, markdown renderer
- `src/app/api/chat/` — LLM stream + highlight_blocks tool
- `src/app/api/context/` — Fetch URL text for context bucket
