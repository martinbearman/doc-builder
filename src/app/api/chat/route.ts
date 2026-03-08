import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { tool } from "ai";
import { z } from "zod";

const highlightTool = tool({
  description:
    "Call this to highlight specific document blocks and optionally show per-block suggestion text. Use when suggesting edits or pointing the user to blocks to change.",
  inputSchema: z.object({
    blockIds: z.array(z.string()).describe("IDs of blocks to highlight"),
    suggestions: z
      .record(z.string(), z.string())
      .optional()
      .describe("Optional map of blockId -> suggestion text to show on that block"),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body.message ?? "");
    const selectedContext = Array.isArray(body.selectedContext)
      ? body.selectedContext
      : [];
    const bucketText = typeof body.bucketText === "string" ? body.bucketText : "";

    const contextParts: string[] = [];
    if (selectedContext.length > 0) {
      contextParts.push(
        "Selected document blocks (blockId, type, summary):",
        ...selectedContext.map(
          (c: { blockId: string; type: string; summary: string }) =>
            `- ${c.blockId} (${c.type}): ${c.summary}`
        )
      );
    }
    if (bucketText) {
      contextParts.push("External references / context:", bucketText);
    }
    const systemContext =
      contextParts.length > 0
        ? `Use this context when answering. You may call the highlight_blocks tool to point at specific blocks (use blockIds from the selected blocks list) and optionally add suggestion text per block.\n\n${contextParts.join("\n\n")}`
        : "The user may ask about a document. If you suggest edits to specific blocks, use the highlight_blocks tool with the block IDs and optional per-block suggestions.";

    if (!process.env.OPENAI_API_KEY) {
      // Mock stream when no API key (demo mode)
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const lines = [
            "This is a demo response. Set `OPENAI_API_KEY` in `.env.local` to use the real LLM.",
            "",
            "With the API key, you can ask about the document and get block highlighting suggestions.",
          ];
          for (const line of lines) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: line + "\n" })}\n`)
            );
          }
          controller.enqueue(encoder.encode("data: [DONE]\n"));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemContext,
      messages: [{ role: "user", content: message }],
      tools: { highlight_blocks: highlightTool },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of result.fullStream) {
            if (part.type === "text-delta" && part.text) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: part.text })}\n`
                )
              );
            }
            if (part.type === "tool-call" && part.toolName === "highlight_blocks") {
              const input = part.input as {
                blockIds?: string[];
                suggestions?: Record<string, string>;
              };
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    highlight: {
                      blockIds: input?.blockIds ?? [],
                      suggestions: input?.suggestions ?? {},
                    },
                  })}\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n"));
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                text: `Error: ${err instanceof Error ? err.message : "Unknown"}\n`,
              })}\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Request failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
