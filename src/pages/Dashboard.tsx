import React from 'react';
import { StatCard } from '../components/ui/StatCard';
import {
    Flame,
    Footprints,
    Pill,
    PenLine,
    CalendarDays,
    Lightbulb,
    TrendingUp,
    Stethoscope,
    Bot,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    Search
} from 'lucide-react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// ── Severity classification ──────────────────────────────────────────────────
type Severity = 'low' | 'moderate' | 'high';

const getSeverity = (risks: any[]): Severity => {
    if (!risks || risks.length === 0) return 'low';
    const max = Math.max(...risks.map((r: any) => r.riskPercentage ?? 0));
    if (max > 60) return 'high';
    if (max >= 30) return 'moderate';
    return 'low';
};

const SEVERITY_CONFIG = {
    low: {
        label: 'Low Risk',
        icon: ShieldCheck,
        bg: 'from-emerald-50/80 to-[#DCFCE7]/70',
        border: 'border-emerald-100',
        badge: 'bg-emerald-500 shadow-emerald-500/30',
        text: 'text-emerald-800',
        iconColor: 'text-emerald-500',
        glow: 'shadow-[0_8px_24px_rgba(16,185,129,0.12)]',
        description: 'Your logged symptoms indicate minimal risk. Keep up the healthy habits and stay consistent.',
        emoji: '🟢',
    },
    moderate: {
        label: 'Moderate Risk',
        icon: AlertTriangle,
        bg: 'from-amber-50/80 to-[#FEF3C7]/70',
        border: 'border-amber-100',
        badge: 'bg-amber-500 shadow-amber-500/30',
        text: 'text-amber-800',
        iconColor: 'text-amber-500',
        glow: 'shadow-[0_8px_24px_rgba(245,158,11,0.12)]',
        description: 'Some symptoms require attention. Monitor them regularly and follow personalised recommendations.',
        emoji: '🟡',
    },
    high: {
        label: 'High Risk',
        icon: ShieldAlert,
        bg: 'from-rose-50/80 to-[#FFE4E6]/70',
        border: 'border-rose-100',
        badge: 'bg-rose-500 shadow-rose-500/30',
        text: 'text-rose-800',
        iconColor: 'text-rose-500',
        glow: 'shadow-[0_8px_24px_rgba(244,63,94,0.12)]',
        description: 'Your symptoms suggest elevated risk. Consider scheduling a consultation with a healthcare professional.',
        emoji: '🔴',
    },
};

const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12
        }
    }
};

const fadeUpVariants: any = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
};

