"use client";
import {call} from "@/lib/services/api"
import { Property } from "@/types/property";
import { Room } from "@/types/room";
export const del_room = async ({property, room}:{property: Property, room: Room})=>{
   const response = await call("/del-room", {property, room})
   return response;
}