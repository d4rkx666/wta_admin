"use client";
import {call} from "@/lib/services/api"
export const set_tenant = async (data: FormData)=>{
   const response = await call("/set-tenant", data, false)
   return response;
}