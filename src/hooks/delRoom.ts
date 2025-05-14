"use client";
import {call} from "@/lib/services/api"
import { Room } from "@/types/room";
export const del_room = async (data: Room)=>{
   const response = await call("/del-room", data)
   return response;
}