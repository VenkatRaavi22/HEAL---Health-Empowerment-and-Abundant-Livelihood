import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Leaf, Utensils, Dumbbell, ShoppingBag, ExternalLink, X, Sparkles, HeartPulse } from 'lucide-react';
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

// ─── Image lookup map: title → image path ─────────────────────────────────
// Prefers individual pose images, falls back to Bezawada group shots
const IMAGE_MAP: Record<string, string> = {
    // ── Yoga poses (individual images from /images/yoga/) ──
    'Supta Baddha Konasana': '/images/yoga/supta-baddha-konasana.jpeg',
    'Marjaryasana-Bitilasana': '/images/yoga/Marjariasana-Bitilasana.jpeg',
    'Marjaryasana': '/images/yoga/cat-cow-pose.jpeg',
    'Balasana': '/images/yoga/balasana.jpeg',
    'Surya Namaskar': '/images/yoga/surya-namaskar.jpeg',
    'Malasana': '/images/yoga/malasana.jpeg',
    'Setu Bandhasana': '/images/yoga/setu-bandhasana.jpeg',
    'Adho Mukha Svanasana': '/images/yoga/adho-mukha-svanasana.jpeg',
    'Dhanurasana': '/images/yoga/dhanurasana.jpeg',
    'Paschimottanasana': '/images/yoga/paschimottanasana.jpeg',
    'Tadasana': '/images/yoga/tadasana.jpeg',
    'Vrikshasana': '/images/yoga/vrikshasana.jpeg',
    'Ustrasana': '/images/yoga/ustarasana.jpeg',
    'Viparita Karani': '/images/yoga/viparita-karani.jpeg',
    'Sarvangasana': '/images/yoga/sarvangasana.jpeg',
    'Halasana': '/images/yoga/halasana.jpeg',
    'Matsyasana': '/images/yoga/matsyasana.jpeg',
    'Cat-Cow': '/images/yoga/cat-cow-pose.jpeg',
    'Happy Baby Pose': '/images/yoga/happy-baby-pose.jpeg',
    'Supta Matsyendrasana': '/images/yoga/supta-matsyendrasana.jpeg',
    'Pigeon Pose': '/images/yoga/pigeon-pose.jpeg',

    // ── Exercise images (from /images/exercise/) ──
    'Brisk Walking': '/images/bezawada/th.jpeg',
    'Walking': '/images/bezawada/th.jpeg',
    'Jogging': '/images/exercise/jogging.jpeg',
    'Swimming': '/images/exercise/swim.jpeg',
    'Cycling': '/images/exercise/cycling.jpeg',
    'Pilates': '/images/exercise/pilates.jpeg',
    'HIIT': '/images/exercise/hiit.jpeg',
    'Boxing': '/images/exercise/boxing.jpeg',
    'Zumba': '/images/exercise/zumba.jpeg',
    'Tai Chi': '/images/exercise/tai-chi.jpeg',
    'Yoga': '/images/bezawada/Top.jpg',
    'Water Aerobics': '/images/exercise/water-aerobics.jpeg',
    'Strength Training': '/images/exercise/strength-training.jpeg',
    'Running': '/images/exercise/jogging.jpeg',
    'CrossFit': '/images/exercise/crossfit.jpeg',
    'Resistance Training': '/images/bezawada/cardio-light-workout.jpg',
    'Static Stretching': '/images/exercise/static-stretch.jpeg',
    'Light Resistance': '/images/bezawada/cardio-light-workout.jpg',
    'Power Yoga': '/images/exercise/power-yoga.jpeg',
    'Elliptical': '/images/exercise/elliptical.jpg',

    // ── Diet images (from Bezawada) ──
    'Nuts': '/images/bezawada/istockphoto-1307904011-612x612.jpg',
    'Whole Eggs': '/images/bezawada/istockphoto-1307904011-612x612.jpg',
    'lodized Salt': '/images/bezawada/istockphoto-1307904011-612x612.jpg',
    'Seaweed': '/images/bezawada/diet-plan-for-thyroid.webp',
    'Dairy Products': '/images/bezawada/diet-plan-for-thyroid.webp',
    'Beans': '/images/bezawada/diet-plan-for-thyroid.webp',
    'Gluten-Free Diet': '/images/bezawada/7adbb67cb3e94365c0bafd31ae0d0c44.jpg',
    'Cruciferous Veggies (Cooked)': '/images/bezawada/7adbb67cb3e94365c0bafd31ae0d0c44.jpg',
    'Probiotics': '/images/bezawada/7adbb67cb3e94365c0bafd31ae0d0c44.jpg',
};

