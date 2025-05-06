import { Amenity } from "./amenity";

type Images = {
  id: string;
  url: string;
}

export interface IFirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export type Room= {
  id: string;
  room_number: number;
  title: string;
  thumbnail: string;
  price: number;
  fixed_price: number;
  images: Images[];
  available: boolean;
  date_availability: IFirestoreTimestamp;
  private_washroom: boolean;
  description: string;
  specific_amenities: Amenity[]
}

export const RoomDefaultVal: Room = {
    id: '',
    room_number: 0,
    title: '',
    thumbnail: '',
    price: 0,
    fixed_price: 0,
    images: [],
    available: true,
    date_availability: {nanoseconds:0, seconds:0},
    private_washroom: false,
    description: '',
    specific_amenities: [],
  }