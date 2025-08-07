import React from 'react';

type Props = {
  amount: number; // 0..100
};

export default function Thirst({ amount }: Props) {
  return (
    <div
      className="hud_thirst"
      style={{ ['--p' as any]: Math.min(Math.max(amount, 0), 100) }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
        {/* fundal */}
        <circle
          className="hud_thirst_ring_bg"
          cx="50"
          cy="50"
          r="44"
          pathLength="100"
          fill="none"
        />
        {/* progres */}
        <circle
          className="hud_thirst_ring_progress"
          cx="50"
          cy="50"
          r="44"
          pathLength="100"
          fill="none"
        />
      </svg>
      <i className="fa-solid fa-bottle-water" />
    </div>
  );
}
