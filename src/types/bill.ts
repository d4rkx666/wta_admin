

export type Bill = {
   id: string;
   propertyId: string;
   propertyName: string;
   billType: 'Electricity' | 'Gas' | 'Water' | 'Internet' | 'Cable' | 'Maintenance' | 'Other';
   period: string; // Format: YYYY-MM
   amount: number;
   dueDate: string;
   status: 'Paid' | 'Unpaid' | 'Pending';
   assignedTenants: string[];
   notes: string;
};