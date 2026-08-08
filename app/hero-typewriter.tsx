"use client";

import { useEffect, useState } from "react";

const lines = ["Parker", "Parker", "Parker"];
const characterDelay = 105;
const lineDelay = 260;

export function HeroTypewriter() {
  const [typedLines, setTypedLines] = useState(["", "", ""]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let lineIndex = 0;
    let characterIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeNextCharacter = () => {
      const line = lines[lineIndex];
      characterIndex += 1;

      setTypedLines((currentLines) =>
        currentLines.map((currentLine, index) =>
          index === lineIndex ? line.slice(0, characterIndex) : currentLine,
        ),
      );

      if (characterIndex < line.length) {
        timeoutId = setTimeout(typeNextCharacter, characterDelay);
        return;
      }

      if (lineIndex < lines.length - 1) {
        lineIndex += 1;
        characterIndex = 0;
        timeoutId = setTimeout(typeNextCharacter, lineDelay);
        return;
      }

      setIsComplete(true);
    };

    timeoutId = setTimeout(typeNextCharacter, characterDelay);
    return () => clearTimeout(timeoutId);
  }, []);

  const activeLine = isComplete
    ? lines.length - 1
    : typedLines.findIndex((line, index) => line.length < lines[index].length);

  return (
    <h1
      aria-label="Parker Parker Parker"
      className="max-w-6xl text-[14vw] font-black uppercase leading-[0.78] tracking-[-0.1em] sm:text-[13vw]"
    >
      {typedLines.map((line, index) => (
        <span className="block min-h-[0.78em]" key={index} aria-hidden="true">
          {line}
          {index === activeLine && (
            <span
              className={`typing-cursor ${isComplete ? "typing-cursor--complete" : ""}`}
            aria-hidden="true"
            />
          )}
        </span>
      ))}
    </h1>
  );
}
