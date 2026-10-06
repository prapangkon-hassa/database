# คู่มืออ่านไฟล์: หมวดใครหมวดมัน

อ่านไฟล์ตามหมวดที่กำลังฝึก ไม่จำเป็นต้องอ่านทั้งโปรเจกต์ในครั้งเดียว

## จำหน้าที่ 5 ชั้นนี้ก่อน

| ชั้น              | ที่อยู่                          | หน้าที่                                          |
| ----------------- | -------------------------------- | ------------------------------------------------ |
| Route             | `src/app/`                       | บอก URL ว่าต้องเปิด component ตัวไหน             |
| UI                | `src/components/`                | แสดงข้อมูล รับ input และเรียก action             |
| State             | `src/context/store-provider.tsx` | เก็บข้อมูลที่หลายหน้าใช้ร่วมกัน และเรียก service |
| Data service      | `src/services/`                  | อ่าน/เปลี่ยนข้อมูลจำลอง; จุดฝึกเปลี่ยนเป็น API   |
| Data model / mock | `src/types/` และ `src/data/`     | รูปแบบข้อมูล และข้อมูลตัวอย่าง                   |

ตอนนี้ UI บางส่วนอ่าน array จาก `useStore().data` โดยตรง และรายการหมวดหมู่/ร้านค้าอ่านจาก mock สำหรับแสดงตัวเลือก เมื่อฝึกเชื่อม API ให้โหลดข้อมูลจริงเข้าสู่ context หรือ state ของหน้านั้นก่อน

## 1. สินค้าและ variant

- รูปแบบข้อมูล: [product.ts](../src/types/product.ts)
- แถวสินค้า: [mock-products.ts](../src/data/mock-products.ts)
- แถวตัวเลือกสินค้า: [mock-variants.ts](../src/data/mock-variants.ts)
- ฟังก์ชันข้อมูล: [products.service.ts](../src/services/products.service.ts)
- หน้าร้าน: `components/products/catalog.tsx`
- การ์ด/รายการ: `components/products/product-card.tsx`, `product-grid.tsx`
- รายละเอียด: `components/products/product-detail.tsx`
- ร้านค้าจัดการสินค้า: `components/merchant/merchant-products.tsx`
- ฟอร์มสินค้า/variants: `components/merchant/product-form.tsx`, `variant-editor.tsx`

ตาราง: `products`, `product_variants` — `ProductVariant.productId` เชื่อมกับ `Product.productId` ราคา สต็อก และ SKU อยู่ใน variant

## 2. ลูกค้า ร้านค้า และหมวดหมู่

| Entity   | Types               | ข้อมูลจำลอง               | ตาราง        |
| -------- | ------------------- | ------------------------- | ------------ |
| Customer | `types/customer.ts` | `data/mock-customers.ts`  | `customers`  |
| Merchant | `types/merchant.ts` | `data/mock-merchants.ts`  | `merchants`  |
| Category | `types/category.ts` | `data/mock-categories.ts` | `categories` |

ตัวแปร `currentCustomer` คือผู้ใช้จำลอง ให้เริ่มดูใน `mock-customers.ts` เมื่อฝึกเรื่องลูกค้า ส่วนการเพิ่ม service สำหรับโหลดตัวเลือกหมวดหมู่/ร้านค้าเป็นงานต่อยอดได้หลังทำ API สินค้า

## 3. ตะกร้า

- รูปแบบรายการ: `types/cart.ts`
- การเพิ่ม/ลบ/เปลี่ยนจำนวน: [cart.service.ts](../src/services/cart.service.ts)
- หน้าแสดงผล: `components/cart/cart-page.tsx`
- เชื่อม variant และสินค้าเพื่อแสดงในตะกร้า: `components/cart/use-cart-lines.ts`
- สรุปราคา: `components/cart/order-summary.tsx`

ตะกร้าอยู่ฝั่ง browser ไม่มีตาราง cart สำหรับโปรเจกต์นี้

## 4. Checkout

- ข้อมูลที่กรอกจากฟอร์ม: `types/checkout.ts`
- ฟอร์ม: `components/checkout/checkout-page.tsx`
- จำลองสร้างออเดอร์: [checkout.service.ts](../src/services/checkout.service.ts)

เป็นงานที่ใช้หลายตารางพร้อมกัน: `orders`, `order_items`, `product_variants`, `payments`, `shipments` ในอนาคตจะส่งคำขอให้ API ทำงานผ่าน `sp_checkout_order`

## 5. ออเดอร์

- รูปแบบออเดอร์และรายการซื้อ: `types/order.ts`
- ข้อมูลตัวอย่าง: `data/mock-orders.ts`
- อ่านออเดอร์: [orders.service.ts](../src/services/orders.service.ts)
- รายการ/การ์ด/รายละเอียด: `components/orders/orders-page.tsx`, `order-card.tsx`, `order-detail.tsx`
- Timeline: `components/orders/order-status-timeline.tsx`
- หน้าร้านค้าดูออเดอร์: `components/merchant/merchant-orders.tsx`

