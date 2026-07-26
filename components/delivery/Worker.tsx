"use client";

import styles from "./delivery.module.css";

interface WorkerProps {
  x: number;
}

export function Worker({ x }: WorkerProps) {
  return (
    <div
      className="absolute left-0 top-0 z-20 pointer-events-none"
      style={{
        transform: `translateX(${x}px)`,
      }}
    >
      <svg
        className={styles.worker}
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
      >
        <g className="worker-body"></g>
        {/* sombra */}
        <ellipse
          cx="48"
          cy="82"
          rx="18"
          ry="4"
          fill="rgba(255,255,255,.08)"
        />

        {/* caixa */}
        <g className="box">
          <rect
            x="2"
            y="42"
            width="22"
            height="20"
            rx="3"
            fill="#D8A13A"
          />

          <path
            d="M13 42V62"
            stroke="#B88427"
            strokeWidth="1.4"
          />

          <path
            d="M2 52H24"
            stroke="#B88427"
            strokeWidth="1.4"
          />
        </g>

        {/* cabeça */}
        <circle
          cx="52"
          cy="22"
          r="8"
          fill="#F8FAFC"
        />

        {/* boné */}
        <path
          d="M44 22
             C46 12 58 12 60 22
             Z"
          fill="#06B6D4"
        />

        <rect
          x="56"
          y="20"
          width="8"
          height="2"
          rx="1"
          fill="#06B6D4"
        />

        {/* tronco */}
        <rect
          x="45"
          y="31"
          width="14"
          height="22"
          rx="6"
          fill="#0891B2"
        />

        {/* braço esquerdo */}
        <g className="arm-left">
          <line
            x1="45"
            y1="36"
            x2="24"
            y2="47"
            stroke="#F8FAFC"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* braço direito */}
        <g className="arm-right">
          <line
            x1="59"
            y1="36"
            x2="69"
            y2="43"
            stroke="#F8FAFC"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* perna esquerda */}
        <g className="leg-left">
          <line
            x1="49"
            y1="53"
            x2="43"
            y2="77"
            stroke="#F8FAFC"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* perna direita */}
        <g className="leg-right">
          <line
            x1="55"
            y1="53"
            x2="61"
            y2="77"
            stroke="#F8FAFC"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}