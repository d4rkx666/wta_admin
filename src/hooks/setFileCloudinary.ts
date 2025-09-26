"use client";
import {call} from "@/lib/services/api"
import { Contract } from "@/types/contract";
import { Tenant } from "@/types/tenant";
export const upload_cloudinary = async (data: FormData, cloud_name: string)=>{

   const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/raw/upload`;
   const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: data,
    });

    const result = await uploadResponse.json();
    return result.public_id;
}

export const set_contract_file = async (contract: Partial<Contract>)=>{
   const response = await call("/set-contract-file", contract)
   return response;
}

export const set_id_file = async (id: Partial<Tenant>)=>{
   const response = await call("/set-id-file", id)
   return response;
}

export const set_additional_file = async (additional: Partial<Contract>)=>{
   const response = await call("/set-additional-file", additional)
   return response;
}