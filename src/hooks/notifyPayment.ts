"use client";
import {call} from "@/lib/services/api"
import { Payment } from "@/types/payment";
export const notify_payment = async (payment: Payment)=>{
   const response = await call<Payment>("/notify-payment", payment)
   return response;
}