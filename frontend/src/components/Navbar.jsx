import React from 'react';
import Swal from 'sweetalert2';

const Navbar_Component = ({ isAuthenticated, login, logout }) => {
    const handleLogin = async () => {
        try {
            await login();
        } catch (e) {
            Swal.fire({
                icon: "error",
                title: "Error connecting to ICP",
                text: "Something went wrong!",
            });
        }
    };
    
    return (
        <nav className="bg-white dark:bg-black fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Hi! Countant</span>
                </a>
                <div className="flex md:order-2 space-x-3 md:space-x-4 rtl:space-x-reverse">
                    {isAuthenticated ? (
                        <button 
                            onClick={logout}
                            className="text-white bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-700 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-gray-800 dark:hover:bg-gray-900 dark:focus:ring-gray-700">
                            Logout
                        </button>
                    ) : (
                        <button 
                            onClick={handleLogin}
                            className="text-black bg-gray-200 hover:bg-gray-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-gray-200 dark:hover:bg-gray-200 dark:focus:ring-gray-400"
                        >
                            Connect ICP
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar_Component;