/** Resolve the best image for a recommendation item */
function resolveImage(item: any, category: string): string | null {
    // 1. Use DB-stored image_url if valid
    if (item.image_url && item.image_url.startsWith('/images/')) return item.image_url;
    // 2. Lookup by title
    if (IMAGE_MAP[item.title]) return IMAGE_MAP[item.title];
    // 3. Category-based fallback
    if (category === 'yoga') return '/images/bezawada/Top.jpg';
    if (category === 'exercise') return '/images/bezawada/cardio-light-workout.jpg';
    if (category === 'diet') return '/images/bezawada/istockphoto-1307904011-612x612.jpg';
    return null;
}

// ─── Condition theme config ────────────────────────────────────────────────
const CONDITION_THEME: Record<string, { gradient: string; badge: string; icon: string; riskColors: Record<string, string> }> = {
    PCOS: {
        gradient: 'from-pink-50 via-rose-50 to-fuchsia-50',
        badge: 'bg-pink-500',
        icon: '🌸',
        riskColors: { low: 'border-l-emerald-400', moderate: 'border-l-amber-400', high: 'border-l-rose-400' },
    },
    Thyroid: {
        gradient: 'from-blue-50 via-cyan-50 to-teal-50',
        badge: 'bg-blue-500',
        icon: '🦋',
        riskColors: { low: 'border-l-emerald-400', moderate: 'border-l-amber-400', high: 'border-l-rose-400' },
    },
    Endometriosis: {
        gradient: 'from-purple-50 via-violet-50 to-indigo-50',
        badge: 'bg-purple-500',
        icon: '💜',
        riskColors: { low: 'border-l-emerald-400', moderate: 'border-l-amber-400', high: 'border-l-rose-400' },
    },
};

