export const mushroomTypes = [
  { name: "trufe", weight: 0.1 },
  { name: "hribi", weight: 0.1 },
  { name: "ghebe", weight: 0.1 },
  { name: "champignon", weight: 0.1 },
  { name: "opintici", weight: 0.1 },
];

export function weightedRandomMushroom(): string {
  const totalWeight = mushroomTypes.reduce((a, b) => a + b.weight, 0);
  const rand = Math.random() * totalWeight;
  let acc = 0;

  for (const type of mushroomTypes) {
    acc += type.weight;
    if (rand < acc) return type.name;
  }

  return "opintici";
}
