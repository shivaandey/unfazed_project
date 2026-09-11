import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0B0B45] pt-16 pb-10 px-8 text-white mt-auto">
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
            <span className="flex items-center px-3 bg-gray-100 text-gray-800 text-sm border-r border-gray-300">🇮🇳 ▾</span>
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
  );
}