const RISK_BADGE: Record<string, { label: string; color: string; bg: string }> = {
    low: { label: 'Low Risk', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    moderate: { label: 'Moderate Risk', color: 'text-amber-700', bg: 'bg-amber-100' },
    high: { label: 'High Risk', color: 'text-rose-700', bg: 'bg-rose-100' },
};

// ─── Ayurvedic herb emoji map ──────────────────────────────────────────────
const HERB_EMOJI: Record<string, string> = {
    Shatavari: '🌿', Triphala: '🍃', Amla: '🫐', Ashwagandha: '🌱',
    'Turmeric & Milk': '🟡', 'Cinnamon Water': '🍂', 'Spearmint Tea': '🍵',
    Guggul: '🌾', 'Kanchanar Guggulu': '🪴', Guggulu: '🌾',
    'Ginger Tea': '🫚', Licorice: '🍬', 'Bacopa Monnieri': '🌿',
    'Black Cumin': '🖤', Punarnava: '🌱', Turmeric: '🟡', Ginger: '🫚',
    Lodhra: '🌿', Ashoka: '🌸', 'Aloe Vera Juice': '💚',
    'Dashamula Tea': '🌿', 'Triphala Guggulu': '🍃', Guduchi: '🌱',
    'Licorice Tea': '🍵',
};

// ─── KEYWORD → delivery search phrase ────────────────────────────────────
const KEYWORD_MAP: Record<string, string> = {
    'whole grain': 'whole grain healthy meal', 'whole grains': 'whole grain healthy meal',
    oats: 'healthy oats bowl', berries: 'berry smoothie bowl', berry: 'berry smoothie bowl',
    hydration: 'fresh juice healthy drink', 'lean protein': 'grilled chicken salad',
    protein: 'high protein meal', 'low glycemic': 'low glycemic vegetarian meal',
    fiber: 'high fiber meal', 'high fiber': 'high fiber meal',
    omega: 'omega rich salmon salad', spinach: 'spinach salad healthy meal',
    green: 'green vegetable healthy meal', antioxidant: 'antioxidant rich salad',
    thyroid: 'iodine rich seafood bowl', soy: 'soy protein healthy meal',
    flax: 'flaxseed smoothie bowl', calcium: 'calcium rich healthy meal',
    iron: 'iron rich spinach meal', avocado: 'avocado toast healthy',
    nuts: 'mixed nuts healthy snack', lentil: 'lentil soup healthy',
    quinoa: 'quinoa salad bowl', turmeric: 'turmeric golden milk',
};

function buildSearchQuery(dietItems: { title: string }[]): string {
    const picked = dietItems.slice(0, 3);
    const phrases = picked.map((item) => {
        const lower = item.title.toLowerCase();
        for (const [kw, phrase] of Object.entries(KEYWORD_MAP)) {
            if (lower.includes(kw)) return phrase;
        }
        return `${item.title.trim()} healthy meal`;
    });
    return [...new Set(phrases)].slice(0, 2).join(' ');
}

// ─── Order Modal ────────────────────────────────────────────────────────────
function OrderModal({ isOpen, onClose, searchQuery }: { isOpen: boolean; onClose: () => void; searchQuery: string; }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={onClose} role="dialog" aria-modal="true">
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-fade-in"
                onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close modal"
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                    <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Order Healthy Meal</h3>
                        <p className="text-xs text-gray-400">Choose your delivery platform</p>
                    </div>
                </div>
                <div className="mt-4 mb-5 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    <p className="text-xs text-gray-500 truncate">
                        <span className="font-semibold text-gray-700">Searching for: </span>{searchQuery}
                    </p>
                </div>
                <div className="space-y-3">
                    {PLATFORMS.map((p) => (
                        <button key={p.id}
                            onClick={() => { window.open(p.buildUrl(searchQuery), '_blank', 'noopener,noreferrer'); onClose(); }}
                            aria-label={`Order on ${p.name}`}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-white font-semibold text-sm bg-gradient-to-r ${p.color} shadow-md ${p.hover} hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out`}>
                            <span className="text-xl">{p.emoji}</span>
                            <span>{p.name}</span>
                            <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
                        </button>
                    ))}
                </div>
                <p className="mt-4 text-center text-xs text-gray-400">Aligned with your personalized health plan</p>
            </div>
        </div>
    );
}

// ─── Activity Card (horizontal image + text) ─────────────────────────────
function ActivityCard({ item, category, index }: { item: any; category: string; index: number }) {
    const [imgError, setImgError] = React.useState(false);
    const imageSrc = resolveImage(item, category);
    const isYoga = category === 'yoga';

    return (
        <div
            className="group flex flex-col sm:flex-row gap-0 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:border-pink-100 transition-all duration-300 hover:-translate-y-0.5"
            style={{ animationDelay: `${index * 60}ms` }}>

            {/* Image side */}
            <div className="sm:w-48 sm:shrink-0 h-44 sm:h-auto relative overflow-hidden">
                {imageSrc && !imgError ? (
                    <img
                        src={imageSrc}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center text-5xl ${isYoga ? 'bg-gradient-to-br from-violet-50 to-purple-100' : 'bg-gradient-to-br from-teal-50 to-cyan-100'}`}>
                        {isYoga ? '🧘' : '🏃'}
                    </div>
                )}
                {/* Category badge */}
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${isYoga ? 'bg-violet-500' : 'bg-teal-500'}`}>
                    {category}
                </span>
            </div>

            {/* Text side */}
            <div className="flex flex-col justify-center p-5 flex-1 min-w-0">
                <h4 className="text-[17px] font-bold text-gray-900 mb-1.5 leading-tight">{item.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{item.description}</p>
            </div>
        </div>
    );
}

// ─── Diet Card with optional image ────────────────────────────────────────
function DietCard({ item, index }: { item: any; index: number }) {
    const [imgError, setImgError] = React.useState(false);
    const imageSrc = resolveImage(item, 'diet');
    const emoji = ['🥗', '🥦', '🍓', '🌾', '🥚', '🫐', '🥑', '🌊', '🍵', '🌿'][index % 10];

    return (
        <li className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
            {/* Small image or emoji */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm">
                {imageSrc && !imgError ? (
                    <img src={imageSrc} alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={() => setImgError(true)} />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-2xl">
                        {emoji}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                <p className="text-xs text-gray-500 leading-snug line-clamp-2">{item.description}</p>
            </div>
        </li>
    );
}

// ─── Ayurvedic Card with herb image ──────────────────────────────────────
function AyurvedaCard({ item, index }: { item: any; index: number }) {
    const emoji = HERB_EMOJI[item.title] || '🌿';
    const gradients = [
        'from-emerald-50 to-teal-50 border-emerald-100',
        'from-green-50 to-lime-50 border-green-100',
        'from-teal-50 to-cyan-50 border-teal-100',
        'from-lime-50 to-emerald-50 border-lime-100',
    ];

    return (
        <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} border rounded-2xl p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group`}>
            {/* Header with emoji */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {emoji}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-green-900 leading-tight">{item.title}</h4>
                    <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">Ayurvedic Remedy</span>
                </div>
            </div>
            <p className="text-sm text-green-800/80 leading-relaxed">{item.description}</p>
        </div>
    );
}

