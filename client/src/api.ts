import type { ItemsResponse } from "./types"

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000"

export async function fetchItems(
    params: { q?: string; offset?: number; limit?: number } = {}
): Promise<ItemsResponse> {
    const url = new URL("/items", API_BASE)
    if (params.q) {
        url.searchParams.set("q", params.q)
    }
    url.searchParams.set("offset", String(params.offset ?? 0))
    url.searchParams.set("limit", String(params.limit ?? 20))
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error("Failed to fetch items")
    return res.json()
}

export async function createItem(body: {
    name: string
    description: string
    price: number
    image: string
    imageAlt?: string
    imageTags?: string[]
}) {
    const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Failed to create item")
    return res.json()
}
