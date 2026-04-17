import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Leaf, Utensils, Dumbbell, ShoppingBag, ExternalLink, X } from 'lucide-react';
import api from '../utils/api';

// ─── Delivery platform config ──────────────────────────────────────────────
const PLATFORMS = [
    {
        id: 'swiggy',
        name: 'Swiggy',
        color: 'from-orange-500 to-orange-600',
        hover: 'hover:shadow-orange-300',
        emoji: '🛵',
        buildUrl: (q: string) =>
            `https://www.swiggy.com/search?query=${encodeURIComponent(q)}`,
    },
    {
        id: 'zomato',
        name: 'Zomato',
        color: 'from-red-500 to-rose-600',
        hover: 'hover:shadow-red-300',
        emoji: '🍽️',
        buildUrl: (q: string) =>
            `https://www.zomato.com/search?q=${encodeURIComponent(q)}`,
    },
    {
        id: 'blinkit',
        name: 'Blinkit',
        color: 'from-yellow-400 to-yellow-500',
        hover: 'hover:shadow-yellow-300',
        emoji: '⚡',
        buildUrl: (q: string) =>
            `https://blinkit.com/s/?q=${encodeURIComponent(q)}`,
    },
    {
        id: 'zepto',
        name: 'Zepto',
        color: 'from-violet-500 to-purple-600',
        hover: 'hover:shadow-purple-300',
        emoji: '🟣',
        buildUrl: (q: string) =>
            `https://www.zeptonow.com/search?query=${encodeURIComponent(q)}`,
    },
];

// ─── Keyword → food-delivery-friendly phrase mappings ──────────────────────
const KEYWORD_MAP: Record<string, string> = {
    'whole grain': 'whole grain healthy meal',
    'whole grains': 'whole grain healthy meal',
    oats: 'healthy oats bowl',
    berries: 'berry smoothie bowl',
    berry: 'berry smoothie bowl',
    hydration: 'fresh juice healthy drink',
    'lean protein': 'grilled chicken salad',
    protein: 'high protein meal',
    'low glycemic': 'low glycemic vegetarian meal',
    fiber: 'high fiber meal',
    'high fiber': 'high fiber meal',
    omega: 'omega rich salmon salad',
    spinach: 'spinach salad healthy meal',
    green: 'green vegetable healthy meal',
    antioxidant: 'antioxidant rich salad',
    thyroid: 'iodine rich seafood bowl',
    soy: 'soy protein healthy meal',
    flax: 'flaxseed smoothie bowl',
    calcium: 'calcium rich healthy meal',
    iron: 'iron rich spinach meal',
    avocado: 'avocado toast healthy',
    nuts: 'mixed nuts healthy snack',
    lentil: 'lentil soup healthy',
    quinoa: 'quinoa salad bowl',
    turmeric: 'turmeric golden milk',
};

/**
 * Converts an array of diet item titles into a compact, search-friendly string.
 * Picks the top 2–3 titles, maps keywords, then joins them.
 */
function buildSearchQuery(dietItems: { title: string }[]): string {
    const picked = dietItems.slice(0, 3);

    const phrases = picked.map((item) => {
        const lower = item.title.toLowerCase();

        // Try keyword map first
        for (const [kw, phrase] of Object.entries(KEYWORD_MAP)) {
            if (lower.includes(kw)) return phrase;
        }

        // Fallback: use the title itself with "healthy meal" suffix
        return `${item.title.trim()} healthy meal`;
    });

    // Deduplicate and join
    const unique = [...new Set(phrases)];
    return unique.slice(0, 2).join(' ');
}

