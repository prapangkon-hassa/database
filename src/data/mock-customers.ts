import type { Customer } from "@/types/customer";
export const customers: Customer[] = [
  {
    customerId: "c1",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@example.com",
    phone: "0812345678",
  },
  {
    customerId: "c2",
    firstName: "Nara",
    lastName: "Siri",
    email: "nara@example.com",
    phone: "0823456789",
  },
  {
    customerId: "c3",
    firstName: "James",
    lastName: "Lee",
    email: "james@example.com",
    phone: "0834567890",
  },
];
export const currentCustomer = customers[0];
