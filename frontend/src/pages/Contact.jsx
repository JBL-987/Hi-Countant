import React, { useRef } from "react";
import { Globe, Users, Award, Briefcase, Mail } from "lucide-react";
import Spline from "@splinetool/react-spline";

export default function Contact() {
  const heroRef = useRef(null);
  
  return (
   <main className="bg-black text-white overflow-hidden">
  {/* Hero Section with Contact Header */}
  <section className="min-h-[400px] relative flex flex-col justify-center items-center p-4 py-16 bg-black overflow-hidden">
    <div className="absolute inset-0 z-0">
      <Spline scene="https://prod.spline.design/44ZWgH6sCPd9Ny-a/scene.splinecode" />
    </div>
    <div className="max-w-4xl mx-auto text-center z-10 relative">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Contact Us 
      </h1>
      <p className="text-lg mb-6 text-gray-300 max-w-2xl mx-auto bg-black/70 p-3 rounded-lg">
        AI-powered accounting on the blockchain for smarter financial management
      </p>
    </div>
  </section>
      
  {/* About Section - Compact */}
  <section className="py-12 px-4 bg-black">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">About Hi! Countant</h2>
      <p className="text-gray-300">
        Founded in 2023, Hi! Countant combines AI with blockchain to revolutionize financial management. 
        Based in San Francisco with a global team of 40+ experts, we serve 5,000+ businesses worldwide, 
        processing over 12M transactions through our secure, intelligent platform.
      </p>
    </div>
  </section>
      
  {/* Mission and Vision - Side by Side */}
  <section className="py-10 px-4 bg-black border-t border-gray-800">
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-500/20">
          <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Our Mission</h2>
          <p className="text-gray-300 text-sm">
            To democratize access to professional financial management with intelligent, secure solutions.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-500/20">
          <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Our Vision</h2>
          <p className="text-gray-300 text-sm">
            A world where financial management empowers businesses rather than burdening them.
          </p>
        </div>
      </div>
    </div>
  </section>
      
  {/* Leadership - Compact Grid */}
  <section className="py-10 px-4 bg-black border-t border-gray-800">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Leadership</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-500/20">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white text-center">Jane Smith</h3>
          <p className="text-gray-400 text-sm text-center">Co-founder & CEO</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-500/20">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white text-center">John Davis</h3>
          <p className="text-gray-400 text-sm text-center">Co-founder & CTO</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-500/20">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white text-center">Sarah Johnson</h3>
          <p className="text-gray-400 text-sm text-center">Head of AI Research</p>
        </div>
      </div>
    </div>
  </section>

  {/* Core Values - Compact Grid */}
  <section className="py-10 px-4 bg-black border-t border-gray-800">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Core Values</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-3 rounded-xl border border-blue-500/20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full mx-auto mb-2 w-10 h-10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-md font-semibold text-white">Transparency</h3>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-3 rounded-xl border border-blue-500/20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full mx-auto mb-2 w-10 h-10 flex items-center justify-center">
            <Award className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-md font-semibold text-white">Integrity</h3>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-3 rounded-xl border border-blue-500/20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full mx-auto mb-2 w-10 h-10 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-md font-semibold text-white">Inclusivity</h3>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-3 rounded-xl border border-blue-500/20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full mx-auto mb-2 w-10 h-10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-md font-semibold text-white">Innovation</h3>
        </div>
      </div>
    </div>
  </section>

  {/* Contact Information */}
  <section className="py-10 px-4 bg-black border-t border-gray-800">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Get in Touch</h2>
      <div className="flex justify-center mb-4">
        <a href="mailto:info@hicountant.com" className="flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
          <Mail className="h-4 w-4 mr-2" />
          Contact Us
        </a>
      </div>
      <div className="text-gray-400 text-sm">
        <p>Hi! Countant, Inc. | 123 Financial District, San Francisco, CA 94111</p>
        <p>info@hicountant.com | (555) 123-4567</p>
      </div>
    </div>
  </section>
</main>
  );
}