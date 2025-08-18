import { Item } from "./types"
import { seedItems } from "./util/utilities"

export const items: Item[] = seedItems(600)

let nextId = items.length + 1

export function addItem(data: Omit<Item, "id">): Item {
    const item: Item = { id: String(nextId++), ...data }
    items.unshift(item)
    return item
}
