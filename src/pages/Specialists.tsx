import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { MapPin, Star, Search, Loader2 } from 'lucide-react';
import { fetchSpecialists } from '../services/api';

interface Specialist {
    id: number | string;
    name: string;
    address: string;
    rating: number | null;
    reviews: number;
    lat?: number;
    lng?: number;
    open_now?: boolean | null;
}

export default function Specialists() {
    const [city, setCity] = useState('');
    const [specialists, setSpecialists] = useState<Specialist[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!city.trim()) {
            setError('Please enter a city name');
            return;
        }

        setLoading(true);
        setError('');
        setSpecialists([]);
        setHasSearched(true);

        try {
            const data = await fetchSpecialists(city);
            setSpecialists(data);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to fetch specialists. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Find a Gynecologist Near You</h1>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Connect with trusted healthcare professionals in your area for expert care and advice.
                </p>
            </div>

            <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Enter your city (e.g., New York, Mumbai)"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Searching...</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                <span>Search</span>
                            </>
                        )}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-2 text-sm ml-1">{error}</p>}
            </Card>

            <div className="mt-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                        <p>Finding the best specialists for you...</p>
                    </div>
                ) : specialists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {specialists.map((doctor) => (
                            <Card key={doctor.id} className="p-6 transition-transform hover:-translate-y-1 duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl">
                                        👩‍⚕️
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {doctor.rating !== null && doctor.rating !== undefined && (
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-semibold text-gray-900">{doctor.rating}</span>
                                                <span className="text-xs text-gray-500">({doctor.reviews})</span>
                                            </div>
                                        )}
                                        {doctor.open_now === true && (
                                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Open Now</span>
                                        )}
                                        {doctor.open_now === false && (
                                            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Closed</span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{doctor.name}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{doctor.address}</p>

                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.name + ' ' + doctor.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2.5 rounded-lg border border-gray-200 hover:border-primary hover:text-primary text-gray-600 font-medium transition-colors text-sm"
                                >
                                    View on Google Maps
                                </a>
                            </Card>
                        ))}
                    </div>
                ) : hasSearched ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No specialists found in this area. Try a different city.</p>
                    </div>
                ) : null}
            </div>

            <div className="text-center pt-8 pb-4">
                <p className="text-xs text-gray-400 italic">
                    "Doctor listings are provided via Google Places API for informational purposes only. Please verify details before booking appointments."
                </p>
            </div>
        </div>
    );
}
