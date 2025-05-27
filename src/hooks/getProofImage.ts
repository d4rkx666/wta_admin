"use client";
import {call} from "@/lib/services/api"
import { Payment } from "@/types/payment";
export const get_proof_image = async (payment: Payment)=>{
   const response = await call<Payment>("/get-cloud-proof", payment)
   return response;
}