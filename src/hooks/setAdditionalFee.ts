"use client";
import {call} from "@/lib/services/api"
import { Payment } from "@/types/payment";
export const set_additional_fee = async (payment: Partial<Payment>)=>{
   const response = await call("/set-additional-fee", payment)
   return response;
}