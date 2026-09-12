import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';

export default function Notes() {
  const [activeTab, setActiveTab] = useState('draft');
  const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '' });

  const handleSave = (isLocked) => {
    console.log("Saving Note:", { ...soap, isLocked });
    alert(isLocked ? 'Note locked and permanently saved.' : 'Draft saved.');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-[#0B0B45]">Clinical Notes</h2>
          <p className="text-gray-500 mt-1">Document your sessions using the SOAP format.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl">
          <div className="mb-6 flex justify-between items-center border-b pb-4">
            <div>
              <label className="text-sm font-bold text-gray-700">Select Client</label>
              <select className="mt-1 block w-64 border-gray-200 rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-[#F28C28]">
                <option>Rahul Verma</option>
                <option>Sneha Iyer</option>
              </select>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">Draft Mode</span>
          </div>

          <div className="space-y-6">
            <div>
              <label className="font-bold text-[#0B0B45]">Subjective (S)</label>
              <p className="text-xs text-gray-500 mb-2">Client's report of their feelings and experiences.</p>
              <textarea value={soap.subjective} onChange={e => setSoap({...soap, subjective: e.target.value})} rows="3" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50"></textarea>
            </div>
            <div>
              <label className="font-bold text-[#0B0B45]">Objective (O)</label>
              <p className="text-xs text-gray-500 mb-2">Observable facts, behavior, and physical symptoms.</p>
              <textarea value={soap.objective} onChange={e => setSoap({...soap, objective: e.target.value})} rows="3" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50"></textarea>
            </div>
            <div>
              <label className="font-bold text-[#0B0B45]">Assessment (A)</label>
              <p className="text-xs text-gray-500 mb-2">Clinical synthesis of subjective and objective data.</p>
              <textarea value={soap.assessment} onChange={e => setSoap({...soap, assessment: e.target.value})} rows="3" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50"></textarea>
            </div>
            <div>
              <label className="font-bold text-[#0B0B45]">Plan (P)</label>
              <p className="text-xs text-gray-500 mb-2">Next steps, homework, and future treatment goals.</p>
              <textarea value={soap.plan} onChange={e => setSoap({...soap, plan: e.target.value})} rows="3" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50"></textarea>
            </div>
          </div>

          <div className="mt-8 flex gap-4 border-t pt-6">
            <button onClick={() => handleSave(false)} className="px-6 py-3 border-2 border-[#0B0B45] text-[#0B0B45] font-bold rounded-lg hover:bg-gray-50 transition-colors">
              Save as Draft
            </button>
            <button onClick={() => handleSave(true)} className="px-6 py-3 bg-[#0B0B45] text-white font-bold rounded-lg hover:bg-blue-900 transition-colors flex gap-2 items-center">
              🔒 Lock & Finalize Note
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}