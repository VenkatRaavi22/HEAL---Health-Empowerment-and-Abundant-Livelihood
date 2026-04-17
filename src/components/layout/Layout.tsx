import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

export function Layout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Simple check for auth pages to hide navbar if needed, 
    // but user requested "simple top Navbar with logo and profile icon"
    // Usually auth pages don't have the main navbar, but let's keep it simple.
    const normalizedPath = location.pathname.toLowerCase();
    const isSession = normalizedPath.includes('/session');
    const isAuthPage = ['/login', '/register', '/'].some(p => normalizedPath === p || normalizedPath === p + '/');

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FAEEEE] to-[#F8ECEB] font-sans text-[#0F172A]">
            {!isSession && (
                <motion.nav 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100"
                >
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link to="/dashboard" className="flex items-center gap-2 group">
                                <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ 
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            delay: 0.3
                                        }}
                                    >
                                        <Heart className="w-6 h-6 text-[#E91E63] fill-current" />
                                    </motion.div>
                                </div>
                                <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    HEAL
                                </span>
                            </Link>

                            {!isAuthPage && (
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={() => navigate('/profile')}>
                                        <User className="w-5 h-5 text-gray-600" />
                                    </Button>
                                </div>
                            )}

                            {isAuthPage && location.pathname !== '/' && (
                                <Link to="/" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                                    Back to Home
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.nav>
            )}

            <main className={isSession ? "flex-1 overflow-hidden" : "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
                {children}
            </main>
        </div>
    );
}
