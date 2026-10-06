# ลำดับฝึกเชื่อม SQL Server ด้วยตัวเอง

โปรเจกต์ยังใช้ mock ทุกหมวด คู่มือนี้บอกจุดที่ต้องแก้เมื่อคุณสร้าง ASP.NET Core Web API พร้อมแล้ว

```text
หน้าจอ React
   ↓ action / โหลดข้อมูล
React Context หรือ state ของหน้า
   ↓
services/<หมวด>.service.ts
   ↓ REST API
ASP.NET Core Web API
   ↓ ADO.NET
SQL Server Express
```

Next.js frontend ติดต่อ API และรับ JSON ส่วนการเปิด connection, SQL และ credentials ให้อยู่ในโปรเจกต์ ASP.NET Core

## เริ่มหมวดสินค้าก่อน

1. อ่าน `types/product.ts` เพื่อรู้ฟิลด์ของ Product และ ProductVariant
2. อ่านแถวตัวอย่างใน `data/mock-products.ts` และ `data/mock-variants.ts` ดูว่าคู่ `productId` เชื่อมกันอย่างไร
3. ทำ API อ่านสินค้าให้ส่ง JSON รูปแบบที่ frontend เข้าใจ เช่นส่งทั้ง products และ variants หรือส่ง variants ซ้อนใน product แล้วแปลงให้เข้ากับ state
4. เปลี่ยน `getProducts` และ `getProductById` ใน `services/products.service.ts` เป็นฟังก์ชัน async เรียก API
5. โหลดผล API เข้าสู่ `context/store-provider.tsx` หรือ state ของหน้า ปัจจุบันหน้าร้านอ่าน `data.products` และ `data.variants`; เปลี่ยน getter อย่างเดียวจึงยังไม่เปลี่ยนข้อมูลบนจอ
6. เชื่อม create/update/delete ใน service และปรับ action หมวดสินค้าใน context ให้ `await` ผล API ก่อนอัปเดต state
7. ปรับฟอร์มใน `components/merchant/product-form.tsx` ให้รอผล action แสดง loading/error และปิด dialog หลังสำเร็จ ปัจจุบัน service เป็น mock แบบ synchronous

ตรวจ GET ให้ขึ้นบนจอก่อน แล้วค่อยเพิ่ม POST, PUT และ DELETE ทีละงาน

## แผนที่ service กับ API

ชื่อ endpoint ต่อไปนี้เป็นแนวทางสำหรับ backend ที่คุณจะเขียน ยังไม่มีการเรียก API จริง

| งาน                | ไฟล์ที่เริ่มแก้        | Endpoint ในอนาคต                                                         | ตาราง/กลไก                                        |
| ------------------ | ---------------------- | ------------------------------------------------------------------------ | ------------------------------------------------- |
| อ่านสินค้า         | `products.service.ts`  | `GET /api/products`, `GET /api/products/{id}`                            | products, product_variants, categories, merchants |
| เพิ่มสินค้า        | `products.service.ts`  | `POST /api/products`                                                     | products, product_variants                        |
| แก้ไขสินค้า        | `products.service.ts`  | `PUT /api/products/{id}`                                                 | products, product_variants                        |
| ลบสินค้า           | `products.service.ts`  | `DELETE /api/products/{id}`                                              | products, product_variants                        |
| อ่านออเดอร์ลูกค้า  | `orders.service.ts`    | `GET /api/orders`, `GET /api/orders/{id}`                                | orders, order_items, payments, shipments          |
| อ่านออเดอร์ร้านค้า | `orders.service.ts`    | `GET /api/merchant/orders`                                               | orders, order_items, products, shipments          |
| สั่งซื้อ           | `checkout.service.ts`  | `POST /api/orders/checkout`                                              | sp_checkout_order                                 |
| เปลี่ยนจัดส่ง      | `shipments.service.ts` | `PUT /api/shipments/{id}/status`                                         | shipments และ trigger                             |
| รีวิว              | `reviews.service.ts`   | `POST /api/reviews`, `PUT /api/reviews/{id}`, `DELETE /api/reviews/{id}` | reviews                                           |
| รายงาน             | `reports.service.ts`   | `GET /api/reports/merchant`                                              | vw_merchant_sales_summary                         |

