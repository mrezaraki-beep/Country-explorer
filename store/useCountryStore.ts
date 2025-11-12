import { create } from 'zustand';
import type { Country } from '../types';

interface CountryState {
  countries: Country[];
  selectedCountry: Country | null;
  filter: string;
  isLoading: boolean;
  error: string | null;
  selectCountry: (country: Country | null) => void;
  setFilter: (filter: string) => void;
  fetchCountries: () => Promise<void>;
}

export const useCountryStore = create<CountryState>((set) => ({
  countries: [],
  selectedCountry: null,
  filter: '',
  isLoading: false,
  error: null,

  selectCountry: (country: Country | null) => {
    set({ selectedCountry: country });
  },

  setFilter: (filter: string) => {
    // When a new search is initiated, clear the selected country
    set({ filter, selectedCountry: null });
  },

  fetchCountries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('https://restcountries.com/v3.1/independent?status=true');
      if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.statusText}`);
      }
      const data = await response.json();
      
      const mappedCountries: Country[] = data.map((c: any) => ({
        name: c.name.common,
        // FIX: Cast the result of Object.values to a specific type to avoid 'unknown' type error.
        nativeName: c.name.nativeName ? (Object.values(c.name.nativeName)[0] as { common: string }).common : c.name.common,
        alpha3Code: c.cca3,
        flag: c.flags.svg,
        callingCodes: c.idd.root && c.idd.suffixes ? c.idd.suffixes.map((suffix: string) => `${c.idd.root}${suffix}`.replace(/\+/g, '')) : [],
        population: c.population,
        capital: c.capital?.[0],
        region: c.region,
        subregion: c.subregion,
        languages: c.languages ? Object.values(c.languages) : [],
        // FIX: Cast the result of Object.values to a specific type to avoid 'unknown' type error.
        currency: c.currencies ? `${(Object.values(c.currencies)[0] as { name: string }).name} (${Object.keys(c.currencies)[0]})` : 'N/A',
        area: c.area,
        latlng: c.latlng,
      }));

      const sortedCountries = mappedCountries.sort((a, b) => a.name.localeCompare(b.name));
      set({ countries: sortedCountries, isLoading: false });

    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));