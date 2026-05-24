/**
 * MarkdownMessage — lightweight markdown renderer for GandaBot AI responses.
 *
 * Handles the exact subset that GandaBot produces:
 *   **bold**, *italic*, `inline code`
 *   # H1, ## H2, ### H3
 *   - unordered lists  /  1. ordered lists
 *   > blockquote (used for cultural context callouts)
 *   Blank-line-separated paragraphs
 *   Line breaks within a paragraph
 *
 * Zero external dependencies — keeps the bundle small for mobile PWA.
 */

import { Fragment } from "react";

// ─── Inline parser ────────────────────────────────────────────────────────────

type InlineSpan =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string };

function parseInline(text: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  // Process in order: code > bold > italic so they don't interfere
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      spans.push({ type: "text", value: text.slice(last, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith("`")) {
      spans.push({ type: "code", value: raw.slice(1, -1) });
    } else if (raw.startsWith("**")) {
      spans.push({ type: "bold", value: raw.slice(2, -2) });
    } else {
      spans.push({ type: "italic", value: raw.slice(1, -1) });
    }

    last = match.index + raw.length;
  }

  if (last < text.length) {
    spans.push({ type: "text", value: text.slice(last) });
  }

  return spans;
}

function InlineContent({ text }: { text: string }) {
  const spans = parseInline(text);
  return (
    <>
      {spans.map((span, i) => {
        if (span.type === "bold") {
          return <strong key={i} className="font-semibold">{span.value}</strong>;
        }
        if (span.type === "italic") {
          return <em key={i} className="italic opacity-90">{span.value}</em>;
        }
        if (span.type === "code") {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{ background: "rgba(46,184,152,0.15)", color: "var(--teal-light)" }}
            >
              {span.value}
            </code>
          );
        }
        // Plain text — split on \n so soft line-breaks within paragraphs render
        return (
          <Fragment key={i}>
            {span.value.split("\n").map((part, j, arr) => (
              <Fragment key={j}>
                {part}
                {j < arr.length - 1 && <br />}
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </>
  );
}

// ─── Block parser ─────────────────────────────────────────────────────────────

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "blockquote"; lines: string[] }
  | { type: "divider" };

function parseBlocks(raw: string): Block[] {
  // Normalise line endings and split
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines (they act as block separators)
    if (!line.trim()) {
      i++;
      continue;
    }

    // Headings
    const h3Match = line.match(/^###\s+(.*)/);
    const h2Match = line.match(/^##\s+(.*)/);
    const h1Match = line.match(/^#\s+(.*)/);

    if (h1Match) { blocks.push({ type: "h1", text: h1Match[1] }); i++; continue; }
    if (h2Match) { blocks.push({ type: "h2", text: h2Match[1] }); i++; continue; }
    if (h3Match) { blocks.push({ type: "h3", text: h3Match[1] }); i++; continue; }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        bqLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", lines: bqLines });
      continue;
    }

    // Paragraph — collect all consecutive non-empty, non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^[-*•]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !lines[i].startsWith(">") &&
      !lines[i].startsWith("#") &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", lines: paraLines });
    }
  }

  return blocks;
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "h1":
      return (
        <p className="font-black text-base mb-1 mt-3 first:mt-0" style={{ fontFamily: "Fraunces, serif", color: "var(--teal-light)" }}>
          <InlineContent text={block.text} />
        </p>
      );
    case "h2":
      return (
        <p className="font-bold text-sm mb-1 mt-3 first:mt-0" style={{ color: "var(--teal-light)" }}>
          <InlineContent text={block.text} />
        </p>
      );
    case "h3":
      return (
        <p className="font-semibold text-sm mb-0.5 mt-2 first:mt-0 opacity-80" style={{ color: "var(--cream)" }}>
          <InlineContent text={block.text} />
        </p>
      );

    case "paragraph":
      return (
        <p className="leading-relaxed mb-2 last:mb-0">
          {block.lines.map((line, i) => (
            <Fragment key={i}>
              <InlineContent text={line} />
              {i < block.lines.length - 1 && <br />}
            </Fragment>
          ))}
        </p>
      );

    case "ul":
      return (
        <ul className="mb-2 last:mb-0 flex flex-col gap-1 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--teal)" }} />
              <span><InlineContent text={item} /></span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="mb-2 last:mb-0 flex flex-col gap-1 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 leading-relaxed">
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                style={{ background: "rgba(33,144,121,0.25)", color: "var(--teal-light)" }}
              >
                {i + 1}
              </span>
              <span><InlineContent text={item} /></span>
            </li>
          ))}
        </ol>
      );

    case "blockquote":
      return (
        <div
          className="my-2 pl-3 py-2 pr-2 rounded-r-xl text-xs leading-relaxed italic opacity-80"
          style={{ borderLeft: "3px solid var(--orange)", background: "rgba(244,123,32,0.06)", color: "var(--cream)" }}
        >
          {block.lines.map((line, i) => (
            <Fragment key={i}>
              <InlineContent text={line} />
              {i < block.lines.length - 1 && <br />}
            </Fragment>
          ))}
        </div>
      );

    case "divider":
      return <hr className="my-3 border-none h-px opacity-20" style={{ background: "var(--cream)" }} />;

    default:
      return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Render a markdown string as formatted React output.
 * Use inside chat message bubbles for AI responses.
 */
export function MarkdownMessage({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="text-sm" style={{ color: "var(--cream)" }}>
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </div>
  );
}
