import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Calendar, Ruler, Weight, Activity, LogOut } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api("/profile");
                setProfile(data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
    };

    if (loading) return <div className="p-10 text-center">Loading profile...</div>;
    if (!profile) return <div className="p-10 text-center">Profile not found.</div>;

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 flex gap-2" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" /> Sign Out
                </Button>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-secondary h-32"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-12 mb-6">
                        <div className="bg-white p-2 rounded-2xl inline-block shadow-lg">
                            <div className="bg-primary/10 w-20 h-20 rounded-xl flex items-center justify-center text-primary">
                                <User className="w-10 h-10 fill-current opacity-20" />
                                <span className="absolute text-2xl font-bold">{profile.name?.[0]}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                        <p className="text-gray-500 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> {profile.email}
                        </p>
                    </div>

                    <hr className="my-8 border-gray-100" />

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Age</p>
                            <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" /> {profile.age} years
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Condition</p>
                            <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-secondary" /> {profile.known_condition || 'None reported'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Height</p>
                            <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-accent" /> {profile.height} cm
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weight</p>
                            <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <Weight className="w-4 h-4 text-primary" /> {profile.weight} kg
                            </p>
                        </div>
                    </div>

                    <div className="mt-10">
                        <Button fullWidth onClick={() => navigate('/setup')} variant="ghost" className="border border-gray-200">
                            Update Health Details
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <h3 className="font-bold text-primary mb-2">Privacy Note</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Your health data is used only to personalize your HEAL experience and provide more accurate monitoring.
                    We prioritize your privacy and never share your sensitive information.
                </p>
            </div>
        </div>
    );
}
