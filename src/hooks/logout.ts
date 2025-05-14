"use client";
import {call} from "@/lib/services/api"
export const logout_user = async ()=>{
   const response = await call<string>("/logout", "")
   return response;
}