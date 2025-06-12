"use client";
import {call} from "@/lib/services/api"
import { Bill } from "@/types/bill";
export const del_bill = async (data: Partial<Bill>)=>{
   const response = await call("/del-bill", data)
   return response;
}