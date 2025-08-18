import express from "express"
import cors from "cors"
import { items, addItem } from "./data"
import { matchesQuery } from "./util/utilities"

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

app.get("/health", (_req, res) => {
    res.json({ ok: true })
})

// GET /items?q=string&offset=0&limit=20
app.get("/items", (req, res) => {
    const q = (req.query.q as string) ?? ""
    const offset = Math.max(
        0,
        parseInt((req.query.offset as string) || "0", 10)
    )
    const limitRaw = parseInt((req.query.limit as string) || "20", 10)
    const limit = Math.min(Math.max(1, limitRaw), 100)
    const sort = req.query.sort as "asc" | "desc" | "undefined"

    const filtered = q ? items.filter((i) => matchesQuery(i, q)) : items
    const sortedItems = [...filtered].sort((a, b) => {
        if (sort === "asc") {
            return a.price - b.price
        } else if (sort === "desc") {
            return b.price - a.price
        }
        return 0
    })
    const slice = sortedItems.slice(offset, offset + limit)
    const nextOffset =
        offset + limit < sortedItems.length ? offset + limit : null

    res.json({
        items: slice,
        total: filtered.length,
        nextOffset,
        hasMore: nextOffset !== null,
    })
})

// // Basic create endpoint (API for setting up items)
// app.post("/items", (req, res) => {
//     const { name, description, price, image, imageAlt, imageTags } =
//         req.body || {}
//     if (
//         typeof name !== "string" ||
//         typeof description !== "string" ||
//         typeof image !== "string" ||
//         typeof price !== "number"
//     ) {
//         return res.status(400).json({
//             error: "Invalid body. Expect {name, description, image, price}.",
//         })
//     }
//     const imageAltValid =
//         typeof imageAlt === "undefined" || typeof imageAlt === "string"
//     const imageTagsValid =
//         typeof imageTags === "undefined" ||
//         (Array.isArray(imageTags) &&
//             imageTags.every((t) => typeof t === "string"))
//     if (!imageAltValid || !imageTagsValid) {
//         return res
//             .status(400)
//             .json({
//                 error: "imageAlt must be string (optional), imageTags must be string[] (optional).",
//             })
//     }

//     const created = addItem({
//         name,
//         description,
//         image,
//         price,
//         imageAlt,
//         imageTags,
//     })
//     res.status(201).json(created)
// })

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
})
