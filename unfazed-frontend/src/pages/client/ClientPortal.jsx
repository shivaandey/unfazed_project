import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function ClientPortal() {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API fetch for Module 1 until GET route is active
    setTimeout(() => {
      setTherapist({
        name: "Dr. Sharma",
        bio: "Specializing in cognitive behavioral therapy to help you navigate anxiety, stress, and life transitions with confidence.",
        specializations: ["Anxiety", "Depression", "CBT", "Trauma"],
        // UPDATE THIS IMAGE SRC: Provide a high-quality professional headshot of the therapist
        heroImageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop" 
      });
      setLoading(false);
    }, 800);
  }, [slug]);

  if (loading) return <div className="flex h-screen items-center justify-center text-blue-600 animate-pulse-soft font-medium text-lg">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center md:items-start gap-10 animate-slide-up">
          <img 
            src={therapist.heroImageUrl} 
            alt={therapist.name} 
            className="w-40 h-40 rounded-full object-cover shadow-xl border-4 border-white transform hover:scale-105 transition-transform duration-300"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{therapist.name}</h1>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">{therapist.bio}</p>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
              {therapist.specializations.map((spec, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-md">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book a Session</h2>
          <p className="text-gray-500 mb-8">Select a time that works for you.</p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
            View Availability
          </button>
        </div>
      </div>
    </div>
  );
}