import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Timer,
    Camera,
    CheckCircle2,
    AlertCircle,
    X,
    Play,
    Pause,
    RotateCcw,
    Dumbbell,
    Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Image map for activities
const IMAGE_MAP: Record<string, string> = {
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
};

function resolveImage(item: any): string | null {
    if (item.image_url && item.image_url.startsWith('/images/')) return item.image_url;
    if (IMAGE_MAP[item.title]) return IMAGE_MAP[item.title];
    if (item.category === 'yoga') return '/images/bezawada/Top.jpg';
    if (item.category === 'exercise') return '/images/bezawada/cardio-light-workout.jpg';
    return null;
}

export default function SessionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { recos } = location.state || {};

    // Session State
    const [sessionActivities, setSessionActivities] = useState<any[] | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [stats, setStats] = useState({ totalAccuracy: 0, count: 0 });

    // AI Simulation State
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [cameraStarted, setCameraStarted] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [poseStatus, setPoseStatus] = useState<'correct' | 'incorrect' | null>(null);
    const [feedback, setFeedback] = useState<string>('');
    const [sessionMessage, setSessionMessage] = useState<string>('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const analysisTimeoutRef = useRef<any>(null);
    const retryTimeoutRef = useRef<any>(null);

    // Helper functions
    const parseDuration = (durationStr: string) => {
        const match = (durationStr || '').match(/(\d+)/);
        return match ? parseInt(match[1]) * 60 : 60; // Default 3 mins
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialize session activities
    useEffect(() => {
        if (recos) {
            const rawYoga = recos.yoga || [];
            const rawExercise = recos.exercise || [];
            const filtered = [...rawYoga, ...rawExercise].filter(item => {
                const cat = item.category?.toLowerCase();
                return cat === 'yoga' || cat === 'exercise';
            });
            const finalActivities = filtered.length > 0 ? filtered : [...rawYoga, ...rawExercise];
            setSessionActivities(finalActivities);
            if (finalActivities.length > 0) {
                setTimer(parseDuration(finalActivities[0].duration || ' 1 min '));
            }
        } else {
            navigate('/dashboard');
        }
    }, [recos, navigate]);

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (isActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0 && isActive) {
            setIsActive(false);
            setSessionMessage('Session Time Completed');
            stopCamera();
        }
        return () => clearInterval(interval);
    }, [isActive, timer]);

    // Camera Management
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraStarted(true);
                runAnalysis();
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraStarted(false);
            setFeedback("Camera permission denied.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraStarted(false);
        setAnalyzing(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
            clearTimeout(analysisTimeoutRef.current);
            clearTimeout(retryTimeoutRef.current);
        };
    }, []);

    // Simulated AI Detection
    const runAnalysis = () => {
        setAnalyzing(true);
        setPoseStatus(null);
        setFeedback('');

        const delay = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000;

        analysisTimeoutRef.current = setTimeout(() => {
            const isCorrect = Math.random() > 0.3;
            setAnalyzing(false);

            if (isCorrect) {
                setPoseStatus('correct');
                setFeedback('Perfect alignment! Hold this position.');
                stopCamera();
                setIsActive(false); // Stop timer

                const accuracy = Math.floor(Math.random() * (98 - 85 + 1)) + 85;
                setStats(prev => ({ totalAccuracy: prev.totalAccuracy + accuracy, count: prev.count + 1 }));
            } else {
                setPoseStatus('incorrect');
                const tips = [
                    "Keep your spine straight",
                    "Lower your shoulders",
                    "Breath deeply",
                    "Engage your core",
                    "Align your feet"
                ];
                setFeedback(tips[Math.floor(Math.random() * tips.length)]);

                // Retry after 5s
                retryTimeoutRef.current = setTimeout(() => {
                    if (cameraStarted && isActive) runAnalysis();
                }, 5000);
            }
        }, delay);
    };

    const handleStartSession = () => {
        setIsActive(true);
        startCamera();
    };

    const handleNext = () => {
        if (sessionActivities && currentIndex < sessionActivities.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setTimer(parseDuration(sessionActivities[nextIndex].duration || '3 min'));
            resetSimulation();
        } else {
            setIsCompleted(true);
            stopCamera();
        }
    };

    const handlePrevious = () => {
        if (sessionActivities && currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            setTimer(parseDuration(sessionActivities[prevIndex].duration || '3 min'));
            resetSimulation();
        }
    };

    const resetSimulation = () => {
        stopCamera();
        setIsActive(false);
        setPoseStatus(null);
        setAnalyzing(false);
        setFeedback('');
        setSessionMessage('');
        clearTimeout(analysisTimeoutRef.current);
        clearTimeout(retryTimeoutRef.current);
    };

    if (sessionActivities === null) return null;

    if (isCompleted) {
        const avgAccuracy = stats.count > 0 ? Math.round(stats.totalAccuracy / stats.count) : 0;
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-6 animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Session Completed!</h2>
                        <p className="text-gray-500 mt-2">Well done! You have completed {sessionActivities.length} activities.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-xs text-gray-500 uppercase font-bold text-center">Activities</p>
                            <p className="text-2xl font-bold text-primary text-center">{sessionActivities.length}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-xs text-gray-500 uppercase font-bold text-center">Avg Accuracy</p>
                            <p className="text-2xl font-bold text-secondary text-center">{avgAccuracy || 88}%</p>
                        </div>
                    </div>
                    <Button variant="primary" className="w-full py-4 text-lg font-bold" onClick={() => navigate('/recommendations')}>
                        Back to Recommendations
                    </Button>
                </Card>
            </div>
        );
    }

    const currentActivity = sessionActivities[currentIndex];
    const isNextEnabled = poseStatus === 'correct' || timer === 0;
    const resolvedImage = currentActivity ? resolveImage(currentActivity) : null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
            {/* Top Bar */}
            <header className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/recommendations')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{currentActivity.title}</h1>
                        <p className="text-xs text-gray-500 font-medium">Step {currentIndex + 1} / {sessionActivities.length}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                    <Timer className={`w-5 h-5 text-primary ${isActive ? 'animate-pulse' : ''}`} />
                    <span className="text-xl font-mono font-bold text-primary">{formatTime(timer)}</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left: Content Card */}
                    <div className="space-y-6">
                        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-white border-4 border-white group">
                            {resolvedImage ? (
                                <img src={resolvedImage} alt={currentActivity.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    <Dumbbell className="w-16 h-16 opacity-10" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="bg-primary/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    {currentActivity.category || 'Yoga'}
                                </span>
                            </div>
                        </div>

                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-secondary" />
                                Instructions
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {currentActivity.description}
                            </p>
                            <div className="mt-6 pt-6 border-t border-gray-100 flex gap-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                    <Timer className="w-4 h-4" />
                                    {currentActivity.duration || '3 min'}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Posture Check Active
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Camera & AI Detection */}
                    <div className="space-y-6">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-white ring-1 ring-black/5">
                            {!cameraStarted ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 z-10 p-8 text-center space-y-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center ring-8 ring-white/5 animate-pulse">
                                            <Camera className="w-10 h-10 opacity-40" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold">AI Posture Detection</h4>
                                        <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">Click "Start Timer" to begin your session and activate live posture analysis.</p>
                                    </div>
                                    {!isActive && (
                                        <Button
                                            onClick={handleStartSession}
                                            className="px-10 py-4 text-xl font-bold shadow-2xl"
                                        >
                                            <Play className="w-6 h-6 mr-2 fill-current" />
                                            Start Timer
                                        </Button>
                                    )}
                                </div>
                            ) : null}

                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />

                            {/* Live Indicator */}
                            {cameraStarted && (
                                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live AI</span>
                                </div>
                            )}

                            {/* Status Overlays */}
                            {analyzing && (
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl text-white px-8 py-3 rounded-full flex items-center gap-3 border border-white/10 animate-fade-in shadow-2xl">
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm font-bold tracking-widest uppercase">Analyzing Posture...</span>
                                </div>
                            )}

                            {poseStatus === 'correct' && (
                                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center animate-pulse">
                                    <div className="bg-green-500 text-white px-10 py-5 rounded-3xl flex flex-col items-center gap-2 shadow-2xl animate-scale-in">
                                        <div className="bg-white/20 p-2 rounded-full">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <span className="text-xl font-black uppercase tracking-tighter italic">✅ Pose Correct!</span>
                                    </div>
                                </div>
                            )}

                            {sessionMessage && (
                                <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-20">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-white">{sessionMessage}</h4>
                                        <p className="text-gray-400">Click Next Activity to continue.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Feedback Area */}
                        {(poseStatus === 'incorrect' || (analyzing && feedback)) && (
                            <div className={`p-5 rounded-3xl border-2 transition-all duration-500 ${poseStatus === 'incorrect' ? 'bg-red-50 border-red-100 text-red-900' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-1.5 rounded-lg ${poseStatus === 'incorrect' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                        <AlertCircle className="w-4 h-4 text-white" />
                                    </div>
                                    <h4 className="font-bold uppercase text-xs tracking-wider">
                                        {poseStatus === 'incorrect' ? '⚠ Adjust Your Posture' : 'Posture Tip'}
                                    </h4>
                                </div>
                                <p className="text-sm font-medium pl-10 opacity-80">{feedback || 'Getting ready for analysis...'}</p>
                                {poseStatus === 'incorrect' && (
                                    <div className="mt-4 pl-10">
                                        <div className="h-1.5 w-full bg-red-200/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 animate-[progress_5s_linear]" />
                                        </div>
                                        <p className="text-[10px] uppercase font-bold text-red-400 mt-2">Retrying in 5 seconds...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Navigation Footer */}
            <footer className="bg-white border-t px-6 py-4 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-6 hover:bg-gray-100 rounded-2xl"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </Button>

                    <div className="hidden md:flex items-center gap-3">
                        {sessionActivities.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-10 bg-primary shadow-[0_0_10px_rgba(255,94,142,0.3)]' : i < currentIndex ? 'w-4 bg-primary/30' : 'w-4 bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleNext}
                        disabled={!isNextEnabled}
                        className={`flex items-center gap-2 px-10 py-6 rounded-2xl shadow-xl transition-all duration-300 ${isNextEnabled ? 'shadow-primary/20 scale-100' : 'opacity-50 grayscale scale-95 shadow-none'}`}
                    >
                        {currentIndex === sessionActivities.length - 1 ? 'Finish Session' : 'Next Activity'}
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </footer>

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .animate-scale-in {
                    animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
