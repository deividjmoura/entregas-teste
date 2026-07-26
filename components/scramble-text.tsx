"use client";

import { useRef, useEffect, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌";

interface ScrambleTextProps {
  texts: string[];
  className?: string;
  as?: "span" | "h1" | "h2" | "p";
  auto?: boolean;
}

export function ScrambleText({ texts, className = "", as = "span", auto = true }: ScrambleTextProps) {
  const [display, setDisplay] = useState(texts[0] ?? "");
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function scramble(newText: string) {
    if (timerRef.current) clearInterval(timerRef.current);
    const len = Math.max(display.length, newText.length);
    let iter = 0;
    timerRef.current = setInterval(() => {
      setDisplay(
        newText
          .split("")
          .map((ch, i) => {
            if (i < iter) return newText[i];
            if (ch === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );
      if (iter >= len + 4 && timerRef.current) clearInterval(timerRef.current);
      iter += 0.6;
    }, 38);
  }

  useEffect(() => {
    if (auto) scramble(texts[0] ?? "");
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function proximaFrase() {
    idxRef.current = (idxRef.current + 1) % texts.length;
    scramble(texts[idxRef.current]);
  }

  const Tag = as;

  return (
    <Tag className={`scramble-text ${className}`} onMouseEnter={proximaFrase} onClick={proximaFrase}>
      {display}
    </Tag>
  );
}