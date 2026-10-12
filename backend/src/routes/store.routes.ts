import { Router } from "express";
import { getStore } from "../services/store.service.js";
import * as productWrites from "../services/product-write.service.js";
import * as checkout from "../services/checkout.service.js";
import * as shipments from "../services/shipments.service.js";
import * as reviews from "../services/reviews.service.js";
import { id } from "../lib/validation.js";
export const storeRouter = Router();
storeRouter.get("/store", async (_req, res) => {
  res.set("Cache-Control", "no-store").json(await getStore());
});
storeRouter.post("/products", async (req, res) => {
  res.status(201).json(await productWrites.saveProduct(req.body));
});
storeRouter.put("/products/:id", async (req, res) => {
  res.json(await productWrites.saveProduct(req.body, id(req.params.id)));
});
storeRouter.delete("/products/:id", async (req, res) => {
  await productWrites.deleteProduct(id(req.params.id));
  res.sendStatus(204);
});
storeRouter.post("/orders/checkout", async (req, res) => {
  res.status(201).json(await checkout.checkout(req.body));
});
storeRouter.patch("/shipments/:id", async (req, res) => {
  await shipments.updateShipment(id(req.params.id), req.body);
  res.sendStatus(204);
});
storeRouter.post("/reviews", async (req, res) => {
  res.status(201).json(await reviews.saveReview(req.body));
});
storeRouter.put("/reviews/:id", async (req, res) => {
  res.json(await reviews.saveReview(req.body, id(req.params.id)));
});
storeRouter.delete("/reviews/:id", async (req, res) => {
  await reviews.deleteReview(id(req.params.id));
  res.sendStatus(204);
});
