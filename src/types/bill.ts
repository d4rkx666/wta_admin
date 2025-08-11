import { Timestamp } from "firebase/firestore";
import { PaymentStatus } from "./paymentStatus";

export type Bill = {
   id: string;
   propertyId: string;
   type: string;
   amount: number;
   balance: number;
   admin_payment: number;
   issuedDate: Timestamp | Date;
   dueDate: Timestamp | Date;
   notes: string;
   status: PaymentStatus;
   createdAt: Date;
};