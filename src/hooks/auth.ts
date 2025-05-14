"use client";
import {call} from "@/lib/services/api"
export const auth_user = async (token: string)=>{
   const response = await call<string>("/auth", "", true, token)
   return response;
}