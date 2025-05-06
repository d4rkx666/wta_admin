"use client";
import {call} from "@/lib/services/api"
import { Property } from "@/types/property";
export const del_property = async (data: Property)=>{
   const response = await call<Property>("/del-property", data)
   return response;
}