// หมวด reports: mock service ของ frontend; จุดเปลี่ยนเป็น REST API ในอนาคต
import { mockReport } from "@/data/mock-reports";

export function getMerchantReport() {
  // TODO GET /api/reports/merchant. ASP.NET retrieves vw_merchant_sales_summary.
  // Production aggregates belong in SQL Server, not in frontend calculations.
  return mockReport;
}
