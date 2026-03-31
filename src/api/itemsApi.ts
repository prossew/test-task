import client from "./axios";
import type { GetItemsParams, ItemsGetOut, ItemUpdateIn } from "../types/api";
import type { Item } from "../types/item";

export const getItems = async (
  params: GetItemsParams,
): Promise<ItemsGetOut> => {
  const { data } = await client.get("/items", { params });
  return data;
};

export const getItemById = async (id: string): Promise<Item> => {
  const { data } = await client.get(`/items/${id}`);
  return data;
};

export const updateItem = async (
  id: string,
  body: ItemUpdateIn,
): Promise<Item> => {
  const { data } = await client.put(`/items/${id}`, body);
  return data;
};
