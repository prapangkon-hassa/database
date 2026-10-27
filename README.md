# E-Commerce & Fulfillment — Database Systems

ระบบใช้ Next.js + Node.js/Express + `pg` + PostgreSQL 17 ไม่มี Prisma
Frontend ใช้ข้อมูลจาก 10 ตารางตามโครงงานผ่าน API; localStorage เก็บเฉพาะตะกร้า

## เขียนใน VS Code หรือ pgAdmin?

**เขียนและเก็บไฟล์ SQL ใน VS Code ที่ `database/`**
ข้อมูลจริงอยู่ใน PostgreSQL ส่วน pgAdmin เป็นเครื่องมือเปิดดูตารางและรัน SQL
จึงใช้ทั้งสองอย่างร่วมกันได้ ไม่ต้องเลือกอย่างใดอย่างหนึ่ง

## เปิดใช้งานบนเครื่องนี้

เปิด Docker Desktop ก่อน แล้วเปิด Terminal ที่โฟลเดอร์โปรเจกต์:

```powershell
npm.cmd run db:start
```

ฐานข้อมูลเครื่องนี้สร้างและใส่ข้อมูลแล้ว **ไม่ต้องรัน db:init ซ้ำ**
เปิด Terminal สองอันค้างไว้:

```powershell
# Terminal 1: API
npm.cmd run dev:api
```

```powershell
# Terminal 2: Frontend
npm.cmd run dev
```

เปิด http://localhost:3000 (ใช้ localhost ให้ตรงกับ FRONTEND_ORIGIN)
ใช้ `npm.cmd` บน PowerShell ได้โดยไม่ต้องเปลี่ยน Execution Policy
API: http://localhost:4000/api/health/database

## ติดตั้งบนเครื่องใหม่

ต้องมี Node.js 24 LTS, Docker Desktop หรือ PostgreSQL ที่ติดตั้งเอง

```powershell
npm.cmd install
npm.cmd --prefix backend install
npm.cmd run db:config
npm.cmd run db:start
# รอ PostgreSQL พร้อมก่อน โดยตรวจ docker compose ps
npm.cmd run db:init
```

`db:config` สร้างรหัสผ่านสุ่มใน `.env` และ `backend/.env` ไม่เขียนทับไฟล์เดิม
`db:init` สร้างตาราง + logic + seed ภายใน transaction เดียว และปฏิเสธฐานที่มีตารางอยู่แล้ว
ถ้าติดตั้ง PostgreSQL เอง: สร้างฐานใหม่ชื่อ fulfillment แล้วแก้ DATABASE_URL ใน backend/.env ให้ตรงเครื่อง ไม่ต้องใช้ Docker
อย่าส่งไฟล์ `.env` ที่มีรหัสผ่าน; ส่ง `.env.example` และให้ผู้รับสร้างค่าของตนเอง

## เปิดด้วย pgAdmin

Register Server → ตั้งชื่อ `Fulfillment Local` → Connection:

| ช่อง | ค่า |
|---|---|
| Host | 127.0.0.1 |
| Port | 5433 |
| Maintenance database | fulfillment |
| Username | fulfillment |
| Password | ดูค่า POSTGRES_PASSWORD ใน `.env` ของเครื่องนี้ |

ไปที่ Databases → fulfillment → Schemas → public → Tables
คลิกขวาตาราง → View/Edit Data หรือเปิด Query Tool แล้วเปิดไฟล์ SQL จากโฟลเดอร์ database
การแก้จาก pgAdmin จะถูกโหลดเข้าหน้าเว็บภายในประมาณ 5 วินาที หรือเมื่อกลับมาโฟกัสหน้าเว็บ

## ไฟล์สำคัญ

- [docs/CODE_WALKTHROUGH_TH.md](docs/CODE_WALKTHROUGH_TH.md): คู่มือภาษาไทยอ่านทุกหมวดไฟล์ ตำแหน่งฐานข้อมูล CRUD และเส้นทาง UI → API → SQL พร้อมคำอธิบายคำสั่ง
- [database/schema.sql](database/schema.sql): 10 ตาราง, PK/FK/UNIQUE/CHECK/DEFAULT และ indexes
- [database/data.sql](database/data.sql): ข้อมูลสมมติที่บันทึกลง PostgreSQL จริง
- [database/logic.sql](database/logic.sql): checkout procedure, shipment triggers, reporting view
- [database/queries.sql](database/queries.sql): complex queries 10 ข้อ (JOIN 2, HAVING 3, subquery 3, window 2)
- [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md): แผนที่ไฟล์แต่ละหมวด
- [docs/PRACTICE_WORKBOOK.md](docs/PRACTICE_WORKBOOK.md): คู่มืออ่าน SQL และฝึกแก้ API
- [qa/backend-verification.md](qa/backend-verification.md): ผลตรวจและข้อจำกัด

