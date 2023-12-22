import { Bike } from "./bike-list.interface";

export interface StationResponse {
    id:          string;
    name:        string;
    coordinates: string;
    capacity:    number;
    bikes:       number;
}
