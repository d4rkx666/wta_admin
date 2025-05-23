"use client";
import {call} from "@/lib/services/api"
import { Tenant } from "@/types/tenant";
export const get_tenant_files = async (tenant: Tenant)=>{
   const response = await call<Tenant>("/get-cloud-files", tenant)
   return response;
}