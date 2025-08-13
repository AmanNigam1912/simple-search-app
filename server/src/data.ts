import { Item } from "./types";

function pseudoRandom(seed: number) {
  // Linear congruential generator for deterministic data
  let value = seed % 2147483647;
  return () => (value = (value * 48271) % 2147483647) / 2147483647;
}

export function seedItems(count = 500): Item[] {
  const rand = pseudoRandom(42);
  const items: Item[] = [];
  for (let i = 1; i <= count; i++) {
    const price = Math.floor(rand() * 9000) / 100 + 10; // $10.00 - $100.00 range approx
    items.push({
      id: String(i),
      name: `Item ${i}`,
      description: `This is a sample description for item ${i}. Perfect for demos and search testing.`,
      image: `https://picsum.photos/seed/item-${i}/400/250`,
      price: Math.round(price * 100) / 100
    });
  }
  return items;
}

export const items: Item[] = seedItems(600);

let nextId = items.length + 1;

export function addItem(data: Omit<Item, "id">): Item {
  const item: Item = { id: String(nextId++), ...data };
  items.unshift(item); // add to the front to make it visible in the first page
  return item;
}
