import React, { useRef } from "react";
import { Globe, Users, Award, Briefcase, Mail } from "lucide-react";
import Spline from "@splinetool/react-spline";

export default function Careers() {
  const heroRef = useRef(null);
  
  return (
   <main className="bg-black text-white overflow-hidden">
      <section className="min-h-[500px] relative flex flex-col justify-center items-center p-4 py-20 bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Spline scene="https://prod.spline.design/44ZWgH6sCPd9Ny-a/scene.splinecode" />
        </div>
        <div ref={heroRef} className="max-w-5xl mx-auto text-center z-10 relative">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Careers 
          </h1>
          <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto bg-black/70 p-4 rounded-lg">
            Transforming financial management with AI-powered accounting on the blockchain
          </p>
        </div>
      </section>
          
      <section className="py-16 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Company Overview</h2>
          <div className="prose prose-lg max-w-none text-gray-300">
            <p>
              Hi! Countant is a pioneering fintech company founded in 2023 that combines advanced artificial intelligence with blockchain technology to revolutionize accounting and financial management for businesses of all sizes.
            </p>
            <p className="mt-4">
              Based in San Francisco with team members across the globe, we've grown from a small startup to a trusted financial technology provider serving thousands of businesses worldwide. Our platform securely manages financial data while providing the insights needed for informed business decisions.
            </p>
            <p className="mt-4">
              Our diverse team brings together expertise in accounting, artificial intelligence, blockchain technology, and user experience design to create solutions that are both powerful and accessible.
            </p>
          </div>
        </div>
      </section>
          
      <section className="py-16 px-4 bg-black border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Our Mission</h2>
              <p className="text-gray-300">
                To democratize access to professional financial management by creating intelligent, secure, and user-friendly accounting solutions that empower businesses to make better financial decisions.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Our Vision</h2>
              <p className="text-gray-300">
                A world where financial management is no longer a burden but an empowering tool for all businesses, where technology handles the complexity so entrepreneurs can focus on what they do best.
              </p>
            </div>
          </div>
        </div>
      </section>
          
      <section className="py-16 px-4 bg-black border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/20">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white text-center">Jane Smith</h3>
              <p className="text-gray-400 mb-2 text-center">Co-founder & CEO</p>
              <p className="text-sm text-gray-400 text-center">
                Former financial analyst with 15 years of experience in corporate finance and technology.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/20">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white text-center">John Davis</h3>
              <p className="text-gray-400 mb-2 text-center">Co-founder & CTO</p>
              <p className="text-sm text-gray-400 text-center">
                AI researcher and blockchain developer with prior experience at leading tech companies.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/20">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white text-center">Sarah Johnson</h3>
              <p className="text-gray-400 mb-2 text-center">Head of AI Research</p>
              <p className="text-sm text-gray-400 text-center">
                PhD in Computer Science specializing in machine learning applications in finance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-black border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/20">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-4 flex-shrink-0">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Transparency</h3>
                <p className="text-gray-300">
                  We believe financial data should be clear and accessible, which is why our platform provides complete visibility into every transaction.
                </p>
              </div>
            </div>
            
            <div className="flex items-start bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/20">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-4 flex-shrink-0">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Integrity</h3>
                <p className="text-gray-300">
                  We maintain the highest standards of honesty and ethics in everything we do, ensuring our clients' financial data is handled with utmost care.
                </p>
              </div>
            </div>
            
            <div className="flex items-start bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/20">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-4 flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Inclusivity</h3>
                <p className="text-gray-300">
                  We design our solutions to be accessible to businesses of all sizes, from solo entrepreneurs to growing enterprises, regardless of technical expertise.
                </p>
              </div>
            </div>
            
            <div className="flex items-start bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/20">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-4 flex-shrink-0">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Innovation</h3>
                <p className="text-gray-300">
                  We continuously explore new technologies and methodologies to improve our platform and deliver more value to our users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-black border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Company Facts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-xl border border-blue-500/20">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">2023</div>
              <p className="text-gray-300">Founded</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-xl border border-blue-500/20">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">40+</div>
              <p className="text-gray-300">Team Members</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-xl border border-blue-500/20">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">5,000+</div>
              <p className="text-gray-300">Clients Worldwide</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-xl border border-blue-500/20">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">12M+</div>
              <p className="text-gray-300">Transactions Processed</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-black border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Get in Touch</h2>
          <p className="text-lg mb-8 text-gray-300">
            Interested in learning more about Hi! Countant? Our team is ready to answer your questions.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <a href="mailto:info@hicountant.com" className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all transform hover:scale-105">
              <Mail className="h-5 w-5 mr-2" />
              Contact Us
            </a>
          </div>
          <div className="mt-8 text-gray-400">
            <p>Hi! Countant, Inc.</p>
            <p>123 Financial District, San Francisco, CA 94111</p>
            <p>info@hicountant.com | (555) 123-4567</p>
          </div>
        </div>
      </section>
    </main>
  );
}