// ─── General Wellness Fallback (when no condition detected) ───────────────
const GENERAL_WELLNESS = {
    yoga: [
        { title: 'Surya Namaskar', description: 'Sun Salutations — the complete 12-step morning ritual for full-body activation, hormonal balance, and mental clarity.', category: 'yoga' },
        { title: 'Balasana', description: "Child's Pose — a restorative posture that calms the nervous system, releases tension in the back and hips.", category: 'yoga' },
        { title: 'Setu Bandhasana', description: 'Bridge Pose — strengthens the glutes, stretches the chest and spine, and stimulates the thyroid gland.', category: 'yoga' },
    ],
    exercise: [
        { title: 'Brisk Walking', description: '30 minutes of brisk walking daily boosts heart health, metabolism, and mood through endorphin release.', category: 'exercise' },
        { title: 'Pilates', description: 'Core-strengthening exercises that improve posture, balance, and hormonal regulation through mindful movement.', category: 'exercise' },
    ],
    diet: [
        { title: 'Whole Grains', description: 'Include oats, brown rice, and quinoa for sustained energy and better fiber intake.' },
        { title: 'Berries', description: 'Blueberries and strawberries are rich in antioxidants that combat inflammation.' },
        { title: 'Hydration', description: 'Drink at least 2–3 liters of water daily to flush out toxins and stay energized.' },
    ],
    ayurveda: [
        { title: 'Ashwagandha', description: 'An adaptogenic herb that helps the body manage stress and balance cortisol levels naturally.' },
        { title: 'Turmeric', description: 'Potent anti-inflammatory properties that support immune function and overall cellular health.' },
        { title: 'Triphala', description: 'A classical Ayurvedic blend that aids digestion, detoxification, and gut microbiome health.' },
    ],
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Recommendations() {
    const navigate = useNavigate();
    const [disease, setDisease] = React.useState('');
    const [riskLevel, setRiskLevel] = React.useState('');
    const [recos, setRecos] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [orderModalOpen, setOrderModalOpen] = React.useState(false);

    React.useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const riskData = await api("/risk/latest");
            if (riskData.riskAnalysis && riskData.riskAnalysis.length > 0) {
                const highest = riskData.riskAnalysis[0].disease;
                const pct = riskData.riskAnalysis[0].riskPercentage ?? 0;
                const level = pct > 70 ? 'high' : pct > 30 ? 'moderate' : 'low';
                setDisease(highest);
                setRiskLevel(level);
                const recoData = await api(`/recommendations/${highest}`);
                setRecos(recoData.recommendations);
            }
        } catch (err) {
            console.error("Failed to fetch recommendations", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Finding the best tips for you…</p>
            </div>
        );
    }

    // Merge DB data with general wellness if data is missing
    const activities = [
        ...((recos?.yoga?.length > 0 ? recos.yoga.map((i: any) => ({ ...i, category: 'yoga' })) : GENERAL_WELLNESS.yoga)),
        ...((recos?.exercise?.length > 0 ? recos.exercise.map((i: any) => ({ ...i, category: 'exercise' })) : GENERAL_WELLNESS.exercise)),
    ];
    const dietItems = recos?.diet?.length > 0 ? recos.diet : GENERAL_WELLNESS.diet;
    const ayurvedaItems = recos?.ayurveda?.length > 0 ? recos.ayurveda : GENERAL_WELLNESS.ayurveda;

    const hasDiet = dietItems.length > 0;
    const searchQuery = hasDiet ? buildSearchQuery(dietItems) : '';
    const theme = CONDITION_THEME[disease] ?? {
        gradient: 'from-pink-50 via-rose-50 to-fuchsia-50',
        badge: 'bg-gray-500',
        icon: '💊',
        riskColors: { low: 'border-l-emerald-400', moderate: 'border-l-amber-400', high: 'border-l-rose-400' },
    };
    const riskBadge = RISK_BADGE[riskLevel] ?? { label: 'General Wellness', color: 'text-gray-600', bg: 'bg-gray-100' };

    return (
        <div className="space-y-8 animate-fade-in pb-8">

            {/* ── Hero Header ─────────────────────────────────────────── */}
            <div className={`relative bg-gradient-to-br ${theme.gradient} rounded-3xl p-6 sm:p-8 overflow-hidden border border-white shadow-sm`}>
                {/* Decorative blobs */}
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/30 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/20 blur-xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-3xl shadow-sm shrink-0">
                            {theme.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Personalized for <span className="text-primary">{disease || 'You'}</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">Based on your latest symptom analysis</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {disease && riskLevel && (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${riskBadge.bg} ${riskBadge.color}`}>
                                <HeartPulse className="w-3.5 h-3.5" />
                                {riskBadge.label}
                            </span>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm ${theme.badge}`}>
                            <Sparkles className="w-3 h-3" />
                            {disease ? `${disease} Focused` : 'General Wellness'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ── Recommended Activity Section ────────────────────── */}
                <section className="space-y-4 lg:col-span-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Recommended Activity</h3>
                        <span className="ml-auto text-xs text-gray-400 font-medium">{activities.length} activities</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {activities.map((item: any, i: number) => (
                            <ActivityCard key={i} item={item} category={item.category || 'exercise'} index={i} />
                        ))}
                    </div>
                </section>

                {/* ── Nutrition Plan ──────────────────────────────────── */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-secondary" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Nutrition Plan</h3>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-50">
                            <h4 className="text-base font-bold text-gray-900">Dietary Focus</h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {disease ? `Tailored for ${disease} management` : 'General wellness nutrition'}
                            </p>
                        </div>
                        <ul className="divide-y divide-gray-50 px-2 py-2">
                            {dietItems.map((item: any, i: number) => (
                                <DietCard key={i} item={item} index={i} />
                            ))}
                        </ul>

                        {/* Order button */}
                        <div className="p-5 pt-3 border-t border-gray-50">
                            <button
                                onClick={() => setOrderModalOpen(true)}
                                aria-label="Order a healthy meal aligned with your diet plan"
                                className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-violet-600 shadow-md hover:shadow-purple-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out">
                                <ShoppingBag className="w-4 h-4" />
                                Order Healthy Meal
                            </button>
                            <p className="mt-2 text-center text-xs text-gray-400">Aligned with your health plan</p>
                        </div>
                    </div>
                </section>

                {/* ── Ayurvedic Wellness ──────────────────────────────── */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Ayurvedic Wellness</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {ayurvedaItems.map((item: any, i: number) => (
                            <AyurvedaCard key={i} item={item} index={i} />
                        ))}
                    </div>
                </section>
            </div>

            {/* ── Start Guided Session CTA ─────────────────────────────── */}
            <div className="flex justify-center pt-6 border-t border-gray-100">
                <button
                    onClick={() => navigate('/session', { state: { recos: { yoga: activities.filter(a => a.category === 'yoga'), exercise: activities.filter(a => a.category === 'exercise'), diet: dietItems, ayurveda: ayurvedaItems } } })}
                    className="flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                    <Dumbbell className="w-6 h-6" />
                    Start Guided Session
                </button>
            </div>

            <OrderModal isOpen={orderModalOpen} onClose={() => setOrderModalOpen(false)} searchQuery={searchQuery} />
        </div>
    );
}
