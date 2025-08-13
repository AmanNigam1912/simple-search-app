import React, { useEffect, useRef, useState } from "react"
import { fetchItems, createItem } from "./api"
import type { Item } from "./types"
import ItemCard from "./components/ItemCard"

function useDebouncedValue<T>(value: T, delay = 400) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(id)
    }, [value, delay])
    return debounced
}

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
    }, [debouncedQ])

    // Load a page
    useEffect(() => {
        let cancelled = false
        async function load() {
            console.log("Loading items...", loading)
            // if (!hasMore || loading) return
            if (loading) return
            setLoading(true)
            setError(null)
            try {
                const res = await fetchItems({ q: debouncedQ, offset })
                console.log("res", res)
                if (cancelled) return
                setItems((prev) => [...prev, ...res.items])
                setHasMore(res.hasMore)
            } catch (e: any) {
                setError(e?.message ?? "Failed to load data")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [debouncedQ, offset])

    // Infinite scroll: observe sentinel
    useEffect(() => {
        const el = sentinelRef.current
        if (!el) return
        const io = new IntersectionObserver((entries) => {
            const first = entries[0]
            if (first.isIntersecting && hasMore && !loading) {
                setOffset((prev) => prev + 20)
            }
        })
        io.observe(el)
        return () => {
            io.disconnect()
        }
    }, [hasMore, loading])

    async function handleAddQuick() {
        try {
            const name = `New Item ${Date.now()}`
            const body = {
                name,
                description: "Created from the UI for demo purposes.",
                price: Number((Math.random() * 90 + 10).toFixed(2)),
                image: "https://picsum.photos/seed/ui-created/400/250",
            }
            const created = await createItem(body)
            // put the new item at the top & reset paging to reflect it
            setItems((prev) => [created, ...prev])
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
                    <button onClick={handleAddQuick}>+ Quick Add</button>
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
                {loading && <span>Loading…</span>}
                {!hasMore && <span>End of results.</span>}
            </footer>
        </div>
    )
}
