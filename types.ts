// These interfaces are no longer used as the API provides simpler data structures.
// export interface Currency {
//   code: string;
//   name: string;
//   symbol: string;
// }

// export interface Language {
//   iso639_1: string;
//   iso639_2: string;
//   name: string;
//   nativeName: string;
// }

export interface Country {
  name: string;
  nativeName: string;
  alpha3Code: string;
  flag: string; // URL to the flag image
  callingCodes: string[];
  population: number;
  capital?: string;
  region: string;
  subregion?: string;
  languages: string[];
  currency: string;
  area: number;
  latlng: [number, number];
}
