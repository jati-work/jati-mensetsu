import React, { useState } from 'react';
import { ArrowRight, CloudOff, Cloud } from 'lucide-react';

const APP_LOGO = "https://raw.githubusercontent.com/jati-work/jati-mensetsu/main/images/jati-mensetsu-logo.png";

interface LoginProps {
    onLogin: (name: string) => void;
    isSupabaseConfigured: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isSupabaseConfigured }) => {
    const [userName, setUserName] = useState('');

    const handleSubmit = () => {
        if (userName.trim()) {
            onLogin(userName);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6 relative overflow-hidden">
            <div className="bg-white max-w-sm w-full p-10 md:p-14 rounded-[56px] shadow-2xl border border-gray-100 text-center space-y-10 fade-in z-10">
                <div className="w-28 h-28 bg-white border border-gray-100 rounded-[35px] mx-auto flex items-center justify-center overflow-hidden shadow-xl">
                    <img src={APP_LOGO} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">JATI MENSETSU</h1>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Portal Persiapan Kaigo</p>
                </div>

                <div className={`mx-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full border w-fit ${isSupabaseConfigured ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    {isSupabaseConfigured ? <Cloud size={14} className="text-emerald-500"/> : <CloudOff size={14} className="text-rose-400"/>}
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${isSupabaseConfigured ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {isSupabaseConfigured ? 'Connected to Cloud' : 'Local Mode Only'}
                    </span>
                </div>

                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        className="w-full bg-gray-50 border border-gray-200 rounded-3xl py-5 px-8 text-gray-900 font-bold outline-none text-center focus:ring-4 focus:ring-indigo-50 transition-all" 
                        placeholder="Siapa namamu?" 
                    />
                    <button 
                        onClick={handleSubmit} 
                        className="w-full py-5 bg-indigo-600 text-white rounded-[32px] font-black text-lg shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        MASUK <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
