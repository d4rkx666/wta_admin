"use client";
import {call} from "@/lib/services/api"
export const set_room = async (data: FormData)=>{
   const response = await call<FormData>("/set-room", data, false)
   return response;
}