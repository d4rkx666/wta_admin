export type Tenant = {
   id: string;
   room_id: string;
   name: string;
   couple_name?: string;
   email: string;
   phone: string;
   lease_start: Date;
   lease_end: Date;
   has_paid_deposit: boolean;
   contract_file_id?: string;
   identification_file_id?: string;
};

export const TenantDefaultVal:Tenant = {
   id: "",
   room_id: "",
   name: "",
   email: "",
   phone: "",
   lease_start: new Date(),
   lease_end: new Date(),
   has_paid_deposit: false,
}