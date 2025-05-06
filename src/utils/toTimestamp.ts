import { Timestamp } from "firebase-admin/firestore";


export function toTimestamp({seconds, nanoseconds}:{seconds: number, nanoseconds: number}): Timestamp{
   const newTS = new Timestamp(seconds, nanoseconds);

   return newTS;
}