// ─── Order Modal ────────────────────────────────────────────────────────────
function OrderModal({
    isOpen,
    onClose,
    searchQuery,
}: {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
}) {
    if (!isOpen) return null;

    const handlePlatformClick = (buildUrl: (q: string) => string) => {
        window.open(buildUrl(searchQuery), '_blank', 'noopener,noreferrer');
        onClose();
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Choose delivery platform"
        >
            {/* Modal panel — stop propagation so clicks inside don't close it */}
            <div
                className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Order Healthy Meal</h3>
                        <p className="text-xs text-gray-400">Choose your delivery platform</p>
                    </div>
                </div>

                {/* Search preview pill */}
                <div className="mt-4 mb-5 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    <p className="text-xs text-gray-500 truncate">
                        <span className="font-semibold text-gray-700">Searching for: </span>
                        {searchQuery}
                    </p>
                </div>

                {/* Platform buttons */}
                <div className="space-y-3">
                    {PLATFORMS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => handlePlatformClick(p.buildUrl)}
                            aria-label={`Order on ${p.name}`}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-white font-semibold text-sm
                                bg-gradient-to-r ${p.color}
                                shadow-md ${p.hover} hover:shadow-lg
                                hover:scale-[1.02] active:scale-[0.98]
                                transition-all duration-200 ease-in-out`}
                        >
                            <span className="text-xl">{p.emoji}</span>
                            <span>{p.name}</span>
                            <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
                        </button>
                    ))}
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                    Aligned with your personalized health plan
                </p>
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Recommendations() {
    const navigate = useNavigate();
    const [disease, setDisease] = React.useState('');
    const [recos, setRecos] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [orderModalOpen, setOrderModalOpen] = React.useState(false);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Get highest risk
            const riskData = await api("/risk/latest");
            if (riskData.riskAnalysis && riskData.riskAnalysis.length > 0) {
                const highest = riskData.riskAnalysis[0].disease;
                setDisease(highest);

                // 2. Get recommendations for it
                const recoData = await api(`/recommendations/${highest}`);
                setRecos(recoData.recommendations);
            }
        } catch (err) {
            console.error("Failed to fetch recommendations", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Finding best tips for you...</div>;

    const hasDiet = recos?.diet?.length > 0;
    const searchQuery = hasDiet ? buildSearchQuery(recos.diet) : '';

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Personalized for {disease || 'You'}</h2>
                    <p className="text-sm text-gray-500">Based on your latest symptom analysis</p>
                </div>
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    {disease ? `${disease} Focused` : 'General Wellness'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Yoga / Activity Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                        <Dumbbell className="w-5 h-5 text-accent" />
                        <h3>Recommended Activity</h3>
                    </div>
                    {(recos?.yoga?.length > 0 || recos?.exercise?.length > 0) ? (
                        <div className="space-y-4">
                            {[...(recos?.yoga || []), ...(recos?.exercise || [])].map((item, i) => (
                                <Card key={i} hoverEffect className="overflow-hidden">
                                    <div className="exercise-card-img-wrap">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="exercise-image"
                                                onError={(e) => {
                                                    console.log("Image load failed:", item.image_url);
                                                    (e.currentTarget as HTMLImageElement).src = '/images/yoga/surya-namaskar.jpeg';
                                                }}
                                            />
                                        ) : (
                                            <div className="exercise-img-fallback">
                                                🧘 No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="exercise-card-body">
                                        <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                        <p className="text-gray-600 mb-4">{item.description}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-4 text-gray-500 text-center italic">No specific activities found.</Card>
                    )}
                </section>

                {/* Dietary Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                        <Utensils className="w-5 h-5 text-secondary" />
                        <h3>Nutrition Plan</h3>
                    </div>
                    <Card hoverEffect className="h-full">
                        <h4 className="text-xl font-bold mb-4">Dietary Focus</h4>
                        {hasDiet ? (
                            <>
                                <ul className="space-y-3">
                                    {recos.diet.map((item: any, i: number) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">🥗</div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-500">{item.description}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* ── Order Healthy Meal Button ── */}
                                <div className="mt-6 pt-5 border-t border-gray-100">
                                    <button
                                        onClick={() => setOrderModalOpen(true)}
                                        aria-label="Order a healthy meal aligned with your diet plan"
                                        className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl
                                            font-semibold text-sm text-white
                                            bg-gradient-to-r from-purple-600 to-violet-600
                                            shadow-md hover:shadow-purple-300 hover:shadow-lg
                                            hover:scale-[1.02] active:scale-[0.98]
                                            transition-all duration-200 ease-in-out
                                            focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        Order Healthy Meal
                                    </button>
                                    <p className="mt-2 text-center text-xs text-gray-400">
                                        Order meals aligned with your health plan
                                    </p>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500 italic">No dietary tips found.</p>
                        )}
                    </Card>
                </section>

                {/* Ayurvedic Tips */}
                <section className="col-span-1 md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                        <Leaf className="w-5 h-5 text-green-600" />
                        <h3>Ayurvedic Wellness</h3>
                    </div>
                    {recos?.ayurveda?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recos.ayurveda.map((item: any, i: number) => (
                                <Card key={i} className="bg-gradient-to-r from-green-50 to-teal-50 border-green-100">
                                    <h4 className="text-lg font-bold text-green-800 mb-2">{item.title}</h4>
                                    <p className="text-green-700 leading-relaxed text-sm">
                                        {item.description}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-4 text-gray-500 italic">No ayurvedic tips found.</Card>
                    )}
                </section>
            </div>

            <div className="flex justify-center pt-8 border-t border-gray-100">
                <button
                    onClick={() => navigate('/session', { state: { recos } })}
                    className="flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
                >
                    <Dumbbell className="w-6 h-6" />
                    Start Guided Session
                </button>
            </div>

            {/* Order Platform Modal */}
            <OrderModal
                isOpen={orderModalOpen}
                onClose={() => setOrderModalOpen(false)}
                searchQuery={searchQuery}
            />
        </div>
    );
}
