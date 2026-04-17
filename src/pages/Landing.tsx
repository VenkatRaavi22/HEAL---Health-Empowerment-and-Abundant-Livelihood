import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Heart } from 'lucide-react';

export default function Landing() {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden bg-[var(--color-background)] z-0 text-center">
            {/* Abstract Decorative Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex justify-center items-center opacity-70">
                <div className="relative w-full max-w-5xl h-full min-h-[800px]">
                    {/* Pink Semi Circle */}
                    <div className="absolute top-[30%] left-[8%] md:left-[10%] w-32 h-16 md:w-48 md:h-24 bg-[#D19B95] rounded-b-full mix-blend-multiply transition-all opacity-80 transform -rotate-12"></div>

                    {/* Yellow Quarter Circle */}
                    <div className="absolute top-[10%] right-[12%] md:right-[15%] w-32 h-32 md:w-40 md:h-40 bg-[#E6BF70] rounded-tr-full mix-blend-multiply opacity-80"></div>

                    {/* Green Triangle */}
                    <svg className="absolute bottom-[20%] right-[18%] md:right-[22%] w-32 h-32 md:w-48 md:h-48 text-[#9AB3A5] mix-blend-multiply opacity-80" viewBox="0 0 100 100" fill="currentColor">
                        <polygon points="50,0 100,100 0,100" />
                    </svg>

                    {/* Continuous Line Abstract Botanicals */}
                    <svg className="absolute inset-0 w-full h-full stroke-[#5B4A4A] stroke-[1.5] fill-none opacity-60 mx-auto" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" strokeLinecap="round" strokeLinejoin="round">
                        {/* Botanical 1 (Top Right) */}
                        <path d="M 600 100 C 580 80, 560 120, 600 150 C 640 180, 660 130, 620 100 C 580 70, 540 110, 580 140 C 620 170, 660 170, 640 130 M 600 150 C 600 200, 550 250, 500 280" />

                        {/* Botanical 2 (Left Center) */}
                        <path d="M 220 200 C 170 180, 200 130, 240 150 C 280 170, 270 220, 230 230 C 190 240, 160 190, 210 170 C 260 150, 300 180, 270 210 M 240 150 C 260 100, 310 50, 370 30" />

                        {/* Botanical 3 (Bottom Center) */}
                        <path d="M 400 550 C 420 480, 380 430, 420 380 C 460 330, 500 370, 480 420 C 460 470, 410 490, 440 440 C 470 390, 510 400, 530 450 M 420 380 C 380 340, 360 280, 400 250" />
                    </svg>
                </div>
            </div>

            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-start pt-2 sm:pt-4 pb-20 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in w-full text-center z-10">

                <div className="flex flex-col items-center gap-6">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
                        health &amp; wellness
                    </h2>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
                        <Heart className="w-4 h-4 fill-current" />
                        <span>Empowering Your Health Journey</span>
                    </div>
                </div>

                <div className="flex justify-center flex-wrap gap-x-6 sm:gap-x-12 w-full max-w-5xl mx-auto">
                    <div className="flex flex-col items-center">
                        <span className="text-7xl sm:text-[120px] leading-none font-black text-primary tracking-widest">H</span>
                        <span className="text-xl sm:text-2xl text-primary font-semibold mt-2">Health</span>
                    </div>
                    <div className="flex flex-col items-center relative">
                        <span className="text-7xl sm:text-[120px] leading-none font-black text-primary tracking-widest">E</span>
                        <span className="text-xl sm:text-2xl text-primary font-semibold mt-2 whitespace-nowrap">
                            Empowerment
                            <span className="absolute top-1/2 -translate-y-1/2 -right-3 sm:-right-5 translate-x-1/2 text-primary/60 italic text-lg sm:text-xl font-medium hidden md:block">&amp;</span>
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-7xl sm:text-[120px] leading-none font-black text-primary tracking-widest">A</span>
                        <span className="text-xl sm:text-2xl text-primary font-semibold mt-2">Abundant</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-7xl sm:text-[120px] leading-none font-black text-primary tracking-widest">L</span>
                        <span className="text-xl sm:text-[29px] text-primary font-medium mt-2">Livelihood</span>
                    </div>
                </div>

                <div className="max-w-xl mx-auto">
                    <p className="text-lg sm:text-xl text-[#444444] leading-relaxed font-medium">
                        A comprehensive platform to monitor your cycle, track vital health metrics, and receive personalized wellness recommendations.
                    </p>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                    <Link to="/register">
                        <Button className="px-8 py-4 text-lg rounded-full shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all bg-primary hover:bg-primary-light text-white !border-none">
                            Get Started
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button className="px-8 py-4 text-lg rounded-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all bg-white/60 hover:bg-white text-primary border border-primary/20 backdrop-blur-sm">
                            Log In
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 text-center text-gray-400 text-sm">
                <p>© 2026 HEAL Platform. All rights reserved.</p>
            </footer>
        </div>
    );
}
