# E-Commerce & Fulfillment

Frontend สำหรับโปรเจกต์วิชา Database Systems ใช้ Next.js App Router, TypeScript, Tailwind CSS และ React โดยใช้ข้อมูลจำลองใน browser

**เริ่มอ่านที่ [คู่มือโครงสร้างไฟล์](docs/PROJECT_STRUCTURE.md)** แล้วค่อยทำตาม [คู่มือฝึกเชื่อมฐานข้อมูล](docs/DATABASE_INTEGRATION.md)

## เปิดโปรเจกต์

ใช้ Node.js 20.9 ขึ้นไป เปิด terminal ในโฟลเดอร์นี้แล้วรัน:

```sh
npm install
npm run dev
```

เข้า http://localhost:3000

## แต่ละโฟลเดอร์ทำอะไร

```text
src/
  app/          URL และ layout ของหน้าเว็บ
  components/   หน้าตาและฟอร์ม แยกตามหมวดงาน
  services/     ฟังก์ชันข้อมูล แยกสินค้า ออเดอร์ checkout รีวิว การจัดส่ง รายงาน
  types/        รูปแบบข้อมูล แยกตาม entity เช่น Product, Order, Payment
  data/         ข้อมูลจำลอง แยก products, variants, categories, customers ฯลฯ
  context/      state ส่วนกลางของ demo และการเก็บ localStorage
  lib/          ตัวช่วยร่วม เช่น แสดงราคา วันที่ และสร้าง ID
docs/           คู่มือภาษาไทยและแผนที่ไฟล์ ↔ ตารางฐานข้อมูล
public/         รูปสินค้าและ favicon
scripts/        สคริปต์ตรวจการทำงานผ่าน browser
qa/             ผลตรวจและภาพหน้าจอ
```

ตัวอย่างการอ่านหมวดสินค้า:

```text
app/page.tsx
  → components/products/catalog.tsx
  → context/store-provider.tsx
  → services/products.service.ts
  → data/mock-products.ts + data/mock-variants.ts

รูปแบบข้อมูล: types/product.ts
ตารางในอนาคต: products + product_variants
```

## หน้าที่เปิดได้

| URL                  | หน้าที่                                     |
| -------------------- | ------------------------------------------- |
| /                    | ค้นหาและกรองสินค้า                          |
| /products/p1         | ตัวอย่างรายละเอียดสินค้าและตัวเลือก variant |
| /cart                | ตะกร้า                                      |
| /checkout            | กรอกข้อมูลและจำลองสั่งซื้อ                  |
| /orders              | ออเดอร์ของลูกค้า                            |
| /orders/EF-2026-1003 | ตัวอย่างออเดอร์ Completed สำหรับฝึกรีวิว    |
| /merchant/products   | เพิ่ม แก้ไข ลบสินค้า                        |
| /merchant/orders     | จัดการออเดอร์และสถานะจัดส่ง                 |
| /merchant/reports    | รายงานยอดขายตัวอย่าง                        |

URL รายละเอียดใช้ /products/[id] และ /orders/[id] ตาม ID ของข้อมูล

## ข้อมูลของ demo

- มีสินค้า 12 ชิ้น, variants 24 รายการ, ร้านค้า 3 ร้าน, หมวดหมู่ 4 หมวด, ออเดอร์ 5 รายการ และรีวิว 15 รายการ
- ลูกค้าตัวอย่างคือ Alex Morgan; ตัวเลือก merchant ใช้สลับดูข้อมูลร้านค้าใน demo
- ตะกร้า สินค้า ออเดอร์ และรีวิวเก็บใน localStorage ชื่อ `ef-demo-v1`
- checkout จำลองการสร้างออเดอร์ ตัดสต็อก และเก็บ unitPrice ณ เวลาซื้อ; สถานะชำระเงินเริ่ม Pending
- ค่าส่ง 60 บาท; ซื้อครบ 3,000 บาทส่งฟรี
- การเปลี่ยน shipment เป็น Delivered ไม่เปลี่ยน order เป็น Completed
- รายงานเป็นข้อมูลรวมตัวอย่างเดือนกันยายน 2026 ไม่เปลี่ยนตามการสั่งซื้อใน demo

หากต้องการเริ่มด้วยข้อมูลจำลองชุดเดิม ให้รันใน console ของ browser:

```js
localStorage.removeItem("ef-demo-v1");
location.reload();
```

## ตรวจงาน

```sh
npm run typecheck
npm run lint
npm run build
```

เมื่อ build แล้วใช้ `npm start` เพื่อเปิดแบบ production

สคริปต์ `scripts/verify.cjs` ตรวจการซื้อสินค้า CRUD รีวิวและสินค้า การจัดส่ง และขนาดหน้าจอผ่าน Playwright กับ Chrome ต้องมี Playwright แยกต่างหาก หรือกำหนด `PLAYWRIGHT_PATH` ให้ชี้ไปยัง package ที่มีอยู่ แล้วรัน `node scripts/verify.cjs` ขณะที่ dev server เปิดอยู่ สคริปต์ใช้ browser context แยกจากข้อมูลที่คุณกำลังฝึก

ผลตรวจอยู่ใน [qa/verification.md](qa/verification.md)
