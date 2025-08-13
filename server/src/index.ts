import express from "express";
import cors from "cors";
import { items, addItem } from "./data";
import { Item } from "./types";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

function matchesQuery(item: Item, q: string): boolean {
  const query = q.toLowerCase().trim();
  if (!query) return true;
  const inText =
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query) ||
    item.image.toLowerCase().includes(query);
  // If query looks numeric, allow matching on price as string
  const num = Number(query);
  const priceMatch = !Number.isNaN(num) && item.price.toString().includes(query);
  return inText || priceMatch;
}

// GET /items?q=string&offset=0&limit=20
app.get("/items", (req, res) => {
  const q = (req.query.q as string) ?? "";
  const offset = Math.max(0, parseInt((req.query.offset as string) || "0", 10));
  const limitRaw = parseInt((req.query.limit as string) || "20", 10);
  const limit = Math.min(Math.max(1, limitRaw), 100);

  const filtered = q ? items.filter(i => matchesQuery(i, q)) : items;
  const slice = filtered.slice(offset, offset + limit);
  const nextOffset = offset + limit < filtered.length ? offset + limit : null;

  res.json({
    items: slice,
    total: filtered.length,
    nextOffset,
    hasMore: nextOffset !== null
  });
});

// Basic create endpoint (API for setting up items)
app.post("/items", (req, res) => {
  const { name, description, price, image } = req.body || {};
  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string" ||
    typeof price !== "number"
  ) {
    return res.status(400).json({ error: "Invalid body. Expect {name, description, image, price}." });
  }
  const created = addItem({ name, description, image, price });
  res.status(201).json(created);
});

// Optional: fetch single
app.get("/items/:id", (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
