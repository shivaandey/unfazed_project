import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

export default function ClientProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  // React Hook Form for Intake & Consent
  const { register, handleSubmit } = useForm({
    defaultValues: {
      demographics: { age: '', gender: '', occupation: '' },
      presentingConcern: '',
      medicalHistory: '',
      consentGiven: false
    }
  });

  const onSubmitIntake = (data) => {
    console.log("Intake Data Saved:", data);
    alert("Intake & Consent successfully recorded.");
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/clients" className="text-gray-400 hover:text-gray-700">← Back</Link>
          <h2 className="text-3xl font-bold text-[#0B0B45]">Client Profile</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6">
            <button onClick={() => setActiveTab('overview')} className={`py-4 px-6 font-bold text-sm ${activeTab === 'overview' ? 'text-[#F28C28] border-b-2 border-[#F28C28]' : 'text-gray-500'}`}>Overview</button>
            <button onClick={() => setActiveTab('intake')} className={`py-4 px-6 font-bold text-sm ${activeTab === 'intake' ? 'text-[#F28C28] border-b-2 border-[#F28C28]' : 'text-gray-500'}`}>Intake & Consent</button>
            <button onClick={() => setActiveTab('history')} className={`py-4 px-6 font-bold text-sm ${activeTab === 'history' ? 'text-[#F28C28] border-b-2 border-[#F28C28]' : 'text-gray-500'}`}>Session History</button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-bold text-[#0B0B45] mb-2">Rahul Verma</h3>
                <p className="text-gray-500 mb-6">rahul@example.com</p>
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-4 border rounded-xl bg-gray-50"><p className="text-sm text-gray-500">Status</p><p className="font-bold">Active</p></div>
                  <div className="p-4 border rounded-xl bg-gray-50"><p className="text-sm text-gray-500">Total Sessions</p><p className="font-bold">4</p></div>
                  <div className="p-4 border rounded-xl bg-gray-50"><p className="text-sm text-gray-500">Outstanding Balance</p><p className="font-bold">₹0</p></div>
                </div>
              </div>
            )}

            {activeTab === 'intake' && (
              <form onSubmit={handleSubmit(onSubmitIntake)} className="max-w-2xl space-y-6">
                <div>
                  <h4 className="font-bold text-[#0B0B45] mb-3">Demographics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input {...register("demographics.age")} placeholder="Age" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F28C28] outline-none" />
                    <input {...register("demographics.gender")} placeholder="Gender" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F28C28] outline-none" />
                    <input {...register("demographics.occupation")} placeholder="Occupation" className="w-full px-4 py-2 border rounded-lg col-span-2 focus:ring-2 focus:ring-[#F28C28] outline-none" />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#0B0B45] mb-3">Clinical Context</h4>
                  <textarea {...register("presentingConcern")} placeholder="Presenting Concern" rows="3" className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-[#F28C28] outline-none"></textarea>
                  <textarea {...register("medicalHistory")} placeholder="Medical History" rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F28C28] outline-none"></textarea>
                </div>

                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                  <h4 className="font-bold text-[#F28C28] mb-2">Digital Consent</h4>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" {...register("consentGiven")} className="mt-1 w-4 h-4 text-[#F28C28]" />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      I consent to receive psychotherapy services. I understand that the platform ensures confidentiality, except in circumstances involving imminent risk of harm.
                    </span>
                  </label>
                </div>

                <button type="submit" className="px-8 py-3 bg-[#0B0B45] text-white font-bold rounded-lg hover:bg-blue-900 transition-colors">
                  Save Intake Record
                </button>
              </form>
            )}

            {activeTab === 'history' && (
              <div className="text-center py-12 text-gray-500">
                <p>No past sessions found. Once a session is completed, it will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}