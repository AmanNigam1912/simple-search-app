import { useEffect, useRef, useState } from "react"
import { fetchItems, createItem } from "./api"
import type { Item } from "./types"
import ItemCard from "./components/ItemCard"
import { useDebouncedValue } from "./hooks/useDebouncedValue"

export default function App() {
    const [items, setItems] = useState<Item[]>([])
    const [q, setQ] = useState("")
    const debouncedQ = useDebouncedValue(q, 500)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    // const lastQSRef = useRef<{ q: string }>({ q: "" })

    // console.log("offset", offset)

    useEffect(() => {
        setItems([])
        setOffset(0)
        setHasMore(true)
    }, [debouncedQ])

    useEffect(() => {
        // const changed = lastQSRef.current.q !== debouncedQ
        // // prevent stale fetch from happening
        // if (changed) {
        //     lastQSRef.current = { q: debouncedQ }
        //     setItems([])
        //     setOffset(0)
        //     setHasMore(true)
        //     return
        // }

        let cancelled = false
        async function load() {
            if (loading || !hasMore) {
                return
            }
            setLoading(true)
            setError(null)
            try {
                const res = await fetchItems({ q: debouncedQ, offset })
                setItems((prev) => [...prev, ...res.items])
                setHasMore(res.hasMore)
            } catch (e: any) {
                setError(e?.message ?? "Failed to load data")
            } finally {
                setLoading(false)
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

    return (
        <div className="container">
            <header className="header">
                <h1>Simple Search</h1>
                <div className="controls">
                    <input
                        type="text"
                        placeholder="Search name, description, price or image..."
                        value={q}
                        onChange={(e) => {
                            setOffset(0)
                            setQ(e.target.value)
                        }}
                        aria-label="Search items"
                    />
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