ไฟล์ทั้งหมดอยู่ใน `src/services/` ส่วน `cart.service.ts` เป็นตะกร้า browser และไม่ต้องต่อ API สำหรับโปรเจกต์นี้

ข้อมูล Category/Merchant/Customer แยกใน `types/` และ `data/` แล้ว สามารถเพิ่ม service สำหรับข้อมูลเหล่านี้เมื่อกำหนด endpoint ของ backend เสร็จ ตัวแปร `currentCustomer` ยังเป็น demo identity; การตรวจสิทธิ์จริงต้องทำใน backend

## สิ่งที่ต่างกันระหว่าง mock และ API จริง

ตอนนี้ service รับ `StoreData` และคืน state ชุดใหม่ เช่น `createProduct(data, input)` แล้ว context เรียก `commit(next)` เมื่อใช้ API จริง service จะส่ง input ไปที่ API และรับ DTO กลับมา คุณจึงต้องแก้ทั้ง signature และจุดเรียกใน context ด้วย

อย่าส่ง `StoreData` ทั้งก้อนไป backend เพราะมีตะกร้า ออเดอร์ และข้อมูลของหมวดอื่นรวมอยู่ ส่งเฉพาะ payload ที่ endpoint นั้นต้องใช้

หลังโหลดข้อมูลจริง ให้หยุดใช้ mock/localStorage เป็นแหล่งข้อมูลของหมวดที่เชื่อมสำเร็จ เพื่อไม่ให้ข้อมูลเก่าทับผลจาก API ยังเก็บ cart ใน browser ต่อได้

## Checkout เป็นลำดับท้าย ๆ

อ่าน `components/checkout/checkout-page.tsx`, `types/checkout.ts` และ `services/checkout.service.ts` คู่กัน

- ส่ง variantId, quantity, ข้อมูลลูกค้า/ที่อยู่ และวิธีชำระเงินให้ API
- ASP.NET Core เรียก `sp_checkout_order` เพื่อเช็กสต็อก ราคา สร้างรายการซื้อ ตัดสต็อก และจัดการ COMMIT/ROLLBACK
- UI แสดงผลสำเร็จหรือข้อผิดพลาดจาก API
- เก็บ unitPrice ณ เวลาซื้อใน order_items เพื่อไม่ให้ออเดอร์เก่าเปลี่ยนราคาตาม catalog
- หลังสำเร็จ โหลดออเดอร์/สต็อกใหม่และล้าง cart

การคำนวณราคาและตัดสต็อกใน service ปัจจุบันเป็นการจำลอง เมื่อเชื่อม API แล้วให้รับผลที่ backend ตัดสิน

## จัดส่งและ Completed

Frontend ส่งสถานะ shipment เท่านั้น เมื่อ Delivered แล้วให้ backend/SQL Server ใช้ `trg_update_shipment_on_item_delivered` ตัดสินว่าออเดอร์ครบเงื่อนไข Completed หรือยัง จากนั้น frontend โหลดออเดอร์ใหม่เพื่อแสดงสถานะล่าสุด

อย่าเพิ่มโค้ด `order.status = "Completed"` ในปุ่ม Mark as delivered

## รายงาน

แก้ `services/reports.service.ts` ให้รับยอดรวมจาก API ที่อ่าน `vw_merchant_sales_summary` และปรับ `components/merchant/reports.tsx` ให้ใช้ข้อมูลที่โหลดมา ปัจจุบัน component นี้เรียก mock service แบบ synchronous ใน Server Component

เลือกว่าจะโหลดผ่าน Server Component แบบ async หรือ Client Component ที่มี state ตามวิธี authentication ของ API ที่คุณทำ ให้เก็บ SQL/view และการรวมยอดไว้ใน backend

## ตรวจทีละหมวดหลังแก้

```sh
npm run typecheck
npm run lint
npm run build
```

เปิดหน้าที่เกี่ยวข้อง ทดสอบรายการว่าง ข้อมูลผิด โหลดไม่สำเร็จ และ action สำเร็จ ดู Network tab ของ browser ว่า URL, method, payload และ JSON ตรงกับ API ที่คุณเขียน ก่อนค่อยไปหมวดถัดไป
