'use client';
import { useStore } from "@/store/useStore";
import { getPluginState } from "next/dist/build/build-context";
import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export function useAuth(){
    const {user, token, setUser, setToken, logout: storeLogout} = useStore();

    const register = useCallback(
        async (username: string, email: string, password: string) =>{
            const res = await fetch(`${API_URL}/auth/register`,{
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({username, email, password}),
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.message || 'Registration failed');
            setUser(data.user);
            setToken(data.user);
            return data;
        },
        [setUser, setToken]
    );

    const login = useCallback(
        async (email: string, password: string)=>{
            const res = await fetch(`${API_URL}/auth/login`,{
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({email, password}),
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.message || 'Login failed');
            setUser(data.user);
            setToken(data.token);
            return data;
        },
        [setUser, setToken]
    );

    const logout = useCallback(()=>{
        storeLogout();
    }, [storeLogout]);

    const saveResult = useCallback(
        async (result: {
            wpm: number;
            accuracy: number;
            errors: number;
            duration: number;
            mode: string;
            wordCount: number;
        }) =>{
            const guestId = 
                typeof window !== 'undefined'
                ? localStorage.getItem('typeblaze-guest-id') || 'guest'
                : 'guest';

            await fetch(`${API_URL}/stats/result`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ ...result, guestId }),
            });
        },
        [token]
    );
    return { user, token, isLoggedIn: !!user, register, login, logout, saveResult };
}