## กฎที่ระบบใช้

- สต็อกอยู่ใน product_variants เท่านั้น; ซื้อสำเร็จจึงตัดสต็อกภายใน transaction
- เลือกสินค้าลงตะกร้ายังไม่จองสต็อก API ตรวจอีกครั้งตอน checkout
- สินค้ามีสต็อกถ้ามี variant ที่ active อย่างน้อยหนึ่งรายการเหลือมากกว่า 0
- ราคาและยอดชำระคำนวณฝั่งฐานข้อมูล ไม่รับยอดจาก browser
- ค่าส่ง 60 บาทต่อออเดอร์ / ฟรีเมื่อ subtotal ตั้งแต่ 3,000 บาท แบ่งเก็บใน shipments ตามร้านค้า
- Coupon `STUDENT10`: ลด 10% สูงสุด 200 บาท เมื่อ subtotal ตั้งแต่ 500 บาท; เก็บผลใน orders.discount_amount
- QR/Card เป็นการชำระเงินจำลอง; COD pending จนส่งครบแล้วจึงบันทึก paid ไม่มีการเรียกเก็บเงินจริง
- หลายร้านในออเดอร์เดียวแยก shipment; ส่งครบทุก shipment จึง completed
- สินค้าที่ขายแล้วลบไม่ได้เพราะ FK ให้ตั้ง inactive แทน; ไม่ให้เปลี่ยนร้านค้า/หมวดหมู่ของสินค้าที่ขายแล้ว
- ลูกค้ารีวิวสินค้าได้หลังมีคำสั่งซื้อ completed และหนึ่งคนรีวิวสินค้าหนึ่งชิ้นได้ครั้งเดียว
- รายงานแสดงยอดสินค้าแบบ gross ก่อนส่วนลด และแยกส่วนลดรวม/ค่าขนส่ง; ไม่ใช่รายงานเงินที่รับจริง

## ขอบเขตการสาธิต

ระบบบนเครื่องสำหรับส่งงาน: ลูกค้าทดสอบ customer_id=1 และ merchant workspace เลือกร้านค้าได้ ไม่มีระบบ login/การตรวจสิทธิ์ใช้งานหลายคนจริง จึงผูก API และ PostgreSQL กับ localhost
ใช้โครง 10 ตารางตาม PDF: ไม่มี image_url, color, size; ใช้ variant_name และ shipping_address ช่องเดียว
ชื่อที่หน้าเว็บใช้ เช่น name/active เป็นการแปลง product_name/status ไม่ใช่คอลัมน์ใหม่
ตะกร้า, coupon_code และ original_stock_quantity เป็นข้อมูลคำขอ/ตรวจการแก้พร้อมกัน ไม่เพิ่มตารางหรือคอลัมน์
ราคาซื้อเก็บ snapshot ใน order_items.unit_price; ชื่อสินค้า/ตัวเลือกยัง JOIN จากตารางปัจจุบันตาม schema

## ตรวจงาน

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd --prefix backend run typecheck
npm.cmd --prefix backend test
npm.cmd --prefix backend run test:database
```

test:database สร้างฐานชื่อ fulfillment_test_<timestamp> แยกชั่วคราวและลบเฉพาะฐานที่ตัวเองสร้าง ต้องใช้บัญชีที่มี CREATEDB; ไม่ล้างฐาน fulfillment
หยุด PostgreSQL ด้วย `npm.cmd run db:stop` ข้อมูลอยู่ใน Docker volume ไม่หาย

ส่วนที่นักศึกษาต้องจัดทำ/ตรวจเองก่อนส่ง: EER, FD/Normalization, data dictionary, business rules, รายงานตามรูปแบบอาจารย์, วิดีโอ 5–7 นาที และอธิบาย SQL/API ได้ การรันเว็บผ่านไม่ได้แทนสิ่งส่งเหล่านี้
