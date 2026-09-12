import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Sidebar from '../../components/common/Sidebar';
import UpgradePrompt from '../../components/common/UpgradePrompt';
import axiosInstance from '../../api/axiosInstance';

export default function Notes() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [templateType, setTemplateType] = useState('soap');
  const [noteType, setNoteType] = useState('private');
  const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [dap, setDap] = useState({ data: '', assessment: '', plan: '' });
  const [freeform, setFreeform] = useState('');
  const [status, setStatus] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: freeform,
    onUpdate: ({ editor: currentEditor }) => setFreeform(currentEditor.getHTML())
  });

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await axiosInstance.get('/clients');
        setClients(response.data);
        if (response.data[0]) setClientId(response.data[0]._id);
      } catch (error) {
        setStatus(error.response?.data?.message || 'Unable to load clients.');
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    if (templateType === 'freeform' && editor && editor.getHTML() !== freeform) {
      editor.commands.setContent(freeform || '');
    }
  }, [editor, freeform, templateType]);

  const handleSave = async (isLocked) => {
    if (!clientId) {
      setStatus('Select a client before saving.');
      return;
    }

    try {
      await axiosInstance.post('/notes', {
        clientId,
        templateType,
        type: noteType,
        soap,
        dap,
        content: freeform,
        isLocked
      });
      setStatus(isLocked ? 'Note locked and finalized.' : 'Draft saved.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to save note.');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-[#0B0B45]">Clinical Documentation</h2>
          <p className="text-gray-500 mt-1">Write private and shared notes. Client-facing routes only receive shared notes.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl">
          <div className="mb-6 flex flex-wrap justify-between gap-4 border-b pb-4">
            <div>
              <label className="text-sm font-bold text-gray-700">Select Client</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 block w-64 border-gray-200 rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-[#F28C28]">
                <option value="">Select a client</option>
                {clients.map((client) => <option key={client._id} value={client._id}>{client.name}</option>)}
              </select>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <label className="text-sm font-bold text-gray-700 mr-2">Visibility</label>
                <select value={noteType} onChange={(e) => setNoteType(e.target.value)} className="border-gray-200 rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-[#F28C28]">
                  <option value="private">Private</option>
                  <option value="shared">Shared</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mr-2">Template</label>
                <select value={templateType} onChange={(e) => setTemplateType(e.target.value)} className="border-gray-200 rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-[#F28C28]">
                  <option value="soap">SOAP</option>
                  <option value="dap">DAP</option>
                  <option value="freeform">Freeform</option>
                </select>
              </div>
            </div>
          </div>

          {templateType === 'soap' && (
            <div className="space-y-6">
              <div>
                <label className="font-bold text-[#0B0B45]">Subjective (S)</label>
                <textarea value={soap.subjective} onChange={(e) => setSoap({ ...soap, subjective: e.target.value })} rows="3" className="mt-2 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50" />
              </div>
              <div>
                <label className="font-bold text-[#0B0B45]">Objective (O)</label>
                <textarea value={soap.objective} onChange={(e) => setSoap({ ...soap, objective: e.target.value })} rows="3" className="mt-2 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50" />
              </div>
              <div>
                <label className="font-bold text-[#0B0B45]">Assessment (A)</label>
                <textarea value={soap.assessment} onChange={(e) => setSoap({ ...soap, assessment: e.target.value })} rows="3" className="mt-2 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50" />
              </div>
              <div>
                <label className="font-bold text-[#0B0B45]">Plan (P)</label>
                <textarea value={soap.plan} onChange={(e) => setSoap({ ...soap, plan: e.target.value })} rows="3" className="mt-2 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50" />
              </div>
            </div>
          )}

          {templateType === 'dap' && (
            <div className="space-y-6">
              <div>
                <label className="font-bold text-[#0B0B45]">Data</label>
                <textarea value={dap.data} onChange={(e) => setDap({ ...dap, data: e.target.value })} rows="3" className="mt-2 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50" />
              </div>
              <div>
                <label className="font-bold text-[#0B0B45]">Assessment</label>
                <textarea value={dap.assessment} onChange={(e) => setDap({ ...dap, assessment: e.target.value })} rows="3" className="mt-2 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50" />
              </div>
              <div>
                <label className="font-bold text-[#0B0B45]">Plan</label>
                <textarea value={dap.plan} onChange={(e) => setDap({ ...dap, plan: e.target.value })} rows="3" className="mt-2 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#F28C28] bg-gray-50" />
              </div>
            </div>
          )}

          {templateType === 'freeform' && (
            <div>
              <label className="font-bold text-[#0B0B45]">Freeform note</label>
              <div className="mt-2 overflow-hidden rounded-lg border bg-gray-50 focus-within:ring-2 focus-within:ring-[#F28C28]">
                <div className="flex gap-2 border-b bg-white p-2">
                  <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className="rounded border px-3 py-1 font-bold">B</button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className="rounded border px-3 py-1 italic">I</button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className="rounded border px-3 py-1">List</button>
                </div>
                <EditorContent editor={editor} className="min-h-48 p-3" />
              </div>
            </div>
          )}

          <UpgradePrompt featureKey="note-template-type" currentTier="starter" />

          <div className="mt-8 flex gap-4 border-t pt-6">
            <button onClick={() => handleSave(false)} className="px-6 py-3 border-2 border-[#0B0B45] text-[#0B0B45] font-bold rounded-lg hover:bg-gray-50 transition-colors">
              Save as Draft
            </button>
            <button onClick={() => handleSave(true)} className="px-6 py-3 bg-[#0B0B45] text-white font-bold rounded-lg hover:bg-blue-900 transition-colors">
              🔒 Lock & Finalize Note
            </button>
          </div>
          {status && <p className="mt-4 text-sm font-medium text-[#0B0B45]">{status}</p>}
        </div>
      </main>
    </div>
  );
}