// รูปแบบข้อมูลที่สอดคล้องกับตาราง reviews
export interface Review {
  reviewId: string;
  customerId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
