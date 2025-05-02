import React from "react";
import { Github } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer_Component = ({ isAuthenticated }) => {
  return (
    <footer className="bg-black border-t border-blue-900/30">
      <div className="w-full max-w-7xl mx-auto p-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Logo className="h-6 w-6" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Hi! Countant
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              Your AI accountant on the blockchain. Replacing traditional
              accountants with powerful AI.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/JBL-987/Hi-Countant"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                 <Github size={20} />
              </a>
            </div>
          </div>

          {isAuthenticated ? (
            <>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/Features"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Pricing"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Documentation"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Roadmap"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Roadmap
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/About"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Blog"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Careers"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Contact"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/Privacypolicy"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Termofservices"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Cookiepolicy"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Cookie Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/GDPR"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      GDPR
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-blue-900/30 pt-8 flex flex-col md:flex-row justify-between items-center">
          <span className="text-sm text-gray-400 mb-4 md:mb-0">
            © 2025 Hi! Countant™. All Rights Reserved.
          </span>
          {!isAuthenticated ? (
            <div className="flex space-x-6">
              <Link
                to="/Privacypolicy"
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/Termofservices"
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/Cookiepolicy"
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                Cookies
              </Link>
            </div>
          ) : (null)}
        </div>
      </div>
    </footer>
  );
};

export default Footer_Component;