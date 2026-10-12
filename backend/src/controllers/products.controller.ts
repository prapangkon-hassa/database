import type { Request, Response } from "express";
import { getInventory } from "../services/products.service.js";
import { id } from "../lib/validation.js";

export async function listProducts(_request: Request, response: Response) {
  response.json(await getInventory());
}

export async function productDetail(
  request: Request<{ id: string }>,
  response: Response,
) {
  const inventory = await getInventory(id(request.params.id));
  if (!inventory.products.length) {
    response.status(404).json({ error: "Product not found" });
    return;
  }
  response.json(inventory);
}
