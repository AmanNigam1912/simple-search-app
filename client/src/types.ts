export interface Item {
    id: string
    name: string
    description: string
    price: number
    image: string
    imageAlt?: string
    imageTags?: string[]
}

export interface ItemsResponse {
    items: Item[]
    total: number
    nextOffset: number | null
    hasMore: boolean
}
