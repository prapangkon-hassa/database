import { Router } from "express";
import {
  listProducts,
  productDetail,
} from "../controllers/products.controller.js";

export const productsRouter = Router();
productsRouter.get("/", listProducts);
productsRouter.get("/:id", productDetail);
