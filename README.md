# Simple Search App (React + Node/Express)

Stack: Node.js/Express + TypeScript (API) and Vite + React + TypeScript (UI).

**Search (server-side)**
Fields: name, description, image (URL), imageAlt, imageTags (array of keywords).
Price search: strict equality after 2-decimal normalization.
Example: 19.9 matches items priced 19.90 only; it won’t match 19.99.
Case-insensitive substring matching for text fields.

**Pagination**
Offset pagination: offset and limit parameters, response includes { total, hasMore, nextOffset }.
Infinite Scroll (client) using an IntersectionObserver sentinel.
Guard prevents an immediate jump to offset=20 after search resets.
Debounced search input (400ms) to limit requests.

**Items CRUD (subset)**
Read (GET /items, GET /items/:id) — list page / single item.
Data is in-memory (deterministic seed of ~600 items). Restart resets the dataset.
