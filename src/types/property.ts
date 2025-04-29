import { Timestamp } from "firebase/firestore";

// types/firestore.ts
export type Property = {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  num_shared_washroom: number;
  url_map: string;
  rooms: [
    title: string,
    description: string,
    price: number,
    fixed_price: number,
    private_washroom: boolean,
    available: boolean,
    date_availability: Timestamp
  ]
};