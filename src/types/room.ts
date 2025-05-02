import { Timestamp } from "firebase/firestore";
import { Amenity } from "./amenity";

export type Room= {
  id: string;
  room_number: number;
  title: string;
  thumbnail: string;
  price: number;
  fixed_price: number;
  images: [];
  available: boolean;
  date_availability: Timestamp;
  private_washroom: boolean;
  description: string;
  specific_amenities: Amenity[]
}