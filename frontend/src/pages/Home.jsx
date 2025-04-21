import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Home({ isAuthenticated }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/app');
        }
    }, [isAuthenticated, navigate]);

    return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <div className="max-w-4xl text-center">
                <h1 className="text-4xl font-bold mb-4">
                    Welcome to the Hi! Countant
                </h1>
                <p className="text-lg mb-6">
                    Explore the power of decentralized applications built on the Internet Computer. Join us now!
                </p>
            </div>

            <div className="absolute top-0 left-0 w-full h-full z-[-1]">
                <img 
                    src="https://via.placeholder.com/1920x1080/1e293b/ffffff?text=Web3+Future" 
                    alt="Background"
                    className="w-full h-full object-cover opacity-30"
                />
            </div>
        </main>
    );
}
