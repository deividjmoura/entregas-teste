"use client";

import { useLayoutEffect, useRef, useState } from "react";

interface RevealTextProps {
  text: string;
  reveal: number; // posição de revelação, em px, no espaço do container (0..maxWidth)
  maxWidth: number; // largura disponível do container, em px
}

const TEXT_CLASSES =
  "whitespace-nowrap font-semibold tracking-tight text-3xl sm:text-4xl md:text-5xl";

export function RevealText({ text, reveal, maxWidth }: RevealTextProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [naturalWidth, setNaturalWidth] = useState(0);

  // Mede a largura NATURAL do texto (sem escala) sempre que o texto
  // ou o breakpoint responsivo mudam a fonte.
  useLayoutEffect(() => {
    if (measureRef.current) {
      setNaturalWidth(measureRef.current.offsetWidth);
    }
  }, [text, maxWidth]);

  // Se o texto não couber no espaço disponível, encolhe via transform:scale
  // até caber. Isso substitui qualquer clipping "feio" por um encolhimento
  // suave e sempre responsivo, em qualquer largura de tela.
  const scale =
    naturalWidth > 0 && maxWidth > 0 && naturalWidth > maxWidth
      ? maxWidth / naturalWidth
      : 1;

  const displayWidth = naturalWidth * scale;
  const clampedReveal = Math.min(reveal, displayWidth || reveal);
  const isFullyRevealed = displayWidth > 0 && clampedReveal >= displayWidth;

  return (
    <div
      className="relative mt-10 select-none"
      style={{ width: displayWidth || undefined, height: "1.15em" }}
    >
      {/* Medidor invisível: só existe pra calcular a largura natural do texto.
          Não é renderizado visualmente (sem "sombra" atrás do texto). */}
      <span
        ref={measureRef}
        aria-hidden
        className={`invisible absolute left-0 top-0 ${TEXT_CLASSES}`}
      >
        {text}
      </span>

      {/* Texto revelado, recortado no ponto de revelação atual */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${clampedReveal}px` }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "left top",
            width: naturalWidth || undefined,
          }}
        >
          <h1 className={`${TEXT_CLASSES} text-white`}>{text}</h1>
        </div>

        {/* brilho: só enquanto o texto ainda está sendo revelado */}
        {!isFullyRevealed && (
          <div
            className="absolute right-0 top-0 h-full w-12 sm:w-16 md:w-20
                       bg-gradient-to-r
                       from-transparent
                       via-cyan-300/40
                       to-transparent
                       blur-lg"
          />
        )}
      </div>
    </div>
  );
}
