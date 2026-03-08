"use client";

import ReactMarkdown from "react-markdown";

const markdownClasses = "markdown-content [&_p]:my-1 [&_strong]:font-bold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_code]:bg-zinc-100 [&_code]:dark:bg-zinc-800 [&_code]:px-1 [&_code]:rounded";

export function Markdown({ content }: { content: string }) {
  if (!content.trim()) return <span className="text-zinc-400">Empty</span>;
  return (
    <div className={markdownClasses}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
