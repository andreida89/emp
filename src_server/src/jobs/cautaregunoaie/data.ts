// src_server/src/gunoaie/data.ts

export type GunoiType = {
  name: string;
  weight: number;
  chance: number; // % șansă (0-100)
};

export const gunoaieTypes: GunoiType[] = [
  { name: "water",      weight: 0.1, chance: 80 },
  { name: "donut",      weight: 0.1, chance: 80 },
  { name: "chocolate",  weight: 0.1, chance: 70 },
  { name: "burger",     weight: 0.1, chance: 60 },
  { name: "beer",       weight: 0.1, chance: 50 },
  { name: "vodka",      weight: 0.1, chance: 40 },
  { name: "wine",       weight: 0.1, chance: 30 },
  { name: "cigarettes", weight: 0.1, chance: 20 },
  { name: "bandage",    weight: 0.1, chance: 10 },
  { name: "bottle",     weight: 0.1, chance: 5 },
  { name: "knuckle",    weight: 0.1, chance: 2 }
];

// Funcție pentru randomizare cu șansă să nu găsești nimic
export function randomGunoiOrNothing(): string | null {
  // 70% șanse să nu găsești nimic
  if (Math.random() < 0.4) return null;

  // Parcurge itemele de la șansă mare la mică
  for (const type of gunoaieTypes) {
    if (Math.random() * 100 < type.chance) {
      return type.name;
    }
  }
  return null;
}
