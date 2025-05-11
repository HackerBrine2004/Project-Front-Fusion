'use client'
import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Bell, ChevronDown, Shield, Zap, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add scroll detection for navbar appearance change
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const isLoggedIn = user;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full transition-all duration-300 
          ${scrolled 
            ? "bg-black/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(138,43,226,0.2)]" 
            : "bg-black/50 backdrop-blur-md"
          } border-b border-violet-500/50`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        </div>
        
        <nav className="relative max-w-[85rem] w-full mx-auto md:flex md:items-center md:justify-between md:gap-3 py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-x-1">
            <Link
              className="flex-none font-semibold text-3xl relative group"
              href="/"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-violet-400 animate-gradient bg-300% group-hover:from-cyan-400 group-hover:via-violet-400 group-hover:to-cyan-400 transition-all duration-300">
                Front-Fusion A.I
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-500 group-hover:w-full transition-all duration-300 ease-in-out"></span>
            </Link>

            <button
              type="button"
              className="md:hidden relative size-10 flex justify-center items-center font-medium text-sm rounded-lg border border-violet-500/30 text-gray-200 hover:bg-violet-500/20 hover:border-violet-400 focus:outline-hidden focus:bg-violet-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
            >
              {isOpen ? <X size={24} className="text-cyan-300" /> : <Menu size={24} className="text-cyan-300" />}
            </button>
          </div>

          <div className={`${isOpen ? "block" : "hidden"} md:block`}>
            <div className="overflow-hidden max-h-[75vh]">
              <div className="py-2 md:py-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
                <div className="grow flex flex-col md:flex-row md:justify-end md:items-center gap-3">
                  {/* Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="p-2 flex items-center text-sm text-gray-200 hover:text-cyan-300 hover:bg-violet-500/20 rounded-lg focus:outline-hidden focus:bg-violet-500/20 transition-all duration-200"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <Shield className="size-4 mr-2 text-violet-400" />
                      Explore
                      <ChevronDown
                        className={`ml-2 transition-transform duration-300 size-4 ${
                          dropdownOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu with animation */}
                    {dropdownOpen && (
                      <div className="absolute left-0 mt-2 w-52 bg-black/90 border border-violet-500/30 rounded-lg shadow-lg z-50 backdrop-blur-xl animate-fadeIn overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                        
                        <Link
                          href="/about"
                          className="block px-4 py-2.5 text-gray-200 hover:text-cyan-300 hover:bg-violet-500/20 transition-all duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <div className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-2.5"></span>
                            About
                          </div>
                        </Link>
                        <Link
                          href="/downloads"
                          className="block px-4 py-2.5 text-gray-200 hover:text-cyan-300 hover:bg-violet-500/20 transition-all duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <div className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2.5"></span>
                            Downloads
                          </div>
                        </Link>
                        <Link
                          href="/team"
                          className="block px-4 py-2.5 text-gray-200 hover:text-cyan-300 hover:bg-violet-500/20 transition-all duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <div className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-2.5"></span>
                            Team Account
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Rest of your navigation items with enhanced styling */}
                  <Link
                    className="p-2 flex items-center text-sm text-gray-200 hover:text-cyan-300 hover:bg-violet-500/20 rounded-lg focus:outline-hidden focus:bg-violet-500/20 transition-all duration-200"
                    href="#"
                  >
                    <Bell className="size-4 mr-2 text-violet-400" />
                    Notifications
                  </Link>

                  <Link
                    className="p-2 flex items-center text-sm text-gray-200 hover:text-cyan-300 hover:bg-violet-500/20 rounded-lg focus:outline-hidden focus:bg-violet-500/20 transition-all duration-200"
                    href="/about"
                  >
                    <User className="size-4 mr-2 text-violet-400" />
                    About Us
                  </Link>

                  <Link
                    className="p-2 flex items-center text-sm text-gray-200 hover:text-cyan-300 hover:bg-violet-500/20 rounded-lg focus:outline-hidden focus:bg-violet-500/20 transition-all duration-200"
                    href="/contact"
                  >
                    <Zap className="size-4 mr-2 text-cyan-400" />
                    Contact Us
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 mt-2 md:mt-0">
                  {isLoggedIn ? (
                    <>
                      <Link
                        className="relative py-2 px-4 inline-flex items-center font-medium text-sm rounded-lg border border-violet-500/30 bg-black/30 text-gray-200 hover:text-cyan-300 hover:border-violet-400 hover:bg-violet-500/20 focus:outline-hidden focus:bg-violet-500/20 transition-all duration-200 overflow-hidden group"
                        href="/user/sessions"
                      >
                        <span className="relative z-10">My Sessions</span>
                        <span className="absolute bottom-0 left-0 w-full h-0 bg-gradient-to-r from-violet-500/30 to-cyan-500/30 group-hover:h-full transition-all duration-300 ease-in-out -z-0"></span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="relative py-2 px-4 inline-flex items-center font-medium text-sm rounded-lg bg-gradient-to-r from-red-600/80 to-red-700/80 text-white hover:from-red-500 hover:to-red-600 focus:outline-hidden focus:ring-2 focus:ring-red-500/50 transition-all duration-200"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        className="relative py-2 px-4 inline-flex items-center font-medium text-sm rounded-lg border border-violet-500/30 bg-black/30 text-gray-200 hover:text-cyan-300 hover:border-violet-400 hover:bg-violet-500/20 focus:outline-hidden focus:bg-violet-500/20 transition-all duration-200 overflow-hidden group"
                        href="/auth/login"
                      >
                        <span className="relative z-10">Log in</span>
                        <span className="absolute bottom-0 left-0 w-full h-0 bg-gradient-to-r from-violet-500/30 to-cyan-500/30 group-hover:h-full transition-all duration-300 ease-in-out -z-0"></span>
                      </Link>
                      <Link
                        className="relative py-2 px-4 inline-flex items-center font-medium text-sm rounded-lg bg-gradient-to-r from-violet-600/90 to-blue-600/90 text-white hover:from-violet-500 hover:to-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 shadow-[0_0_10px_rgba(138,43,226,0.3)]"
                        href="/auth/register"
                      >
                        <span className="mr-1">Sign Up</span>
                        <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.75 6.75L19.25 12L13.75 17.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M19 12H4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Add some CSS animations */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
        
        .bg-300\% {
          background-size: 300% 300%;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navbar;