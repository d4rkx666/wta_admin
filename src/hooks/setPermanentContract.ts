"use client";
import {call} from "@/lib/services/api"
import { Contract } from "@/types/contract";
export const set_permanent_contract = async (contract: Contract)=>{
   const response = await call("/set-permanent-contract", contract)
   return response;
}