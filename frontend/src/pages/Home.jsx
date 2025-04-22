import React, { useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';

export default function Home({ isAuthenticated }) {
    const navigate = useNavigate();
    const vantaRef = useRef(null);
    const vantaEffect = useRef(null);

    useEffect(() => {
        if (!vantaEffect.current && window.VANTA?.WAVES && window.THREE) {
            vantaEffect.current = window.VANTA.WAVES({
                el: vantaRef.current,
                THREE: window.THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x0,
                shininess: 57.00,
                waveHeight: 14.00,
                waveSpeed: 0.60,
                zoom: 0.92
            });
        }

        return () => {
            if (vantaEffect.current) {
                vantaEffect.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/app');
        }
    }, [isAuthenticated, navigate]);

    return (
        <main ref={vantaRef} className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4">
            <div className="max-w-4xl text-center">
                <h1 className="text-4xl font-bold mb-4">
                    Welcome to the Hi! Countant
                </h1>
                <p className="text-lg mb-6">
                    Explore the power of decentralized applications built on the Internet Computer.
                </p>
                <p className="text-lg mb-6">
                    Connect to ICP now
                </p>
            </div>
        </main>
    );
}
