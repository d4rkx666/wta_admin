import { Amenity } from "./amenity";

export type Property = {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  num_shared_washroom: number;
  url_map: string;
  enabled: boolean;
  global_amenities: Amenity[];
};

export const PropertyDefaultVal:Property = {
  id: "",
  type: "",
  title: "",
  description: "",
  location: "",
  num_shared_washroom: 0,
  url_map: "",
  enabled: true,
  global_amenities: []
}