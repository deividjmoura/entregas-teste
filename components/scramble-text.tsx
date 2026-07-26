"use client";

import { useEffect, useRef, useState } from "react";

const CHARS =
  "!<>-_\\/[]{}—=+*^?#________";

interface ScrambleTextProps {
  texts: string[];
  className?: string;
  as?: "span" | "h1" | "h2" | "p";
}

export function ScrambleText({
  texts,
  className = "",
  as = "span",
}: ScrambleTextProps) {
  const Tag = as;

  const [output, setOutput] = useState(texts[0]);

  const current = useRef(0);

  const frameRequest = useRef<number>();

  const timeout = useRef<NodeJS.Timeout>();

  const queue = useRef<
    {
      from: string;
      to: string;
      start: number;
      end: number;
      char?: string;
    }[]
  >([]);

  function randomChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  function setText(newText: string) {
    cancelAnimationFrame(frameRequest.current!);

    const oldText = output;
    const length = Math.max(oldText.length, newText.length);

    queue.current = [];

    for (let i = 0; i < length; i++) {
      queue.current.push({
        from: oldText[i] || "",
        to: newText[i] || "",
        start: Math.floor(Math.random() * 20),
        end: Math.floor(Math.random() * 20) + 20,
      });
    }

    let frame = 0;

    const update = () => {
      let complete = 0;
      let text = "";

      for (let i = 0; i < queue.current.length; i++) {
        const item = queue.current[i];

        if (frame >= item.end) {
          complete++;
          text += item.to;
        } else if (frame >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = randomChar();
          }
          text += item.char;
        } else {
          text += item.from;
        }
      }

      setOutput(text);

      if (complete === queue.current.length) return;

      frame++;
      frameRequest.current = requestAnimationFrame(update);
    };

    update();
  }

  function nextText() {
    current.current = (current.current + 1) % texts.length;
    setText(texts[current.current]);
    schedule();
  }

  function schedule() {
    clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      nextText();
    }, 3500);
  }

  useEffect(() => {
    schedule();

    return () => {
      cancelAnimationFrame(frameRequest.current!);
      clearTimeout(timeout.current);
    };
  }, []);

  return (
    <Tag
      className={className}
      onMouseEnter={nextText}
      onClick={nextText}
    >
      {output}
    </Tag>
  );
}