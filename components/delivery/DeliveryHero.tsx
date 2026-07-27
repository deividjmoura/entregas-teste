"use client";

import { useEffect, useRef, useState } from "react";
import { RevealText } from "./RevealText";
import { Worker } from "./Worker";

interface DeliveryHeroProps {
  texts: string[];
  className?: string;
  speed?: number;
  pause?: number;
}

const WORKER_SIZE = 96;

export function DeliveryHero({
  texts,
  className = "",
  speed = 260,
  pause = 1800,
}: DeliveryHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);

  const [workerX, setWorkerX] = useState(-WORKER_SIZE);

  const [width, setWidth] = useState(0);

  useEffect(() => {
  if (!containerRef.current) return;

  const resize = () => {
    if (!containerRef.current) return; 
    setWidth(containerRef.current.clientWidth); 
  };

  resize();

  const observer = new ResizeObserver(resize);
  observer.observe(containerRef.current);

  return () => observer.disconnect();
}, []);

  useEffect(() => {
    if (!width) return;

    let frame: number;

    let last = performance.now();

    let position = -WORKER_SIZE;

    function animate(now: number) {
      const dt = (now - last) / 1000;

      last = now;

      position += speed * dt;

      setWorkerX(position);

      if (position <= width) {
        frame = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setWorkerX(-WORKER_SIZE);
          setIndex((i) => (i + 1) % texts.length);
        }, pause);
      }
    }

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [width, index, speed, pause, texts.length]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-w-0 overflow-hidden py-6 ${className}`}
    >
      {/* Linha */}

      <div className="relative h-20">
        <div className="absolute top-10 left-0 right-0 h-[3px] rounded-full bg-zinc-800" />

        <div
          className="absolute top-10 left-0 h-[3px] rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-400"
          style={{
            width: workerX + WORKER_SIZE / 2,
          }}
        />

        {/* Dock esquerda */}

        <div className="absolute top-4 left-0 h-12 w-4 rounded bg-zinc-700" />

        {/* Dock direita */}

        <div className="absolute top-4 right-0 h-12 w-4 rounded bg-zinc-700" />

        <Worker x={workerX} />
      </div>

      <RevealText
        key={index}
        text={texts[index]}
        reveal={workerX + WORKER_SIZE / 2}
        maxWidth={width}
      />
    </div>
  );
}