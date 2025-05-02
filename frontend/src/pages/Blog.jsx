import React, { useRef } from "react";
import { Globe, Users, Award, Briefcase, Mail } from "lucide-react";
import Spline from "@splinetool/react-spline";

export default function Blog() {
  const heroRef = useRef(null);
  
    return (
    <main className="bg-black text-white overflow-hidden">

  <section className="min-h-[400px] relative flex flex-col justify-center items-center p-4 py-12 bg-black">
    <div className="absolute inset-0 z-0">
      <Spline scene="https://prod.spline.design/44ZWgH6sCPd9Ny-a/scene.splinecode" />
    </div>
    <div ref={heroRef} className="max-w-4xl mx-auto text-center z-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Our Blog
      </h1>
      <p className="text-lg mb-6 text-gray-300 max-w-2xl mx-auto bg-black/70 p-3 rounded-lg">
        Transforming financial management with AI-powered accounting on the blockchain
      </p>
    </div>
  </section>
    
  <section className="py-10 px-4 bg-black">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Company Overview</h2>
      <p className="text-gray-300">
        Hi! Countant is a fintech company founded in 2025 that combines AI with blockchain to revolutionize accounting for businesses of all sizes. Based in San Francisco with a global team, we've grown to serve thousands of businesses worldwide with secure financial management solutions.
      </p>
    </div>
  </section>
    
  {/* Mission & Vision */}
  <section className="py-10 px-4 bg-black border-t border-gray-800">
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-5 border border-blue-500/20">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Our Mission</h2>
          <p className="text-gray-300 text-sm">
            To democratize access to professional financial management with intelligent, secure accounting solutions.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-5 border border-blue-500/20">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Our Vision</h2>
          <p className="text-gray-300 text-sm">
            A world where financial management empowers businesses, not burdens them.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section className="py-10 px-4 bg-black border-t border-gray-800">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Leadership Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: "Jane Smith", role: "Co-founder & CEO", bio: "15 years in corporate finance and technology" },
          { name: "John Davis", role: "Co-founder & CTO", bio: "AI researcher and blockchain developer" },
          { name: "Sarah Johnson", role: "Head of AI Research", bio: "PhD in Computer Science, ML in finance" }
        ].map((leader) => (
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-500/20">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white text-center">{leader.name}</h3>
            <p className="text-gray-400 mb-1 text-center text-sm">{leader.role}</p>
            <p className="text-xs text-gray-400 text-center">{leader.bio}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  <section className="py-10 px-4 bg-black border-t border-gray-800">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Our Core Values</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: Globe, title: "Transparency", desc: "Clear and accessible financial data with complete visibility" },
          { icon: Award, title: "Integrity", desc: "Highest standards of honesty and ethics in handling financial data" },
          { icon: Users, title: "Inclusivity", desc: "Solutions accessible to businesses of all sizes and technical expertise" },
          { icon: Briefcase, title: "Innovation", desc: "Continuously exploring new technologies to improve our platform" }
        ].map((value) => (
          <div className="flex items-start bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-500/20">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full mr-3 flex-shrink-0">
              <value.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 text-white">{value.title}</h3>
              <p className="text-gray-300 text-sm">{value.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

  <section className="py-10 px-4 bg-black border-t border-gray-800">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Company Facts</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          { value: "2023", label: "Founded" },
          { value: "40+", label: "Team Members" },
          { value: "5,000+", label: "Clients Worldwide" },
          { value: "12M+", label: "Transactions" }
        ].map((fact) => (
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 rounded-xl border border-blue-500/20">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-1">{fact.value}</div>
            <p className="text-gray-300 text-sm">{fact.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  <section className="py-10 px-4 bg-black border-t border-gray-800">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Get in Touch</h2>
      <a href="mailto:info@hicountant.com" className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
        <Mail className="h-4 w-4 mr-2" />
        Contact Us
      </a>
      <div className="mt-4 text-gray-400 text-sm">
        <p>Hi! Countant, Inc. | 123 Financial District, San Francisco, CA 94111</p>
        <p>info@hicountant.com | (555) 123-4567</p>
      </div>
    </div>
  </section>
</main>
  );
}