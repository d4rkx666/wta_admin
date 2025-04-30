import { Room } from "./room";

export type GlobalAmenities = {
  name: string;
  available: boolean;
};

export type Property = {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  num_shared_washroom: number;
  url_map: string;
  rooms: Room[];
  global_amenities: GlobalAmenities[]
};