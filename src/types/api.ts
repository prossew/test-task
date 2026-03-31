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

export type ItemsGetOut = {
  items: Item[];
  total: number;
};

export type ItemUpdateIn = {
  category: Category;
  title: string;
  description?: string;
  price: number;
  params: Item["params"];
};
