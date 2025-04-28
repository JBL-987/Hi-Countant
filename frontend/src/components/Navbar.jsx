import React, { useState } from "react";
import Swal from "sweetalert2";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const Navbar_Component = ({ isAuthenticated, login, logout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-black/80 backdrop-blur-md fixed w-full z-50 top-0 start-0 border-b border-blue-900/30 shadow-lg">
      <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Logo className="h-8 w-8" />
          <span className="self-center text-2xl font-bold whitespace-nowrap text-white bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Hi! Countant
          </span>
        </div>

        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white hover:text-blue-400 focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden md:flex items-center space-x-8">
          {!isAuthenticated ? (
          <>
          <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">
            Features
          </a>
          <a href="#benefits" className="text-gray-300 hover:text-blue-400 transition-colors">
            Benefits
          </a>
          <a href="#testimonials" className="text-gray-300 hover:text-blue-400 transition-colors">
            Testimonials
          </a>
        </>
       ) : (
       <></>
        )}

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all"
            >
              Connect ICP
            </button>
          )}
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden w-full mt-4 bg-gray-900 rounded-lg p-4 border border-blue-900/30">
            <div className="flex flex-col space-y-4">
              <a
                href="#features"
                className="text-gray-300 hover:text-blue-400 transition-colors py-2"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-gray-300 hover:text-blue-400 transition-colors py-2"
              >
                Benefits
              </a>
              <a
                href="#testimonials"
                className="text-gray-300 hover:text-blue-400 transition-colors py-2"
              >
                Testimonials
              </a>

              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all"
                >
                  Connect ICP
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar_Component;
