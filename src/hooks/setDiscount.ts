"use client";
import {call} from "@/lib/services/api"
import { Payment } from "@/types/payment";
export const set_discount = async (payment: Payment)=>{
   const response = await call<Payment>("/set-discount", payment)
   return response;
}