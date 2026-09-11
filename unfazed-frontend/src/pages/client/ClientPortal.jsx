import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format, addDays } from 'date-fns';

export default function ClientPortal() {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);

  useEffect(() => {
    // Simulated API fetch
    setTimeout(() => {
      const data = {
        name: "Dr. Sharma",
        bio: "Specializing in cognitive behavioral therapy to help you navigate anxiety and stress.",
        specializations: ["Anxiety", "Depression", "CBT"],
        languages: ["English", "Hindi"],
        heroImageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop" 
      };
      setTherapist(data);

      // Dynamically inject Open Graph Meta Tags for shareability
      document.title = `${data.name} | Unfazed Private Practice`;
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', `${data.name} | Book a Session`);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', data.bio);
    }, 500);
  }, [slug]);

  if (!therapist) return <div className="flex h-screen items-center justify-center animate-pulse">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-[#0B0B45] pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 animate-slide-up">
          <img src={therapist.heroImageUrl} alt={therapist.name} className="w-40 h-40 rounded-full border-4 border-white shadow-2xl object-cover" />
          <div className="text-center md:text-left text-white">
            <h1 className="text-4xl font-bold mb-3">{therapist.name}</h1>
            <p className="text-gray-300 max-w-2xl text-lg">{therapist.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              {therapist.specializations.map((spec, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium">{spec}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10 animate-fade-in">
        
        {/* Service Cards */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-[#0B0B45] mb-6 border-b pb-4">Available Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 p-6 rounded-xl hover:border-[#F28C28] transition-colors cursor-pointer">
              <h3 className="font-bold text-lg text-gray-800">Video Consultation</h3>
              <p className="text-gray-500 text-sm mt-2 mb-4">60 Min • Private Video Call</p>
              <button className="w-full py-2 bg-[#F28C28] text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">Select</button>
            </div>
            <div className="border border-gray-200 p-6 rounded-xl hover:border-[#F28C28] transition-colors cursor-pointer">
              <h3 className="font-bold text-lg text-gray-800">Audio Consultation</h3>
              <p className="text-gray-500 text-sm mt-2 mb-4">45 Min • Voice Only</p>
              <button className="w-full py-2 border border-[#F28C28] text-[#F28C28] rounded-lg font-medium hover:bg-orange-50 transition-colors">Select</button>
            </div>
          </div>
        </div>

        {/* Module 2: Booking Calendar UI */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-[#0B0B45]">Book a Session</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Generating 4 mock dates starting from today to show availability */}
            {[0, 1, 2, 3].map(offset => {
              const date = addDays(new Date(), offset);
              return (
                <div key={offset} className="border border-gray-200 rounded-xl p-4 text-center hover:border-[#F28C28] transition-colors cursor-pointer group">
                  <p className="font-bold text-[#0B0B45] mb-2">{format(date, 'EEE, MMM d')}</p>
                  <div className="space-y-2">
                    <button className="w-full py-1.5 text-sm bg-orange-50 text-[#F28C28] rounded font-medium hover:bg-[#F28C28] hover:text-white transition-colors">09:00 AM</button>
                    <button className="w-full py-1.5 text-sm bg-orange-50 text-[#F28C28] rounded font-medium hover:bg-[#F28C28] hover:text-white transition-colors">11:00 AM</button>
                    <button className="w-full py-1.5 text-sm bg-gray-100 text-gray-400 rounded font-medium cursor-not-allowed">02:00 PM (Full)</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}