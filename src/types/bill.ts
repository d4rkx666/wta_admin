import { PaymentStatus } from "./paymentStatus";

export type Bill = {
   id: string;
   propertyId: string;
   type: string;
   amount: number;
   balance: number;
   issuedDate: Date;
   dueDate: Date;
   notes: string;
   status: PaymentStatus;
   createdAt: Date;
};

export const BillDefaultVal:Bill = {
   id: "",
   propertyId: "",
   type:'',
   amount: 0,
   balance: 0,
   issuedDate: new Date(),
   dueDate: new Date(),
   notes: "",
   status: "Pending",
   createdAt: new Date(Date.now())
}