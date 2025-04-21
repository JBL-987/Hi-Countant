import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Home({ actor, isAuthenticated, login, logout }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/app');
        }
    }, [isAuthenticated, navigate]);

    return (
        <>
            <main className="pt-16">
            </main>
        </>
    );
}