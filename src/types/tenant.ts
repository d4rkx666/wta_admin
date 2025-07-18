export type Tenant = {
   id: string;
   name: string;
   couple_name?: string;
   email: string;
   phone: string;
   has_paid_deposit: boolean;
   current_contract_id: string;
   identification_file_id?: string;
   createdAt: Date;
};