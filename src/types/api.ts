import type { Category, Item } from "./item";

export type GetItemsParams = {
  q?: string;
  limit?: number;
  skip?: number;
  needsRevision?: boolean;
  categories?: string;
  sortColumn?: "title" | "createdAt";
  sortDirection?: "asc" | "desc";
};

export type ItemUpdateIn = {
  category: Category;
  title: string;
  description?: string;
  price: number;
  params: Item["params"];
};

export type ItemListItem = {
  id: number;
  category: Category;
  title: string;
  price: number;
  needsRevision: boolean;
};

export type ItemsGetOut = {
  items: ItemListItem[];
  total: number;
};
