import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

export const runDiagnostics = async () => {
    console.log('\n🔍 --- ROUTEGUARD SYSTEM DIAGNOSTICS ---');
    
    // 1. Check Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === 'your_gemini_key_here') {
        console.log('🔴 Gemini AI: MISSING (Using Mock Fallback)');
    } else {
        try {
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            // Try newest naming convention
            await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: "ping"
            });
            console.log('🟢 Gemini AI: AUTHORIZED & RESPONDING');
        } catch (e) {
            console.log(`🔴 Gemini AI: ERROR (${e.message})`);
            console.log('   Trying to find available models for your account...');
            try {
               const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
               const data = await res.json();
               if (data.models) {
                   const names = data.models.map(m => m.name.replace('models/', ''));
                   console.log(`   💡 Available models on your key: ${names.slice(0, 5).join(', ')} ...`);
               }
            } catch (err) {
               console.log('   ⚠️ Could not retrieve model list.');
            }
        }
    }

    // 2. Check GNews
    const gnewsKey = process.env.GNEWS_API_KEY;
    if (!gnewsKey || gnewsKey === 'your_gnews_key_here') {
        console.log('🔴 GNews API: MISSING (Using Hardcoded News)');
    } else {
        try {
            const res = await fetch(`https://gnews.io/api/v4/top-headlines?category=general&lang=en&max=1&apikey=${gnewsKey}`);
            if (res.ok) console.log('🟢 GNews API: AUTHORIZED & LIVE');
            else console.log(`🔴 GNews API: AUTH FAILED (Status: ${res.status})`);
        } catch (e) {
            console.log(`🔴 GNews API: ERROR (${e.message})`);
        }
    }

    // 3. Check OpenWeather
    const weatherKey = process.env.OPENWEATHER_API_KEY;
    if (!weatherKey || weatherKey === 'your_openweather_key_here') {
        console.log('🔴 OpenWeather: MISSING (Using Static Climate Data)');
    } else {
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=0&lon=0&appid=${weatherKey}`);
            if (res.ok) console.log('🟢 OpenWeather: AUTHORIZED & LIVE');
            else console.log(`🔴 OpenWeather: AUTH FAILED (Status: ${res.status})`);
        } catch (e) {
            console.log(`🔴 OpenWeather: ERROR (${e.message})`);
        }
    }

    // 4. Check Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey || resendKey === 'your_resend_key_here') {
        console.log('🔴 Resend Email: MISSING (Using Console Logs Only)');
    } else {
        try {
            const res = await fetch('https://api.resend.com/api-keys', {
                headers: { 'Authorization': `Bearer ${resendKey}` }
            });
            if (res.ok) console.log('🟢 Resend Email: AUTHORIZED & LIVE');
            else console.log(`🔴 Resend Email: AUTH FAILED (Status: ${res.status})`);
        } catch (e) {
            console.log(`🔴 Resend Email: ERROR (${e.message})`);
        }
    }

    console.log('----------------------------------------\n');
};

runDiagnostics();
