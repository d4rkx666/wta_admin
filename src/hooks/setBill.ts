"use client";
import {call} from "@/lib/services/api"
import { Bill } from "@/types/bill";
import { Payment } from "@/types/payment";
import { Tenant } from "@/types/tenant";
export const set_bill = async (bill: Bill, tenantsAndPayments:{tenant: Partial<Tenant>; payment: Partial<Payment> }[])=>{
   const response = await call("/set-bill", {bill, tenantsAndPayments})
   return response;
}