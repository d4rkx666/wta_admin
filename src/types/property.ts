import { Amenity } from "./amenity";
import { Room } from "./room";

export type Property = {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  num_shared_washroom: number;
  url_map: string;
  rooms: Room[];
  enabled: boolean;
  global_amenities: Amenity[]
};

export const PropertyDefaultVal:Property = {
  id: "",
  type: "",
  title: "",
  description: "",
  location: "",
  num_shared_washroom: 0,
  url_map: "",
  rooms: [],
  enabled: true,
  global_amenities: [],
}