ตาราง: `orders`, `order_items` — ราคาใน `OrderItem.unitPrice` คือราคาที่ซื้อ ไม่อ่านราคาปัจจุบันมาคำนวณออเดอร์เก่าใหม่

## 6. การชำระเงิน

- รูปแบบข้อมูล: `types/payment.ts`
- ข้อมูลตัวอย่าง: `payment` ภายในแต่ละออเดอร์ใน `data/mock-orders.ts`
- สร้างรายการจำลอง: `services/checkout.service.ts`
- แสดงผล: `components/orders/order-detail.tsx`

ตาราง: `payments` — demo ไม่รับเงินจริงและไม่มีฟอร์มข้อมูลบัตร

## 7. การจัดส่ง

- รูปแบบข้อมูล: `types/shipment.ts`
- ข้อมูลตัวอย่าง: `shipments` ภายในแต่ละออเดอร์ใน `data/mock-orders.ts`
- เปลี่ยนสถานะ: [shipments.service.ts](../src/services/shipments.service.ts)
- ปุ่มและฟอร์ม tracking: `components/shipments/shipment-actions.tsx`
- หน้ารวมที่ใช้ฟอร์มนี้: `components/merchant/merchant-orders.tsx`

ตาราง: `shipments` — shipment status แยกจาก order status การตัดสิน Completed จะเป็นหน้าที่ trigger ใน SQL Server

## 8. รีวิว

- รูปแบบข้อมูล: `types/review.ts`
- ข้อมูลตัวอย่าง: `data/mock-reviews.ts`
- เพิ่ม/แก้ไข/ลบ: [reviews.service.ts](../src/services/reviews.service.ts)
- ฟอร์ม: `components/reviews/review-form.tsx`
- เปิดฟอร์มจาก: `components/orders/order-detail.tsx`
- แสดงรีวิวที่: `components/products/product-detail.tsx`

ตาราง: `reviews` — `customerId` และ `productId` บอกว่าใครรีวิวสินค้าใด

## 9. รายงาน

- รูปแบบผล API: `types/report.ts`
- ยอดรวมตัวอย่าง: `data/mock-reports.ts`
- จุดรับข้อมูล: [reports.service.ts](../src/services/reports.service.ts)
- Dashboard: `components/merchant/reports.tsx`
- การ์ดตัวเลข: `components/merchant/metric-card.tsx`

ใช้ view `vw_merchant_sales_summary` ผ่าน ASP.NET Core ไม่ใช่ตารางใหม่สำหรับ React

## ส่วนร่วม

- `components/layout/`: navbar, footer และ navigation ของ merchant
- `components/ui/display.tsx`: ราคา ดาวรีวิว และ status badge
- `components/ui/feedback.tsx`: loading และ empty state
- `components/ui/dialog.tsx`: modal และกล่องยืนยันลบ
- `components/ui/quantity-selector.tsx`: ปุ่มลด/เพิ่มจำนวน
- `context/store-provider.tsx`: จุดรวม state และเรียก service ตามหมวด
- `data/initial-store.ts`: รวม mock สำหรับเริ่ม demo
- `lib/utils.ts`: ราคา วันที่ ค่าส่ง และ ID
- `types/index.ts`: รวม export เท่านั้น; interface อยู่ในไฟล์แต่ละหมวด

## TypeScript model ไม่เท่ากับตารางใหม่ทุกตัว

`OrderRecord` เป็นข้อมูลรวมสำหรับหน้าออเดอร์: Order + items + payment + shipments + address ส่วน `ProductInput` และ `CheckoutInput` เป็นรูปแบบข้อมูลส่งจากฟอร์ม และ `StoreData` เป็น state ของ React ทั้งหมดเป็น DTO/state ของ frontend ไม่ได้สั่งให้สร้างตารางเพิ่ม

ข้อมูลจำลอง `mock-orders.ts` จึงเก็บ items/payment/shipments แบบซ้อนในออเดอร์ เพื่อเลียนแบบผล API แม้ตาราง SQL Server จะเก็บแยกกัน

`productId`, `merchantId`, `categoryId`, `imageUrl` บางฟิลด์ในรายการซื้อใช้ช่วยแสดงผล และอาจมาจาก JOIN หรือ snapshot ให้กำหนด DTO จาก schema ที่คุณออกแบบเอง รวมถึงที่อยู่จัดส่ง

## ไฟล์ที่ไม่ต้องแก้เพื่อฝึกต่อฐานข้อมูล

`node_modules/` คือ dependencies, `.next/` คือผล build ที่สร้างใหม่ได้ และ `package-lock.json` คือรายการเวอร์ชัน package ส่วนรูปสินค้าอยู่ใน `public/` เริ่มฝึกที่ `types/`, `services/`, `context/` และ component ของหมวดนั้นก่อน
