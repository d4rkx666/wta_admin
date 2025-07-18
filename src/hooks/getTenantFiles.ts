"use client";
import {call} from "@/lib/services/api"
import { Contract } from "@/types/contract";
import { Tenant } from "@/types/tenant";
export const get_tenant_files = async (tenant: Tenant, contract: Contract | undefined)=>{
   const response = await call("/get-cloud-files", {tenant, contract})
   return response;
}