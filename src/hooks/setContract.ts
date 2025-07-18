"use client";
import {call} from "@/lib/services/api"
export const set_contract = async (data: FormData)=>{
   const response = await call("/set-contract", data, false)
   return response;
}