const slideRightVariants: any = {
    hidden: { opacity: 0, x: -25 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const MENU_ITEMS = [
    { icon: PenLine, label: "Log Health", to: "/log-health", color: "text-orange-500" },
    { icon: CalendarDays, label: "Cycle Monitor", to: "/cycle", color: "text-pink-500" },
    { icon: TrendingUp, label: "Progress Analytics", to: "/progress", color: "text-blue-500" },
    { icon: Lightbulb, label: "Recommendations", to: "/recommendations", color: "text-teal-500" },
    { icon: Pill, label: "Medication", to: "/medication", color: "text-sky-500" },
    { icon: Stethoscope, label: "Consult Specialist", to: "/specialists", color: "text-amber-500" },
    { icon: Bot, label: "AI Health Assistant", to: "/chatbot", color: "text-indigo-500" }
];

// Sidebar Menu Item Component
function SidebarItem({ icon: Icon, label, to, color, hasAlert }: { icon: any, label: string, to: string, color: string, hasAlert?: boolean }) {
    return (
        <Link to={to} className="flex items-center justify-between px-3 py-2.5 rounded-[14px] transition-all duration-300 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] group border border-transparent hover:border-gray-100 relative">
            <div className="flex items-center gap-3.5">
                <Icon className={`w-5 h-5 ${color}`} strokeWidth={2.5} />
                <span className="text-[15px] font-semibold text-[#0F172A] group-hover:text-[#FA5881] transition-colors">{label}</span>
            </div>
            {hasAlert && (
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" title="Restock needed" />
            )}
        </Link>
    )
}

export default function Dashboard() {
    const [risks, setRisks] = React.useState<any[]>([]);
    const [medAlert, setMedAlert] = React.useState(false);
    const [nextMed, setNextMed] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [userName, setUserName] = React.useState("");
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredItems = MENU_ITEMS.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    React.useEffect(() => {
        // Fetch User
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.name) setUserName(user.name.split(" ")[0]);
            }
        } catch(e) {}

        const fetchRisksAndMeds = async () => {
            try {
                const [riskData, medData] = await Promise.all([
                    api("/risk/latest"),
                    api("/medications").catch(() => []) // gracefully handle error
                ]);
                
                if (riskData && riskData.riskAnalysis) {
                    setRisks(riskData.riskAnalysis);
                }
                
                if (Array.isArray(medData)) {
                    const needsRestock = medData.some((med: any) => med.remaining_tablets < 5);
                    setMedAlert(needsRestock);
                    if (medData.length > 0) {
                        setNextMed(medData[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRisksAndMeds();
    }, []);

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col md:flex-row gap-8 lg:gap-12 pb-10 max-w-7xl mx-auto px-2"
        >
            {/* Left Sidebar Menu */}
            <motion.aside variants={fadeUpVariants} className="w-full md:w-[280px] shrink-0 flex flex-col gap-6 p-6 bg-white/70 backdrop-blur-xl rounded-[32px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-fit sticky top-24">
                
                {/* Search Bar matching Apple Health style */}
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#f1f3f5]/80 border border-transparent rounded-[14px] py-2 pl-10 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FA5881]/20 focus:bg-white transition-all text-gray-800 placeholder:text-gray-500 font-medium"
                    />
                </div>

                {/* Health Categories */}
                <div>
                    <h2 className="text-[15px] font-bold text-[#0F172A] mb-3 px-3 tracking-wide">Health Categories</h2>
                    <div className="flex flex-col space-y-0.5">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item, index) => (
                                <SidebarItem 
                                    key={index} 
                                    icon={item.icon} 
                                    label={item.label} 
                                    to={item.to} 
                                    color={item.color} 
                                    hasAlert={item.label === "Medication" && medAlert}
                                />
                            ))
                        ) : (
                            <div className="text-[14px] text-gray-500 px-3 py-4 text-center font-medium bg-gray-50/50 rounded-xl border border-gray-100/50">
                                No categories found.
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <motion.main variants={containerVariants} className="flex-1 space-y-12 min-w-0">
                {/* Premium Intro Header (Human Card) */}
                <motion.section variants={fadeUpVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7 pt-1 pb-4">
                    <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-full overflow-hidden border-[3px] border-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] bg-gradient-to-br from-[#FA5881] to-rose-400 flex items-center justify-center shrink-0 text-white group cursor-pointer hover:scale-105 transition-transform duration-300">
                        <span className="text-3xl sm:text-4xl font-bold tracking-tighter">
                            {userName ? userName.charAt(0).toUpperCase() : ""}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl sm:text-[40px] font-bold text-[#0F172A] tracking-tight leading-tight mb-1">
                            Hey{userName ? ` ${userName}` : ""}, Welcome Back to <span className="text-[#FA5881]">HEAL</span>!
                        </h1>
                        <p className="text-[17px] text-[#64748B] font-medium tracking-wide">
                            How about your day today?
                        </p>
                    </div>
                </motion.section>

                {/* Overview Section */}
                <motion.section variants={fadeUpVariants}>
                    <h2 className="text-[22px] font-bold text-[#0F172A] mb-5 tracking-tight">Today's Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl">
                        <motion.div variants={fadeUpVariants}>
                            <StatCard
                                title="Logging Streak"
                                value="5 Days"
                                icon={Flame}
                                color="secondary"
                                trend="+1 from yesterday"
                                trendUp={true}
                            />
                        </motion.div>
                        
                        <motion.div variants={fadeUpVariants}>
                            <StatCard
                                title="Steps"
                                value="4,230 / 8k"
                                icon={Footprints}
                                color="accent"
                                trend="52% of goal"
                                trendUp={true}
                            />
                        </motion.div>
                        
                        <motion.div variants={fadeUpVariants}>
                            <StatCard
                                title="Next Med"
                                value={nextMed ? nextMed.time.substring(0, 5) : "--:--"}
                                icon={Pill}
                                color="primary"
                                trend={nextMed ? nextMed.medicine_name : "No meds scheduled"}
                                trendUp={true} 
                            />
                        </motion.div>
                    </div>
                </motion.section>

                {/* ── Risk Severity Section ──────────────────────────────── */}
                <motion.section variants={slideRightVariants}>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[22px] font-bold text-[#0F172A] tracking-tight">Risk Severity</h2>
                    </div>

                    {loading ? (
                        <div className="h-32 bg-white rounded-[20px] animate-pulse shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-gray-100 max-w-4xl" />
                    ) : (() => {
                        const severity = getSeverity(risks);
                        const cfg = SEVERITY_CONFIG[severity];
                        const Icon = cfg.icon;
                        return (
                            <div
                                className={`max-w-4xl relative bg-gradient-to-br ${cfg.bg} border ${cfg.border} rounded-[20px] p-7 ${cfg.glow} flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                            >
                                {/* Glassmorphism Icon bubble */}
                                <div className={`shrink-0 w-[72px] h-[72px] rounded-[18px] bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50`}>
                                    <Icon className={`w-9 h-9 ${cfg.iconColor}`} strokeWidth={2.5} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold text-white shadow-md ${cfg.badge}`}>
                                            {cfg.emoji} {cfg.label}
                                        </span>
                                        <span className={`text-sm font-medium ${cfg.text} opacity-80 tracking-wide`}>
                                            Based on your latest symptom log
                                        </span>
                                    </div>
                                    <p className={`text-[15px] font-medium leading-relaxed ${cfg.text}`}>
                                        {cfg.description}
                                    </p>
                                </div>

                                {/* CTA */}
                                <a
                                    href="/recommendations"
                                    className={`shrink-0 mt-4 sm:mt-0 text-sm font-bold px-6 py-3 rounded-xl bg-white/80 backdrop-blur-md border ${cfg.border} ${cfg.text} hover:bg-white hover:shadow-md transition-all duration-300 flex items-center gap-2 group`}
                                >
                                    View Tips <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </a>
                            </div>
                        );
                    })()}
                </motion.section>
            </motion.main>
        </motion.div>
    );
}
