import { NextRequest } from "next/server";

/**
 * POST /api/context
 * Body: { type: "url" | "pdf", urlOrKey: string }
 * Fetches URL and returns extracted text for the context bucket.
 * PDF extraction would require a server-side PDF lib (e.g. pdf-parse); for now we only support URL.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body.type === "pdf" ? "pdf" : "url";
    const urlOrKey = String(body.urlOrKey ?? "").trim();
    if (!urlOrKey) {
      return Response.json(
        { error: "urlOrKey is required" },
        { status: 400 }
      );
    }

    if (type === "url") {
      const res = await fetch(urlOrKey, {
        headers: { "User-Agent": "DocumentBuilder/1.0" },
      });
      if (!res.ok) {
        return Response.json(
          { error: `Fetch failed: ${res.status}` },
          { status: 502 }
        );
      }
      const html = await res.text();
      // Simple strip of HTML tags for plain text
      const text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 50000);
      return Response.json({ text });
    }

    // PDF: would need pdf-parse or similar; return placeholder
    return Response.json(
      {
        error:
          "PDF extraction not implemented. Add a server-side PDF library to extract text.",
      },
      { status: 501 }
    );
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
