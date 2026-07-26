"use client";

import { useRef, useCallback } from "react";

/**
 * Tilt 3D "glass" ao mover o mouse sobre o elemento — usado por todos
 * os cards do tema aurora/glass (Card, MetricCard, etc). Devolve os
 * handlers pra espalhar no elemento e o ref.
 */
export function useTilt<T extends HTMLElement>(strength = 10) {
  const ref = useRef<T | null>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale(1.015)`;
    },
    [strength],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform .6s cubic-bezier(.23,1,.32,1), box-shadow .4s";
    el.style.transform = "";
    setTimeout(() => {
      if (el) el.style.transition = "";
    }, 600);
  }, []);

  const onMouseEnter = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transition = "transform .12s ease, box-shadow .4s";
  }, []);

  return { ref, onMouseMove, onMouseLeave, onMouseEnter };
}