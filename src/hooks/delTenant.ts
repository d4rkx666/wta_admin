"use client";
import {call} from "@/lib/services/api"
import { Tenant } from "@/types/tenant";
export const del_tenant = async (data: Partial<Tenant>)=>{
   const response = await call("/del-tenant", data)
   return response;
}