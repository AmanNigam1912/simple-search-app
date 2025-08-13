export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  nextOffset: number | null;
  hasMore: boolean;
}
