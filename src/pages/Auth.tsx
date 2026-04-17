import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import api from '../utils/api';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

// ─── Google SVG Icon ─────────────────────────────────────────────────────────
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

// ─── Shared Error Banner ─────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
    if (!message) return null;
    return (
        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl w-full">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{message}</span>
        </div>
    );
}

// ─── Shared Input ─────────────────────────────────────────────────────────────
function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`w-full bg-gray-50/60 border border-gray-200 px-4 py-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FA5881]/30 focus:border-[#FA5881] outline-none text-gray-700 transition-all placeholder:text-gray-400 ${className}`}
            {...props}
        />
    );
}

export default function Auth() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(location.pathname === '/login');
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        setIsLogin(location.pathname === '/login');
    }, [location.pathname]);

    // ── Login state ────────────────────────────────────────────────────────────
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // ── Register state ─────────────────────────────────────────────────────────
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regMobile, setRegMobile] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [regError, setRegError] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password constraints
    const hasNumber = /\d/.test(regPassword);
    const hasAlphabet = /[a-zA-Z]/.test(regPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(regPassword);

    // ── Login handler ──────────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        try {
            const data = await api("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate(data.user.profileCompleted ? '/dashboard' : '/setup');
        } catch (err: any) {
            setLoginError(err.message || "Invalid email or password. Please try again.");
        }
    };

    // ── Register handler ───────────────────────────────────────────────────────
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegError('');
        if (regPassword !== regConfirmPassword) {
            setRegError("Passwords do not match.");
            return;
        }
        if (!hasNumber || !hasAlphabet || !hasSpecialChar) {
            setRegError("Password must contain alphabets, numbers, and a special character.");
            return;
        }
        try {
            await api("/auth/register", {
                method: "POST",
                body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, mobile: regMobile }),
            });
            navigate('/login');
        } catch (err: any) {
            setRegError(err.message || "Registration failed. Please try again.");
        }
    };

    // ── Google Sign-Up handler (Sign Up page only) ────────────────────────────
    const handleGoogleSignUp = async (e: React.MouseEvent) => {
        e.preventDefault();
        setRegError('');
        setGoogleLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const gUser = result.user;

            // Sync with HEAL backend (upsert — creates account if new, logs in if existing)
            let data: any;
            try {
                data = await api("/auth/google", {
                    method: "POST",
                    body: JSON.stringify({
                        name: gUser.displayName,
                        email: gUser.email,
                        photoUrl: gUser.photoURL,
                        googleId: gUser.uid,
                        mobile: regMobile || null,
                    }),
                });
            } catch {
                // Backend might not have /auth/google yet — fall back to client-side session
                data = {
                    token: await gUser.getIdToken(),
                    user: {
                        name: gUser.displayName,
                        email: gUser.email,
                        photoUrl: gUser.photoURL,
                        profileCompleted: false,
                    },
                };
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate(data.user.profileCompleted ? '/dashboard' : '/dashboard');
        } catch (err: any) {
            // Gracefully handle common OAuth errors
            if (err.code === 'auth/popup-closed-by-user') {
                setRegError("The sign-in popup was closed. Please try again.");
            } else if (err.code === 'auth/network-request-failed') {
                setRegError("Network error. Please check your connection and try again.");
            } else if (err.code === 'auth/cancelled-popup-request') {
                // User opened another popup — silent ignore
            } else {
                setRegError(err.message || "Google sign-up failed. Please try again.");
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-[90vh] flex items-center justify-center bg-[#FFF0F5] py-12 px-4 relative overflow-hidden">

            {/* ── Desktop Split Layout ─────────────────────────────────────── */}
            <div className="relative w-full max-w-[1000px] min-h-[680px] bg-white rounded-3xl shadow-xl overflow-hidden hidden md:flex z-10 border border-gray-100">

                {/* Login Form */}
                <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-center px-10 transition-all duration-700 ease-in-out z-10 ${isLogin ? 'translate-x-0 opacity-100' : 'translate-x-[100%] opacity-0 pointer-events-none'}`}>
                    <h2 className="text-3xl font-bold mb-2 text-[#FA5881] font-sans">Welcome Back</h2>
                    <p className="text-gray-400 text-sm mb-8 text-center">Sign in to continue your health journey</p>

                    <ErrorBanner message={loginError} />

                    <form onSubmit={handleLogin} className="w-full xl:w-4/5 space-y-4 flex flex-col items-center mt-4">
                        <Input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />

                        <div className="w-full relative">
                            <Input type={showLoginPassword ? "text" : "password"} placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FA5881] transition-colors" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                                {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="w-full flex justify-end">
                            <p className="text-xs font-medium text-gray-400 hover:text-[#FA5881] cursor-pointer transition-colors">Forgot your password?</p>
                        </div>

                        <button type="submit" className="mt-4 w-full bg-[#FA5881] hover:bg-[#e0456c] text-white py-4 rounded-xl font-bold tracking-wider transition-colors shadow-md hover:shadow-lg">
                            Log In
                        </button>
                    </form>
                </div>

                {/* Sign Up Form */}
                <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-center px-8 transition-all duration-700 ease-in-out z-10 ${!isLogin ? 'translate-x-[100%] opacity-100' : 'translate-x-0 opacity-0 pointer-events-none'}`}>
                    <h2 className="text-3xl font-bold mb-2 text-[#FA5881] font-sans text-center">Create Account</h2>
                    <p className="text-gray-400 text-sm mb-5 text-center">Join the HEAL community today</p>

                    <ErrorBanner message={regError} />

                    <form onSubmit={handleRegister} className="w-full xl:w-4/5 space-y-3 flex flex-col items-center mt-4 pb-4">
                        <Input type="text" placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} required />
                        <Input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                        <Input type="tel" placeholder="Mobile Number (optional)" value={regMobile} onChange={e => setRegMobile(e.target.value)} />

                        <div className="w-full relative">
                            <Input type={showRegPassword ? "text" : "password"} placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FA5881] transition-colors" onClick={() => setShowRegPassword(!showRegPassword)}>
                                {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password constraints */}
                        <div className="w-full flex justify-between text-xs px-1">
                            <span className={hasAlphabet ? "text-[#FA5881] font-semibold" : "text-gray-400"}>✓ Alphabets</span>
                            <span className={hasNumber ? "text-[#FA5881] font-semibold" : "text-gray-400"}>✓ Numbers</span>
                            <span className={hasSpecialChar ? "text-[#FA5881] font-semibold" : "text-gray-400"}>✓ Special</span>
                        </div>

                        <div className="w-full relative">
                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} required />
                            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FA5881] transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button type="submit" className="mt-4 w-full bg-[#FA5881] hover:bg-[#e0456c] text-white py-3.5 rounded-xl font-bold tracking-wider transition-colors shadow-md hover:shadow-lg">
                            Sign Up
                        </button>

                        {/* Divider */}
                        <div className="w-full flex items-center my-1">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="px-3 text-sm text-gray-400">or</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {/* Continue with Google — Sign Up page ONLY */}
                        <button
                            onClick={handleGoogleSignUp}
                            type="button"
                            disabled={googleLoading}
                            className="w-full bg-white border border-gray-300 hover:bg-gray-50 hover:border-[#FA5881] text-gray-700 py-3 rounded-xl flex items-center justify-center font-medium transition-all shadow-sm group disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {googleLoading
                                ? <Loader2 className="w-5 h-5 mr-3 animate-spin text-[#FA5881]" />
                                : <GoogleIcon />
                            }
                            <span className="group-hover:text-[#FA5881] transition-colors">
                                {googleLoading ? "Connecting..." : "Continue with Google"}
                            </span>
                        </button>
                    </form>
                </div>

                {/* Sliding Overlay Panel */}
                <div className={`absolute top-0 left-0 w-1/2 h-full transition-transform duration-700 ease-in-out z-20 ${!isLogin ? 'translate-x-0' : 'translate-x-[100%]'}`}>
                    <div className="relative w-full h-full bg-[#FA5881] text-white overflow-hidden flex transform-gpu transition-transform duration-700 shadow-2xl">
                        {/* Decorative blobs */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-gradient-to-br from-white to-[#F48FB1] rounded-full blur-3xl transform rotate-12"></div>
                            <div className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[60%] bg-gradient-to-tl from-white to-[#F48FB1] rounded-full blur-3xl transform -rotate-12"></div>
                        </div>

                        {/* Sign Up Mode → invite to log in */}
                        <div className={`absolute inset-0 w-full h-full flex flex-col justify-center items-center px-12 text-center transition-all duration-700 delay-100 ${!isLogin ? 'translate-x-0 opacity-100' : '-translate-x-[100%] opacity-0 pointer-events-none'}`}>
                            <h2 className="text-[2.2rem] font-bold mb-4 font-sans tracking-wide leading-tight">Already have an account?</h2>
                            <p className="mb-10 text-[1rem] font-medium tracking-wide text-white/90 px-4 leading-relaxed">
                                To keep connected with us please log in.
                            </p>
                            <button onClick={() => navigate('/login')} className="bg-transparent border-2 border-white text-white px-14 py-3 rounded-full font-bold tracking-widest text-sm uppercase hover:bg-white hover:text-[#FA5881] shadow-sm hover:shadow-md transition-all duration-300">
                                Log In
                            </button>
                        </div>

                        {/* Login Mode → invite to sign up */}
                        <div className={`absolute inset-0 w-full h-full flex flex-col justify-center items-center px-12 text-center transition-all duration-700 delay-100 ${isLogin ? 'translate-x-0 opacity-100' : 'translate-x-[100%] opacity-0 pointer-events-none'}`}>
                            <h2 className="text-[2.2rem] font-bold mb-4 font-sans tracking-wide leading-tight">Don't have an account?</h2>
                            <p className="mb-10 text-[1rem] font-medium tracking-wide text-white/90 px-4 leading-relaxed">
                                Enter your personal details and start your health journey with us.
                            </p>
                            <button onClick={() => navigate('/register')} className="bg-transparent border-2 border-white text-white px-14 py-3 rounded-full font-bold tracking-widest text-sm uppercase hover:bg-white hover:text-[#FA5881] shadow-sm hover:shadow-md transition-all duration-300">
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Mobile View ─────────────────────────────────────────────────── */}
            <div className="md:hidden w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col relative z-10 border border-gray-100">
                <div className="bg-[#FA5881] text-white p-8 text-center rounded-b-3xl shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                    <h2 className="text-3xl font-bold font-sans relative z-10">{isLogin ? "Welcome Back" : "Create Account"}</h2>
                    <p className="text-sm mt-3 font-medium text-white/90 relative z-10">
                        {isLogin ? "Sign in to continue your health journey" : "Join the HEAL community today"}
                    </p>
                </div>

                <div className="p-7 flex-1 flex flex-col justify-center pb-10">
                    {isLogin ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <ErrorBanner message={loginError} />
                            <Input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                            <div className="relative">
                                <Input type={showLoginPassword ? "text" : "password"} placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                                    {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <p className="text-sm font-medium text-right text-gray-400 cursor-pointer hover:text-[#FA5881]">Forgot password?</p>
                            <button type="submit" className="w-full mt-4 bg-[#FA5881] hover:bg-[#e0456c] text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-md">Log In</button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-3">
                            <ErrorBanner message={regError} />
                            <Input type="text" placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} required />
                            <Input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                            <Input type="tel" placeholder="Mobile Number (optional)" value={regMobile} onChange={e => setRegMobile(e.target.value)} />
                            <div className="relative">
                                <Input type={showRegPassword ? "text" : "password"} placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowRegPassword(!showRegPassword)}>
                                    {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-between px-1 text-[11px] font-medium">
                                <span className={hasAlphabet ? "text-[#FA5881]" : "text-gray-400"}>✓ Alphabets</span>
                                <span className={hasNumber ? "text-[#FA5881]" : "text-gray-400"}>✓ Numbers</span>
                                <span className={hasSpecialChar ? "text-[#FA5881]" : "text-gray-400"}>✓ Special</span>
                            </div>
                            <div className="relative">
                                <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} required />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <button type="submit" className="w-full mt-2 bg-[#FA5881] hover:bg-[#e0456c] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-md">Sign Up</button>

                            {/* Divider + Google — Sign Up only */}
                            <div className="flex items-center my-3">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="px-3 text-sm text-gray-400">or</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>
                            <button
                                onClick={handleGoogleSignUp}
                                type="button"
                                disabled={googleLoading}
                                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl flex items-center justify-center font-medium shadow-sm transition-colors hover:border-[#FA5881] group disabled:opacity-60"
                            >
                                {googleLoading
                                    ? <Loader2 className="w-5 h-5 mr-3 animate-spin text-[#FA5881]" />
                                    : <GoogleIcon />
                                }
                                <span className="group-hover:text-[#FA5881] transition-colors">
                                    {googleLoading ? "Connecting..." : "Continue with Google"}
                                </span>
                            </button>
                        </form>
                    )}

                    <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate(isLogin ? '/register' : '/login')}
                            className="text-[#FA5881] font-bold text-sm mt-3 tracking-wide hover:underline transition-all"
                        >
                            {isLogin ? 'Create Account' : 'Log In instead'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
