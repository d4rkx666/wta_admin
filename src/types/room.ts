import { Timestamp } from "firebase/firestore";

export type Amenity = {
  name: string;
  available: boolean;
}

export type Room= {
  id: string;
  id_property: string;
  title: string;
  location: string;
  url_map: string;
  thumbnail: string;
  price: number;
  furnished: boolean;
  roommates: number;
  images: [];
  available: boolean;
  date_availability: Timestamp;
  private_washroom: boolean;
  description: string;
  specific_amenities: Amenity[]
}