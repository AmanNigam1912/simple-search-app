import React, { useEffect, useRef, useState } from "react"
import { fetchItems, createItem } from "./api"
import type { Item } from "./types"
import ItemCard from "./components/ItemCard"
import { useDebouncedValue } from "./hooks/useDebouncedValue"

export default function App() {
    const [items, setItems] = useState<Item[]>([])
    const [q, setQ] = useState("")
    const debouncedQ = useDebouncedValue(q, 400)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const sentinelRef = useRef<HTMLDivElement | null>(null)

    // Reset list when search changes
    useEffect(() => {
        setItems([])
        setOffset(0)
        setHasMore(true)
    }, [debouncedQ])

    // Load a page
    useEffect(() => {
        let cancelled = false
        async function load() {
            console.log("inisde use effect load")
            if (loading || !hasMore) {
                console.log("Already loading or error state, skipping fetch")
                return
            }
            setLoading(true)
            setError(null)
            console.log("inisde use effect load before fetchItems")
            try {
                const res = await fetchItems({ q: debouncedQ, offset })
                console.log("res", res)
                if (cancelled) {
                    return
                }
                // console.log("Fetched items:", res.items)
                setItems((prev) => [...prev, ...res.items])
                setHasMore(res.hasMore)
            } catch (e: any) {
                setError(e?.message ?? "Failed to load data")
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [debouncedQ, offset, hasMore])

    // Infinite scroll: observe sentinel
    useEffect(() => {
        const el = sentinelRef.current
        if (!el) {
            return
        }
        const io = new IntersectionObserver(
            (entries) => {
                const first = entries[0]
                if (first.isIntersecting && hasMore && !loading) {
                    setOffset((prev) => prev + 20)
                }
            },
            { root: null, rootMargin: "200px", threshold: 0 }
        )
        io.observe(el)
        return () => {
            io.disconnect()
        }
    }, [hasMore, loading])

    async function handleAdd() {
        try {
            const name = `New Item ${Date.now()}`
            const body = {
                name,
                description: "Created from the UI for demo purposes.",
                price: Number((Math.random() * 90 + 10).toFixed(2)),
                image: "https://picsum.photos/seed/ui-created/400/250",
                imageAlt: "Sample UI-created image",
                imageTags: ["demo", "ui-created"],
            }

            await createItem(body)
            setQ("")
            setOffset(0)
        } catch (e: any) {
            alert(e?.message ?? "Failed to create item")
        }
    }

    return (
        <div className="container">
            <header className="header">
                <h1>Simple Search</h1>
                <div className="controls">
                    <input
                        type="text"
                        placeholder="Search name, description, price or image..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        aria-label="Search items"
                    />
                    <button onClick={handleAdd}>Add</button>
                </div>
            </header>

            {error && <div className="error">Error: {error}</div>}

            <section className="grid">
                {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </section>

            <div ref={sentinelRef} style={{ height: 1 }} />

            <footer className="footer">
                {loading && <div>Loading…</div>}
                {!hasMore && <div>End of results.</div>}
            </footer>
        </div>
    )
}
