import { Timestamp } from "firebase/firestore";
import { Amenity } from "./amenity";

type Images = {
  id: string;
  url: string;
}

export type Room= {
  id: string;
  id_property: string;
  room_number: number;
  title: string;
  thumbnail: string;
  price: number;
  fixed_price: number;
  images: Images[];
  available: boolean;
  date_availability: Date | Timestamp;
  private_washroom: boolean;
  description: string;
  specific_amenities: Amenity[]
}

export const RoomDefaultVal: Room = {
    id: '',
    id_property: '',
    room_number: 0,
    title: '',
    thumbnail: '',
    price: 0,
    fixed_price: 0,
    images: [],
    available: true,
    date_availability: new Date(),
    private_washroom: false,
    description: '',
    specific_amenities: [],
  }