"use client";
import { initialData } from "@/data/initial-store";
import * as cartService from "@/services/cart.service";
import * as checkoutService from "@/services/checkout.service";
import * as productsService from "@/services/products.service";
import * as reviewsService from "@/services/reviews.service";
import * as shipmentsService from "@/services/shipments.service";
import {
  CheckoutInput,
  ProductInput,
  Review,
  ShippingStatus,
  StoreData,
} from "@/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
type Store = {
  data: StoreData;
  ready: boolean;
  notice: string;
  addToCart: (id: string, quantity: number) => boolean;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  saveProduct: (input: ProductInput, id?: string) => void;
  deleteProduct: (id: string) => void;
  checkout: (input: CheckoutInput) => string;
  updateShipment: (
    id: string,
    status: ShippingStatus,
    carrier?: string,
    tracking?: string,
  ) => void;
  saveReview: (
    input: Pick<Review, "productId" | "rating" | "comment">,
    id?: string,
  ) => void;
  deleteReview: (id: string) => void;
};
const Context = createContext<Store | null>(null);
const key = "ef-demo-v1";

function readStoredData(raw: string | null): StoreData {
  if (!raw) return initialData;
  const candidate = JSON.parse(raw) as StoreData;
  if (
    !candidate ||
    !["products", "variants", "orders", "reviews", "cart"].every((k) =>
      Array.isArray(candidate[k as keyof StoreData]),
    ) ||
    !candidate.variants.every((v) =>
      v && typeof v.variantId === "string" && typeof v.productId === "string" &&
      Number.isInteger(v.stockQuantity) && v.stockQuantity >= 0,
    )
  ) throw new Error("Invalid saved inventory.");
  return { ...candidate, cart: cartService.cleanCart(candidate) };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(initialData);
  const ref = useRef(data);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  /* eslint-disable react-hooks/set-state-in-effect -- Initial browser-storage hydration intentionally follows server rendering. */
  useEffect(() => {
    let loaded = initialData;
    try {
      loaded = readStoredData(localStorage.getItem(key));
    } catch {
      setNotice(
        "Saved demo data could not be loaded. Starting with sample data.",
      );
    }
    ref.current = loaded;
    // Hydrate browser-only demo storage after the server render.

    setData(loaded);
    setReady(true);

    // Other tabs have their own Context instance; accept persisted changes
    // without writing them back (which would cause a storage event loop).
    function syncStoredData(event: StorageEvent) {
      if (event.storageArea !== localStorage || (event.key !== key && event.key !== null)) return;
      try {
        const next = readStoredData(event.newValue);
        ref.current = next;
        setData(next);
      } catch {
        setNotice("Saved inventory could not be synchronized. Keeping current data.");
      }
    }
    window.addEventListener("storage", syncStoredData);
    return () => window.removeEventListener("storage", syncStoredData);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  function commit(next: StoreData) {
    ref.current = next;
    setData(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setNotice("Storage is unavailable. Changes will last for this session.");
    }
  }
  const value: Store = {
    data,
    ready,
    notice,
    // ส่งงานแต่ละหมวดให้ service; context รับผิดชอบเก็บ state และแจ้งผล
    addToCart: (id, quantity) => {
      try {
        commit(cartService.addCartItem(ref.current, id, quantity));
        setNotice("Added to your cart");
        return true;
      } catch (error) {
        setNotice(
          error instanceof Error ? error.message : "Could not add this item.",
        );
        return false;
      }
    },
    setQuantity: (id, quantity) => {
      commit(cartService.setCartQuantity(ref.current, id, quantity));
    },
    removeItem: (id) => {
      commit(cartService.removeCartItem(ref.current, id));
    },
    saveProduct: (input, id) => {
      commit(
        id
          ? productsService.updateProduct(ref.current, id, input)
          : productsService.createProduct(ref.current, input),
      );
      setNotice(id ? "Product updated" : "Product created");
    },
    deleteProduct: (id) => {
      commit(productsService.deleteProduct(ref.current, id));
      setNotice("Product deleted");
    },
    checkout: (input) => {
      const result = checkoutService.checkout(ref.current, input);
      commit(result.data);
      return result.orderId;
    },
    updateShipment: (id, status, carrier, tracking) => {
      commit(
        shipmentsService.updateShipmentStatus(
          ref.current,
          id,
          status,
          carrier,
          tracking,
        ),
      );
      setNotice("Shipment marked " + status.toLowerCase());
    },
    saveReview: (input, id) => {
      commit(reviewsService.saveReview(ref.current, input, id));
      setNotice("Review saved");
    },
    deleteReview: (id) => {
      commit(reviewsService.deleteReview(ref.current, id));
      setNotice("Review deleted");
    },
  };
  return (
    <Context.Provider value={value}>
      {children}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("StoreProvider is missing");
  return store;
}
