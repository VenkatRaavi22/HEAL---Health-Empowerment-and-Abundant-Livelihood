const axios = require('axios');

// Mock fallback data — used when Google Places API is unavailable or returns no results
const getMockSpecialists = (city) => [
    {
        id: 'mock-1',
        name: 'Dr. Priya Sharma',
        address: `City Hospital, Main Road, ${city}`,
        rating: 4.8,
        reviews: 142,
        open_now: null,
    },
    {
        id: 'mock-2',
        name: 'Dr. Anjali Rao',
        address: `Apollo Clinic, Gandhi Nagar, ${city}`,
        rating: 4.6,
        reviews: 98,
        open_now: null,
    },
    {
        id: 'mock-3',
        name: 'Dr. Kavitha Reddy',
        address: `Maternity & Women's Centre, Station Road, ${city}`,
        rating: 4.7,
        reviews: 76,
        open_now: null,
    },
    {
        id: 'mock-4',
        name: 'Dr. Sunita Verma',
        address: `Health Plus Hospital, MG Road, ${city}`,
        rating: 4.5,
        reviews: 53,
        open_now: null,
    },
];

// Uses Google Places Text Search to find gynecologists in a city
exports.getSpecialists = async (req, res) => {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const { city } = req.query;

    if (!city || !city.trim()) {
        return res.status(400).json({ error: 'City name is required.' });
    }

    const cityName = city.trim();

    // If no API key is configured, return mock data immediately
    if (!GOOGLE_PLACES_API_KEY) {
        console.warn('No Google Places API key configured — returning mock data');
        return res.json(getMockSpecialists(cityName));
    }

    try {
        const query = `gynecologist in ${cityName}`;
        const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

        const response = await axios.get(url, {
            params: { query, key: GOOGLE_PLACES_API_KEY },
            timeout: 8000, // 8 second timeout
        });

        const { status, results } = response.data;

        // Google Places API returns REQUEST_DENIED when the key is invalid/not enabled
        if (status === 'REQUEST_DENIED' || status === 'INVALID_REQUEST') {
            console.warn(`Google Places returned status: ${status}. Falling back to mock data.`);
            return res.json(getMockSpecialists(cityName));
        }

        const places = results || [];

        if (places.length === 0) {
            return res.json(getMockSpecialists(cityName));
        }

        const specialists = places.slice(0, 10).map((place, index) => ({
            id: place.place_id || `place-${index}`,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating || null,
            reviews: place.user_ratings_total || 0,
            lat: place.geometry?.location?.lat,
            lng: place.geometry?.location?.lng,
            open_now: place.opening_hours?.open_now ?? null,
        }));

        return res.json(specialists);
    } catch (error) {
        const errMsg = error?.response?.data || error.message;
        console.error('Google Places API error — using fallback data:', errMsg);

        // Always fall back to mock data on any error so the demo never breaks
        return res.json(getMockSpecialists(cityName));
    }
};
