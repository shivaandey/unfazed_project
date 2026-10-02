import { useEffect, useRef, useState } from 'react';
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
  const [blockedFeature, setBlockedFeature] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState('');
  const [draftFilter, setDraftFilter] = useState('all');
  const [draftSearch, setDraftSearch] = useState('');
  const debounceRef = useRef(null);
  const lastAutoSaveRef = useRef('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: freeform,
    onUpdate: ({ editor: currentEditor }) => setFreeform(currentEditor.getHTML())
  });

  const hydrateForm = (note) => {
    if (!note) {
      setSoap({ subjective: '', objective: '', assessment: '', plan: '' });
      setDap({ data: '', assessment: '', plan: '' });
      setFreeform('');
      if (editor) editor.commands.setContent('');
      setSelectedDraftId('');
      lastAutoSaveRef.current = '';
      return;
    }

    setTemplateType(note.templateType || 'soap');
    setNoteType(note.type || 'private');
    setSoap(note.soap || { subjective: '', objective: '', assessment: '', plan: '' });
    setDap(note.dap || { data: '', assessment: '', plan: '' });
    setFreeform(note.content || '');

    if (editor) {
      editor.commands.setContent(note.content || '');
    }

    lastAutoSaveRef.current = JSON.stringify({
      clientId,
      templateType: note.templateType || 'soap',
      type: note.type || 'private',
      soap: note.soap || { subjective: '', objective: '', assessment: '', plan: '' },
      dap: note.dap || { data: '', assessment: '', plan: '' },
      content: note.content || ''
    });
  };

  const loadSavedNotes = async (selectedClientId) => {
    setSelectedDraftId('');
    hydrateForm(null);

    if (!selectedClientId) {
      setSavedNotes([]);
      return;
    }

    try {
      const response = await axiosInstance.get(`/notes/client/${selectedClientId}`);
      const notes = Array.isArray(response.data) ? response.data : [];
      const activeDrafts = notes.filter((note) => !note.isLocked);
      setSavedNotes(activeDrafts);

      if (activeDrafts.length > 0) {
        const latestDraft = activeDrafts[0];
        setSelectedDraftId(latestDraft._id);
        hydrateForm(latestDraft);
      }
    } catch (error) {
      console.error('Failed to load saved notes', error);
    }
  };

  const hasMeaningfulContent = () => {
    const soapFilled = Object.values(soap).some((value) => String(value).trim());
    const dapFilled = Object.values(dap).some((value) => String(value).trim());
    return soapFilled || dapFilled || String(freeform).trim();
  };

  const persistNote = async (isLocked = false, silent = false) => {
    if (!clientId) {
      if (!silent) setStatus('Select a client before saving.');
      return;
    }

    const payload = {
      clientId,
      templateType,
      type: noteType,
      soap,
      dap,
      content: freeform,
      isLocked,
    };

    try {
      let response;
      if (selectedDraftId) {
        response = await axiosInstance.put(`/notes/${selectedDraftId}`, payload);
      } else {
        response = await axiosInstance.post('/notes', payload);
        setSelectedDraftId(response.data?._id || '');
      }

      const savedNote = response?.data || null;
      if (savedNote?._id) {
        setSelectedDraftId(savedNote._id);
      }

      await loadSavedNotes(clientId);
      if (!silent) {
        setStatus(isLocked ? 'Note locked and finalized.' : 'Draft saved.');
      }
      setBlockedFeature('');
      lastAutoSaveRef.current = JSON.stringify(payload);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.upgradeRequired) setBlockedFeature(error.response.data.featureKey);
      if (!silent) {
        setStatus(error.response?.data?.message || 'Unable to save note.');
      }
    }
  };

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await axiosInstance.get('/clients');
        setClients(response.data);
        if (response.data[0]) {
          setClientId(response.data[0]._id);
        }
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

  useEffect(() => {
    if (!clientId) return;
    loadSavedNotes(clientId);
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !hasMeaningfulContent()) return;

    const payload = {
      clientId,
      templateType,
      type: noteType,
      soap,
      dap,
      content: freeform,
      isLocked: false,
    };

    const signature = JSON.stringify(payload);
    if (lastAutoSaveRef.current === signature) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persistNote(false, true);
    }, 900);

    return () => clearTimeout(debounceRef.current);
  }, [clientId, templateType, noteType, soap, dap, freeform]);

  const filteredDrafts = savedNotes.filter((note) => {
    const matchesType = draftFilter === 'all' || note.type === draftFilter;
    const searchText = draftSearch.trim().toLowerCase();
    const matchesSearch = !searchText || `${new Date(note.updatedAt).toLocaleString()} ${note.type || ''} ${note.templateType || ''}`.toLowerCase().includes(searchText);
    return matchesType && matchesSearch;
  });

  const handleSelectDraft = (note) => {
    setSelectedDraftId(note._id);
    setTemplateType(note.templateType || 'soap');
    setNoteType(note.type || 'private');
    hydrateForm(note);
  };

  const handleClientChange = (nextClientId) => {
    setSelectedDraftId('');
    setStatus('');
    setDraftFilter('all');
    setDraftSearch('');
    setSavedNotes([]);
    setClientId(nextClientId);
    hydrateForm(null);
    lastAutoSaveRef.current = '';
  };

  const handleSave = async (isLocked) => {
    if (selectedDraftId && !savedNotes.some((note) => note._id === selectedDraftId)) {
      setSelectedDraftId('');
      lastAutoSaveRef.current = '';
    }

    await persistNote(isLocked, false);
  };

  const handleDeleteDraft = async (noteId) => {
    if (!noteId || !window.confirm('Delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      await axiosInstance.delete(`/notes/${noteId}`);
      if (selectedDraftId === noteId) {
        setSelectedDraftId('');
        hydrateForm(null);
      }
      await loadSavedNotes(clientId);
      setStatus('Draft deleted.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to delete draft.');
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
              <select value={clientId} onChange={(e) => handleClientChange(e.target.value)} className="mt-1 block w-64 border-gray-200 rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-[#F28C28]">
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

          {savedNotes.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-bold text-[#0B0B45]">Saved drafts</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    value={draftSearch}
                    onChange={(e) => setDraftSearch(e.target.value)}
                    placeholder="Search by date or type"
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F28C28]"
                  />
                  <select
                    value={draftFilter}
                    onChange={(e) => setDraftFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F28C28]"
                  >
                    <option value="all">All notes</option>
                    <option value="private">Private</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredDrafts.length > 0 ? filteredDrafts.map((note) => (
                  <div key={note._id} className={`rounded-xl border p-3 transition-colors ${selectedDraftId === note._id ? 'border-[#F28C28] bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-[#F28C28]'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => handleSelectDraft(note)} className="flex-1 text-left">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-[#0B0B45]">{note.templateType?.toUpperCase() || 'NOTE'} · {note.type || 'private'}</p>
                            <p className="text-xs text-gray-500">Updated {new Date(note.updatedAt).toLocaleString()}</p>
                          </div>
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-gray-600 border border-gray-200">
                            Draft
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(note._id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500">No drafts match this filter.</p>
                )}
              </div>
            </div>
          )}

          {blockedFeature && <UpgradePrompt featureKey={blockedFeature} />}

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