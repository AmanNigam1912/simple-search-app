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
    const [sort, setSort] = useState<"asc" | "desc" | "undefined">("undefined")

    useEffect(() => {
        setItems([])
        setOffset(0)
        setHasMore(true)
    }, [debouncedQ, sort])

    useEffect(() => {
        let cancelled = false
        async function load() {
            if (loading || !hasMore) {
                return
            }
            setLoading(true)
            setError(null)
            try {
                const res = await fetchItems({ q: debouncedQ, offset, sort })
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
    }, [debouncedQ, offset, hasMore, sort])

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

    function handleSortChange() {
        if (sort === "asc") {
            setSort("desc")
        } else if (sort === "desc") {
            setSort("undefined")
        } else {
            setSort("asc")
        }
        setOffset(0)
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
                        onChange={(e) => {
                            setOffset(0)
                            setQ(e.target.value)
                        }}
                        aria-label="Search items"
                    />

                    <button
                        className="btn-sort"
                        type="button"
                        onClick={() => handleSortChange()}
                        data-state="none"
                        aria-pressed="false"
                        aria-label="Sort ascending"
                    >
                        <span className="label">Sort</span>
                        {sort === "asc" && (
                            <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path d="M7 14l5-5 5 5" />
                            </svg>
                        )}
                        {sort === "desc" && (
                            <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path d="M7 10l5 5 5-5" />
                            </svg>
                        )}
                    </button>
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
