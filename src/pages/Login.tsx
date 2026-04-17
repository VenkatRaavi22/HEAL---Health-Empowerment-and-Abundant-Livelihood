import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const data = await api("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (data.user.profileCompleted) {
                navigate('/dashboard');
            } else {
                navigate('/setup');
            }
        } catch (err: any) {
            setError(err.message || "Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--color-background)] z-0">
            {/* Background Graphic - Continuous Line Woman & Geometric Shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 flex justify-center lg:justify-start items-center opacity-85">
                <div className="relative w-full max-w-2xl h-full min-h-[600px] flex items-center lg:ml-[8%]">
                    <svg className="w-[140%] -translate-x-12 sm:w-[120%] sm:-translate-x-10 lg:w-full lg:max-w-3xl transform lg:translate-x-0" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Background Geometric Shapes */}
                        {/* Pink Semi-circle */}
                        <path d="M 90 190 A 90 90 0 0 0 270 190 Z" fill="#D19B95" opacity="0.65" />

                        {/* Yellow Quarter-circle */}
                        <path d="M 270 150 L 270 20 A 130 130 0 0 1 400 150 Z" fill="#E6BF70" opacity="0.65" />

                        {/* Green Triangle */}
                        <polygon points="300,210 410,380 220,380" fill="#9AB3A5" opacity="0.65" />

                        {/* Continuous Line Art - Woman's Face & Botanicals */}
                        <g stroke="#5B4A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                            {/* Woman Profile */}
                            <path d="M 230 160 C 220 180, 210 200, 220 220 C 230 240, 235 250, 200 270 C 205 275, 220 275, 225 280 C 210 285, 202 292, 205 295 C 210 305, 220 305, 220 315 C 220 330, 240 340, 240 360 C 240 380, 260 390, 300 360" />

                            {/* Lips */}
                            <path d="M 200 292 C 215 285, 230 285, 240 295 C 230 297, 215 297, 200 292 Z" fill="#E91E63" stroke="none" />
                            <path d="M 200 292 C 215 310, 230 310, 240 295 C 230 297, 215 297, 200 292 Z" fill="#E91E63" stroke="none" />
                            <path d="M 200 292 C 215 285, 230 285, 240 295 C 230 310, 215 310, 200 292 Z" />
                            <path d="M 200 292 C 215 297, 230 297, 240 295" />

                            {/* Eyebrow */}
                            <path d="M 130 200 C 150 185, 180 190, 210 205" />

                            {/* Eye with eyelashes */}
                            <path d="M 135 225 C 155 210, 185 210, 200 225" />
                            <path d="M 135 225 C 155 235, 185 235, 200 225" />
                            <circle cx="167" cy="225" r="6" fill="#5B4A4A" stroke="none" />
                            <path d="M 135 225 C 130 220, 125 220, 120 225" />
                            <path d="M 200 225 C 205 230, 205 235, 200 240" />

                            {/* Flower 1 */}
                            <path d="M 110 100 C 90 70, 130 30, 150 60 C 190 40, 200 90, 170 110 C 200 140, 150 180, 130 150 C 110 180, 70 150, 90 120 C 60 100, 80 60, 110 100" />
                            <path d="M 135 105 C 130 95, 145 90, 140 105 C 145 110, 130 115, 135 105 Z" />

                            {/* Flower 2 */}
                            <path d="M 220 80 C 200 50, 250 10, 280 40 C 320 20, 330 70, 300 90 C 330 120, 280 160, 260 130 C 240 160, 200 130, 220 100 C 190 80, 200 50, 220 80" />
                            <path d="M 260 85 C 255 75, 270 70, 265 85 C 270 90, 255 95, 260 85 Z" />

                            {/* Flower 3 */}
                            <path d="M 260 200 C 240 170, 290 130, 320 160 C 360 140, 370 190, 340 210 C 370 240, 320 280, 300 250 C 280 280, 240 250, 260 220 C 230 200, 240 170, 260 200" />
                            <path d="M 300 205 C 295 195, 310 190, 305 205 C 310 210, 295 215, 300 205 Z" />

                            {/* Sweeping connection lines */}
                            <path d="M 170 110 C 190 120, 200 140, 220 160" />
                            <path d="M 230 160 C 240 140, 250 140, 260 130" />
                            <path d="M 300 250 C 290 300, 270 320, 255 360" />
                            <path d="M 150 60 C 170 50, 200 60, 220 80" />
                        </g>
                    </svg>
                </div>
            </div>

            <Card className="relative z-10 w-full max-w-md p-8 animate-fade-in-up bg-white/95 backdrop-blur-sm shadow-xl border border-white/50">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h2>
                <p className="text-center text-gray-500 mb-8">Sign in to continue your health journey</p>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="hello@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button fullWidth type="submit" className="mt-4">
                        Sign In
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
                        Create account
                    </Link>
                </p>
            </Card>
        </div>
    );
}
