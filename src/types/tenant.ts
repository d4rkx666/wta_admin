import { Timestamp } from "firebase/firestore";

export type Tenant = {
   id: string;
   room_id: string;
   name: string;
   couple_name?: string;
   email: string;
   phone: string;
   lease_start: Timestamp | Date;
   lease_end: Timestamp | Date;
   has_paid_deposit: boolean;
   contract_file_id?: string;
   identification_file_id?: string;
   createdAt: Date;
};