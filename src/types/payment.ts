import { PaymentStatus } from "./paymentStatus";

export type PaymentType = "rent" | "deposit" | "bills";
type PaymentMethod = "E-Transfer" | "Credit/Debit Card" | "Cash";

export type Payment = {
   id: string;
   tenant_id: string;
   bill_id?: string;
   e_transfer_email?: string;
   type: PaymentType;
   payment_method: PaymentMethod;
   amount_payment: number;
   amount_paid: number;
   is_current: boolean;
   dueDate: Date;
   paidDate: Date;
   createdAt: Date;
   paymentVerifiedDate: Date;
   status: PaymentStatus;
};

export const PaymentDefaultVal:Payment = {
   id: "", 
   tenant_id: "",
   type: "rent",
   payment_method: "Cash",
   amount_payment: 0,
   amount_paid: 0,
   is_current: true,
   dueDate: new Date(Date.now()),
   paidDate: new Date(Date.now()),
   createdAt: new Date(Date.now()),
   paymentVerifiedDate: new Date(Date.now()),
   status: "Pending",
}