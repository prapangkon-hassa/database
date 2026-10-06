import type { Product } from "@/types/product";

// แถวตัวอย่างของตาราง products; ราคาและสต็อกอยู่ใน mock-variants.ts
export const mockProducts: Product[] = [
  {
    productId: "p1",
    merchantId: "m1",
    categoryId: "electronics",
    name: "Studio Wireless Headphones",
    description:
      "Balanced sound. A little more quiet. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/headphones.svg",
    active: true,
  },
  {
    productId: "p2",
    merchantId: "m3",
    categoryId: "accessories",
    name: "Everyday Canvas Tote",
    description:
      "Room for everything your day brings. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/tote.svg",
    active: true,
  },
  {
    productId: "p3",
    merchantId: "m2",
    categoryId: "home",
    name: "Ceramic Everyday Mug",
    description:
      "Your morning ritual, thoughtfully made. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/mug.svg",
    active: true,
  },
  {
    productId: "p4",
    merchantId: "m1",
    categoryId: "electronics",
    name: "Compact Mechanical Keyboard",
    description:
      "A satisfying space to do your best work. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/keyboard.svg",
    active: true,
  },
  {
    productId: "p5",
    merchantId: "m3",
    categoryId: "clothing",
    name: "Essential Cotton Tee",
    description:
      "An easy fit in beautifully soft cotton. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/shirt.svg",
    active: true,
  },
  {
    productId: "p6",
    merchantId: "m2",
    categoryId: "home",
    name: "Arc Desk Lamp",
    description:
      "A warmer light for your favorite corner. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/lamp.svg",
    active: true,
  },
  {
    productId: "p7",
    merchantId: "m1",
    categoryId: "electronics",
    name: "Pocket Bluetooth Speaker",
    description:
      "Small in size, generous in sound. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/speaker.svg",
    active: true,
  },
  {
    productId: "p8",
    merchantId: "m3",
    categoryId: "accessories",
    name: "Minimal Everyday Watch",
    description:
      "A timeless detail, every single day. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/watch.svg",
    active: true,
  },
  {
    productId: "p9",
    merchantId: "m2",
    categoryId: "home",
    name: "Insulated Water Bottle",
    description:
      "Keep your cool wherever the day takes you. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/bottle.svg",
    active: true,
  },
  {
    productId: "p10",
    merchantId: "m3",
    categoryId: "clothing",
    name: "Relaxed Cotton Overshirt",
    description:
      "An effortless layer for cooler evenings. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/shirt.svg",
    active: true,
  },
  {
    productId: "p11",
    merchantId: "m1",
    categoryId: "accessories",
    name: "Laptop Sleeve 13-inch",
    description:
      "Soft protection with a simple silhouette. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/sleeve.svg",
    active: true,
  },
  {
    productId: "p12",
    merchantId: "m2",
    categoryId: "home",
    name: "Linen Cushion Cover",
    description:
      "Natural texture for a softer space. Carefully selected materials and practical details make this an essential you will reach for again and again.",
    imageUrl: "/products/cushion.svg",
    active: true,
  },
];
