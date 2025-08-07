import React from 'react';

type Props = {
  amount: number; // 0..100
};

export default function Hunger({ amount }: Props) {
  return (
    <div
      className="hud_hunger"
      style={{ ['--p' as any]: Math.min(Math.max(amount, 0), 100) }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
        {/* fundal */}
        <circle
          className="ring-bg"
          cx="50"
          cy="50"
          r="44"
          pathLength="100"
          fill="none"
        />
        {/* progres */}
        <circle
          className="ring-progress hunger"
          cx="50"
          cy="50"
          r="44"
          pathLength="100"
          fill="none"
        />
      </svg>
      <i className="fa-solid fa-burger" />
    </div>
  );
}
