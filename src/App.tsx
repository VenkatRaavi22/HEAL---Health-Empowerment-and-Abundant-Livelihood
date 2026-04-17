import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import LogHealth from './pages/LogHealth';
import CycleMonitor from './pages/CycleMonitor';

import Recommendations from './pages/Recommendations';
import SessionPage from './pages/SessionPage';
import Medication from './pages/Medication';
import Progress from './pages/Progress';
import Specialists from './pages/Specialists';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';

// Placeholder components until fully implemented
const Placeholder = ({ title }: { title: string }) => (
    <div className="p-10 text-center"><h1 className="text-2xl font-bold">{title} Coming Soon</h1></div>
);

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/log-health" element={<LogHealth />} />
                <Route path="/cycle" element={<CycleMonitor />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/session" element={<SessionPage />} />
                <Route path="/medication" element={<Medication />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/specialists" element={<Specialists />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chatbot" element={<Chatbot />} />
            </Routes>
        </Layout>
    );
}

export default App;
