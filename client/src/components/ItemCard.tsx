import type { Item } from "../types"

export default function ItemCard({ item }: { item: Item }) {
    return (
        <article className="card">
            <img
                src={item.image}
                alt={item.imageAlt ?? item.name}
                loading="lazy"
            />
            <div className="card-body">
                <h3>{item.name}</h3>
                <p className="desc">{item.description}</p>
                <div className="price">${item.price.toFixed(2)}</div>
                {item.imageTags?.length ? (
                    <div className="tags">
                        {item.imageTags.map((t) => (
                            <span className="tag" key={t}>
                                {t}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </article>
    )
}
