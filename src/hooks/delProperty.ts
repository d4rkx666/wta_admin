"use client";
import {call} from "@/lib/services/api"
import { Property } from "@/types/property";
import { Room } from "@/types/room";
export const del_property = async ({property, rooms}: {property: Property, rooms: Room[]})=>{
   const response = await call("/del-property", {property, rooms})
   return response;
}