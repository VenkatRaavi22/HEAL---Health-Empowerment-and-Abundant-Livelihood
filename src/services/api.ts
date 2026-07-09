const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// City-specific mock doctors — used when backend is unreachable
const getMockSpecialists = (city: string) => [
    { id: 'mock-1', name: 'Dr. Priya Sharma', address: `City Hospital, Main Road, ${city}`, rating: 4.8, reviews: 142, open_now: null },
    { id: 'mock-2', name: 'Dr. Anjali Rao', address: `Apollo Clinic, Gandhi Nagar, ${city}`, rating: 4.6, reviews: 98, open_now: null },
    { id: 'mock-3', name: 'Dr. Kavitha Reddy', address: `Maternity & Women\'s Centre, Station Rd, ${city}`, rating: 4.7, reviews: 76, open_now: null },
    { id: 'mock-4', name: 'Dr. Sunita Verma', address: `Health Plus Hospital, MG Road, ${city}`, rating: 4.5, reviews: 53, open_now: null },
];

// Fetches real gynecologist specialists from Google Places via the backend.
// Falls back to mock data if the backend/API is unavailable.
export const fetchSpecialists = async (city: string) => {
    if (!city || !city.trim()) {
        throw new Error('Please enter a city name');
    }

    const cityName = city.trim();

    try {
        const response = await fetch(
            `${API_BASE_URL}/specialists?city=${encodeURIComponent(cityName)}`
        );

        if (!response.ok) {
            console.warn(`Backend returned ${response.status} — using mock data`);
            return getMockSpecialists(cityName);
        }

        const data = await response.json();

        // If the backend returned an empty array, still show mock data for a better demo
        if (!data || data.length === 0) {
            return getMockSpecialists(cityName);
        }

        return data;
    } catch (err) {
        // Network error, CORS issue, backend down, etc.
        console.warn('Could not reach backend — using mock data:', err);
        return getMockSpecialists(cityName);
    }
};
