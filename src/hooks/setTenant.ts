"use client";
import {call} from "@/lib/services/api"
import { Payment } from "@/types/payment";
import { Tenant } from "@/types/tenant";
export const set_tenant = async (tenant: Tenant, deposit: Partial<Payment>, rent: Partial<Payment>)=>{
   const response = await call("/set-tenant", {tenant, deposit, rent})
   return response;
}