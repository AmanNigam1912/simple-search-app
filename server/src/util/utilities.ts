import { Item } from "../types"

export function pseudoRandom(seed: number) {
    // Linear congruential generator for deterministic data
    let value = seed % 2147483647
    return () => (value = (value * 48271) % 2147483647) / 2147483647
}

export function seedItems(count = 500): Item[] {
    const rand = pseudoRandom(42)
    const items: Item[] = []
    const TAG_SETS = [
        ["nature", "outdoor", "scenic"],
        ["city", "architecture", "buildings"],
        ["people", "portrait", "lifestyle"],
        ["food", "cuisine", "meal"],
        ["animals", "wildlife", "pet"],
    ]
    for (let i = 1; i <= count; i++) {
        const price = Math.floor(rand() * 9000) / 100 + 10 // $10.00 - $100.00 range approx
        items.push({
            id: String(i),
            name: `Item ${i}`,
            description: `This is a sample description for item ${i}.`,
            image: `https://picsum.photos/seed/item-${i}/400/250`,
            price: Math.round(price * 100) / 100,
            imageAlt: `Sample photo for item ${i}`,
            imageTags: TAG_SETS[i % TAG_SETS.length],
        })
    }
    return items
}

export function matchesQuery(item: Item, q: string): boolean {
    const query = q.toLowerCase().trim()
    if (!query) {
        return true
    }
    const inText =
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.imageAlt?.toLowerCase().includes(query) ?? false) ||
        (item.imageTags?.some((t) => t.toLowerCase().includes(query)) ?? false)
    // If query looks numeric, allow matching on price as string
    const num = Number(query)
    const priceMatch =
        !Number.isNaN(num) && item.price.toString().includes(query)
    return inText || priceMatch
}
