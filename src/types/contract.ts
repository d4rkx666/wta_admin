import { Timestamp } from "firebase/firestore";

type ContractStatus = "Active" | "Permanent" | "Terminated"

export type Contract = {
   id: string;
   tenant_id: string;
   room_id: string;
   lease_start: Timestamp | Date;
   lease_end: Timestamp | Date;
   contract_file_id?: string;
   aditional_file_id?: string;
   is_current: boolean;
   status: ContractStatus;
   createdAt: Date;
};