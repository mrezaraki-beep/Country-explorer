import React, { useEffect, useState } from 'react';
import { useCountryStore } from './store/useCountryStore';
import type { Country } from './types';
import Shuffle from './components/Shuffle';
import DotGrid from './components/DotGrid';
import GlobeIcon from './components/GlobeIcon';
import StarBorder from './components/StarBorder';

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-500 dark:text-slate-400">
            <svg className="animate-spin h-10 w-10 text-teal-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg">Loading Countries...</p>
        </div>
    </div>
);


// --- UI Components ---
const CountryListItem: React.FC<{ country: Country; onSelect: (country: Country) => void; }> = ({ country, onSelect }) => {
    const callingCode = country.callingCodes?.[0] ? `+${country.callingCodes[0]}` : null;
    return (
        <li
            onClick={() => onSelect(country)}
            className="flex items-center p-3 cursor-pointer transition-colors duration-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
        >
            <img src={country.flag} alt={`${country.name} flag`} className="w-10 h-6 object-cover mr-4 rounded-md shadow-md flex-shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                {callingCode ? `(${callingCode}) ${country.name}` : country.name}
            </span>
        </li>
    );
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-200 dark:border-slate-700">
        <span className="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-slate-800 dark:text-slate-200 sm:text-right">{value}</span>
    </div>
);

const CountryDetail: React.FC = () => {
    const { selectedCountry } = useCountryStore();

    // This component is only rendered when a country is selected, so we can assert it's not null.
    const { name, flag, callingCodes, population, capital, region, subregion, languages, currency, area, latlng, nativeName } = selectedCountry!;
    
    const displayCallingCode = callingCodes?.length > 0 ? callingCodes.map(c => `+${c}`).join(', ') : 'N/A';
    const languagesString = languages?.length > 0 ? languages.join(', ') : 'N/A';
    const currencyString = currency || 'N/A';
    const googleMapsUrl = latlng ? `https://www.google.com/maps?q=${latlng[0]},${latlng[1]}` : '#';

    return (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 overflow-y-auto h-full border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6">
                <img src={flag} alt={`Flag of ${name}`} className="w-32 sm:w-48 h-auto mx-auto mb-4 rounded-lg shadow-md border-2 border-slate-200 dark:border-slate-700"/>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{name}</h2>
                <p className="text-md text-slate-500 dark:text-slate-400">{nativeName}</p>
            </div>

            <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 border-b-2 border-teal-500 pb-2 mb-4">Details</h3>
                <DetailRow label="Calling Code" value={displayCallingCode} />
                <DetailRow label="Languages" value={languagesString} />
                <DetailRow label="Currency" value={currencyString} />
                <DetailRow label="Area" value={<>{area ? area.toLocaleString() : 'N/A'} km<sup>2</sup></>} />

                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 border-b-2 border-teal-500 pb-2 mb-4 pt-4">Demographics</h3>
                <DetailRow label="Population" value={population.toLocaleString()} />
                <DetailRow label="Capital" value={capital || 'N/A'} />
                <DetailRow label="Region" value={region} />
                <DetailRow label="Subregion" value={subregion || 'N/A'} />

                <div className="pt-6 text-center">
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" 
                       className="inline-flex items-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View on Google Maps
                    </a>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
const App: React.FC = () => {
    const { countries, filter, setFilter, selectedCountry, selectCountry, fetchCountries, isLoading, error } = useCountryStore();
    const [isDarkMode, setIsDarkMode] = useState(
        typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    useEffect(() => {
        fetchCountries();
    }, [fetchCountries]);
    
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setIsDarkMode(mediaQuery.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const filteredCountries = countries.filter(country => {
        if (!filter) return false;
        const searchTerm = filter.toLowerCase();
        const callingCode = country.callingCodes?.join(' ') ?? '';
        
        return country.name.toLowerCase().includes(searchTerm) || 
               country.alpha3Code.toLowerCase().includes(searchTerm) ||
               (callingCode && callingCode.includes(filter));
    });

    return (
        <div className="relative flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-500">
             <DotGrid
                dotSize={2}
                gap={25}
                baseColor={isDarkMode ? '#475569' : '#e2e8f0'} // slate-600, slate-200
                activeColor={isDarkMode ? '#2dd4bf' : '#14b8a6'} // teal-400, teal-500
                proximity={100}
                className="absolute inset-0 -z-10"
            />
            <main className="relative z-10 flex-grow container mx-auto p-4 md:p-6 flex flex-col items-center pt-8 sm:pt-16">
                {isLoading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-6 rounded-lg">
                            <h2 className="text-xl font-bold">Error</h2>
                            <p className="mt-2">Could not load country data.</p>
                             <p className="text-sm text-red-500 dark:text-red-500 mt-1">{error}</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl">
                        <div className="text-center mb-6">
                            <h1 className="flex justify-center items-center">
                                <Shuffle
                                    text="Country"
                                    className="!text-3xl sm:!text-4xl font-bold text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-300 ease-in-out"
                                    tag="span"
                                />
                                <GlobeIcon className="h-8 w-8 sm:h-10 sm:w-10 mx-2 text-teal-500 dark:text-teal-400 transition-transform hover:rotate-12 duration-300" />
                                <Shuffle
                                    text="Explorer"
                                    className="!text-3xl sm:!text-4xl font-bold text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-300 ease-in-out"
                                    tag="span"
                                />
                            </h1>
                        </div>
                        
                        <div className="relative w-3/5 mx-auto mt-10">
                             <StarBorder
                                as="div"
                                className="w-full shadow-md"
                                thickness={2}
                                color={isDarkMode ? '#2dd4bf' : '#14b8a6'}
                                innerClassName="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                                rounded="rounded-lg"
                            >
                                <input
                                    type="text"
                                    placeholder="Search for a country by name, code, or calling code..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full px-4 py-2 border-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-transparent text-slate-900 dark:text-slate-100 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </StarBorder>
                            {/* Search Results Dropdown */}
                            {filter && !selectedCountry && (
                                <div className="absolute mt-2 w-full max-h-80 overflow-y-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg z-10 border border-slate-200 dark:border-slate-700">
                                    {filteredCountries.length > 0 ? (
                                        <ul className="p-2 space-y-1">
                                            {filteredCountries.map(country => (
                                                <CountryListItem 
                                                    key={country.alpha3Code} 
                                                    country={country} 
                                                    onSelect={selectCountry} 
                                                />
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="p-4 text-center text-slate-500 dark:text-slate-400">No countries found.</p>
                                    )}
                                </div>
                            )}
                        </div>
                       
                        {/* Selected Country Details */}
                        {selectedCountry && (
                            <div className="mt-8 w-full">
                                <CountryDetail />
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;