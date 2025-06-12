"use client";
import {call} from "@/lib/services/api"
import { Payment } from "@/types/payment";
export const del_assign= async (data: Partial<Payment>)=>{
   const response = await call("/del-assign", data)
   return response;
}