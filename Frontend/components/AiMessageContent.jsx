import { Fragment } from "react";

const SECTION_START =
  /(?=^🔥\s|^⚠️\s|^🎬\s|^🎥\s|^✂️\s|^🚀\s|^📈\s|^📌\s|^💡\s|^🎯\s|^📅\s|^📊\s|^🧠\s|^✨\s)/m;

function normalizeTitle(line) {
  return line.replace(/^#+\s*/, "").trim();
}

function splitIntoSections(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return [];

  const chunks = trimmed.split(SECTION_START).filter(Boolean);
  const sections = [];

  for (const chunk of chunks) {
    const lines = chunk.split("\n");
    const first = lines[0]?.trim() ?? "";
    const rest = lines.slice(1).join("\n").trim();

    if (/^[🔥⚠️🎬🎥✂️🚀📈📌💡🎯📅📊🧠✨]/.test(first)) {
      sections.push({
        title: normalizeTitle(first),
        body: rest,
      });
    } else {
      sections.push({ title: null, body: chunk.trim() });
    }
  }

  return sections;
}

function SectionBody({ body }) {
  const lines = (body || "").split("\n");
  const blocks = [];
  let listItems = [];
  let para = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join("\n") });
      para = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "ul", items: [...listItems] });
      listItems = [];
    }
  };

  for (const line of lines) {
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (bullet || numbered) {
      flushPara();
      listItems.push((bullet || numbered)[1]);
    } else if (line.trim() === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }

  flushPara();
  flushList();

  return (
    <div className="space-y-3.5 text-[15px] leading-[1.75] text-gray-300">
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i} className="whitespace-pre-wrap text-pretty">
            {b.text}
          </p>
        ) : (
          <ul
            key={i}
            className="list-disc space-y-2.5 pl-5 text-pretty marker:text-orange-400/60"
          >
            {b.items.map((item, j) => (
              <li key={j} className="pl-0.5">
                {item}
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

function ProseFallback({ content }) {
  return (
    <div className="text-[15px] leading-[1.75] text-gray-300">
      <p className="whitespace-pre-wrap text-pretty">{content}</p>
    </div>
  );
}

export default function AiMessageContent({ content }) {
  const cleanContent = (content || "").replace(/\*\*/g, "");
  const sections = splitIntoSections(cleanContent);

  if (!sections.length) {
    return <ProseFallback content={cleanContent} />;
  }

  return (
    <div className="space-y-10">
      {sections.map((sec, idx) => (
        <Fragment key={idx}>
          {sec.title ? (
            <section className="space-y-4">
              <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-white/90">
                {sec.title}
              </h3>
              <SectionBody body={sec.body} />
            </section>
          ) : (
            <div>
              <SectionBody body={sec.body} />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
