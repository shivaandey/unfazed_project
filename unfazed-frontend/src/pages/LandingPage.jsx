import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#F28C28] rounded-full rounded-bl-none flex items-center justify-center text-white font-bold text-xl">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#0B0B45] tracking-widest leading-none">UNFAZED</span>
            <span className="text-[10px] text-gray-400 tracking-wider">your happy place!</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-[#F28C28] transition-colors">Corporate Resources</a>
          <a href="#" className="hover:text-[#F28C28] transition-colors">Plans & Pricing</a>
          <a href="#" className="hover:text-[#F28C28] transition-colors">Our Counselors</a>
          <a href="#" className="hover:text-[#F28C28] transition-colors">Wellness Hub</a>
          <a href="#" className="hover:text-[#F28C28] transition-colors">Corporates</a>
          <div className="flex gap-3 ml-4">
            <Link to="/register" className="px-6 py-2 bg-[#F28C28] text-white rounded-full hover:bg-orange-600 transition-colors">Sign Up</Link>
            <Link to="/login" className="px-6 py-2 border border-[#F28C28] text-[#F28C28] rounded-full hover:bg-orange-50 transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative flex flex-col md:flex-row items-center bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[#0B0B45] w-1/3 rounded-br-full -translate-x-20 opacity-5"></div>
        <div className="md:w-1/2 px-12 lg:px-24 py-20 z-10">
          <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative z-20">
            <h1 className="text-5xl font-extrabold text-[#F28C28] mb-4 tracking-tight">Talk. Resolve. Heal.</h1>
            <p className="text-xl text-gray-700 font-medium mb-2">Online Counselling Therapy With Top Psychologists</p>
            <p className="text-gray-500 mb-8">Anytime, Anywhere, Any device.</p>
            <Link to="/register" className="inline-block px-8 py-3 bg-[#F28C28] text-white font-medium rounded shadow-lg hover:shadow-xl hover:bg-orange-600 transition-all">
              Get Started
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 py-10 pr-10">
          <img src="https://images.pexels.com/photos/7699488/pexels-photo-7699488.jpeg?auto=format&fit=crop&w=800&q=80" alt="Therapy App Interface" className="rounded-xl shadow-2xl" />
        </div>
      </section>

      {/* COUNSELORS & FEATURES */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-800">Choose Help. Not Suffering.</h2>
          <div className="w-24 h-1 bg-[#F28C28] mx-auto mt-4"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 relative flex justify-center items-center h-80">
            <div className="absolute w-40 h-56 bg-gray-200 rounded-2xl shadow-lg -translate-x-32 scale-75 opacity-60 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" alt="Counselor" className="w-full h-full object-cover"/>
            </div>
            <div className="absolute z-20 bg-white rounded-2xl shadow-2xl p-2 w-64 text-center transform scale-105">
              <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80" alt="Dr. V S" className="w-full h-64 object-cover rounded-xl mb-4" />
              <h3 className="font-bold text-lg text-gray-900">Dr. V S Ananthakrishnan</h3>
              <p className="text-sm text-gray-500 mb-2">MBBS, MD (Psychiatry)</p>
              <div className="flex justify-center gap-2 pb-2">
                <span className="w-2 h-2 bg-gray-800 rounded-full"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
              </div>
            </div>
            <div className="absolute w-40 h-56 bg-gray-200 rounded-2xl shadow-lg translate-x-32 scale-75 opacity-60 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80" alt="Counselor" className="w-full h-full object-cover"/>
            </div>
          </div>

          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Counselling Therapy Sessions With Licensed & Verified Experts</h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              Highly qualified team of some of the best names in psychology who deliver improved well-being to you. Carefully vetted through a rigorous selection process. Trained and experienced in all psychotherapy techniques.
            </p>
            
            <div className="flex gap-8 mb-8">
              <div className="text-center">
                <svg className="w-10 h-10 text-[#F28C28] mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                <span className="text-sm font-bold text-gray-700">Video Session</span>
              </div>
              <div className="text-center">
                <svg className="w-10 h-10 text-[#F28C28] mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
                <span className="text-sm font-bold text-gray-700">Audio Session</span>
              </div>
              <div className="text-center">
                <svg className="w-10 h-10 text-[#F28C28] mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
                <span className="text-sm font-bold text-gray-700">Chat Session</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 text-sm font-bold text-gray-700">
              <li>English And All Regional Indian Languages</li>
              <li>100% Private & Secure Platform</li>
              <li>24/7 Support</li>
            </ul>

            <button className="px-8 py-3 bg-[#F28C28] text-white font-medium rounded hover:bg-orange-600 transition-colors shadow-md">
              View All Counselors
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER & NEWSLETTER */}
      <div className="relative mt-20">
        <div className="absolute left-0 right-0 -top-24 max-w-5xl mx-auto px-6 z-20">
          <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center text-center border-t-4 border-[#0B0B45] relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-[#F28C28] rounded-tl-full translate-x-4 translate-y-4"></div>
            <h2 className="text-3xl font-extrabold text-[#0B0B45] mb-2 z-10">The latest mental health news and tips, delivered to your inbox weekly.</h2>
            <div className="w-48 h-1 bg-[#F28C28] mb-8 z-10"></div>
            <div className="flex w-full max-w-2xl z-10">
              <input type="email" placeholder="Email" className="flex-1 px-4 py-3 border border-gray-300 rounded-l focus:outline-none focus:border-[#F28C28]" />
              <button className="px-8 py-3 bg-[#F28C28] text-white font-medium rounded-r hover:bg-orange-600 transition-colors">Subscribe</button>
            </div>
          </div>
        </div>

        <footer className="bg-[#0B0B45] pt-40 pb-10 px-8 text-white relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-[#F28C28] rounded-full rounded-bl-none flex items-center justify-center font-bold text-xl">U</div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold tracking-widest leading-none">UNFAZED</span>
                  <span className="text-[10px] text-gray-300 tracking-wider">your happy place!</span>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Sapphire Space, Bani Park, <br/>Jaipur 302016, India
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <a href="mailto:hola@unfazed.care" className="underline hover:text-white">hola@unfazed.care</a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <a href="tel:+916377327550" className="underline hover:text-white">+916377327550</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">For Corporates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Therapists</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Legal Stuff</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms Of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">We are here to make sure that you are always happy</h4>
              <div className="flex bg-white rounded overflow-hidden mb-4 p-1">
                <span className="flex items-center px-3 bg-gray-100 text-gray-800 text-sm border-r border-gray-300">
                  🇮🇳 ▾
                </span>
                <input type="text" placeholder="Enter your phone number" className="w-full px-3 py-2 text-gray-800 text-sm focus:outline-none" />
              </div>
              <button className="px-6 py-2.5 bg-[#F28C28] text-white font-medium rounded shadow hover:bg-orange-600 transition-colors w-1/2">
                Request Callback
              </button>
            </div>
          </div>

          <div className="text-center mt-16 pt-8 border-t border-blue-900/50 text-sm text-gray-400">
            <p className="mb-2">If you are in a life-threatening situation — DO NOT use this site. Use these <span className="text-[#F28C28]">resources</span> to get immediate help.</p>
            <p>©Unfazed. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}