"use client";
import {call} from "@/lib/services/api"
import { Property } from "@/types/property";
export const set_property = async (data: Property)=>{
   const response = await call<Property>("/set-property", data)
   return response;
}