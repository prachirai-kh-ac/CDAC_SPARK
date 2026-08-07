import React, { useState, useEffect } from 'react';
import { 
  Database, List, FileText, Upload, PlusCircle, Search, 
  Filter, MoreVertical, Edit2, Trash2, Copy, Eye, ArrowLeft,
  Terminal, Coffee, Network, LayoutTemplate, Code2, Server, BrainCircuit, Brain
} from 'lucide-react';
import api from '../../services/api';


export default function QuestionBank() {
  const [stage, setStage] = useState<'modules' | 'topics' | 'management'>('modules');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [uploadType, setUploadType] = useState<'none'|'csv'|'json'>('none');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showGlobalUploadMenu, setShowGlobalUploadMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchModules = async () => {
    try {
      const res = await api.get('/modules');
      const loaded = res.data.map((m: any) => ({
        id: m.moduleId,
        name: m.moduleName,
        code: m.moduleCode,
        topicCount: m.topicCount || 0,
        topics: [] // Topics are fetched lazily
      }));
      setModules(loaded);
    } catch (err) {
      console.error('Failed to load modules', err);
    }
  };

  const fetchTopics = async (moduleId: number) => {
    try {
      const res = await api.get(`/modules/${moduleId}/topics`);
      const topics = res.data.map((t: any) => ({
        id: t.topicId,
        name: t.topicName,
        qCount: t.questionCount || 0
      }));
      // Update the specific module's topics in state
      setModules(prev => prev.map(m => m.id === moduleId ? { ...m, topics } : m));
      // Update selected module if it's the one currently open
      setSelectedModule((prev: any) => prev && prev.id === moduleId ? { ...prev, topics } : prev);
    } catch (err) {
      console.error('Failed to load topics', err);
    }
  };

  const fetchQuestions = async (topicId: number) => {
    try {
      const res = await api.post('/questions/search', { topicId });
      const loaded = res.data.map((q: any) => ({
        id: 'Q-' + q.questionId,
        questionId: q.questionId,
        preview: q.questionText.length > 50 ? q.questionText.substring(0, 50) + '...' : q.questionText,
        difficulty: q.difficulty || 'Medium',
        dateAdded: 'N/A',
        uses: '-',
        accuracy: null,
        fullQuestion: q
      }));
      setQuestions(loaded);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load questions', err);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const endpoint = uploadType === 'csv' ? '/questions/upload-csv' : '/questions/upload-json';
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5054/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok && data.success !== false) {
        setUploadMessage(data.message || 'File uploaded successfully!');
        setTimeout(() => {
          setUploadType('none');
          setSelectedFile(null);
          setUploadMessage(null);
          if (selectedTopic) {
            fetchQuestions(selectedTopic.id);
          }
          fetchModules();
        }, 2000);
      } else {
        setUploadMessage(data?.message || 'Upload failed. Please check the file format.');
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      setUploadMessage(err.message || 'Failed to upload file. Please check your network connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const getModuleStyle = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('c/c++')) return { icon: Terminal, bg: 'bg-blue-50', text: 'text-blue-600', border: 'hover:border-blue-400' }
    if (n.includes('dbt') || n.includes('sql')) return { icon: Database, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'hover:border-emerald-400' }
    if (n.includes('core java')) return { icon: Coffee, bg: 'bg-orange-50', text: 'text-orange-600', border: 'hover:border-orange-400' }
    if (n.includes('dsa')) return { icon: Network, bg: 'bg-purple-50', text: 'text-purple-600', border: 'hover:border-purple-400' }
    if (n.includes('mern')) return { icon: LayoutTemplate, bg: 'bg-teal-50', text: 'text-teal-600', border: 'hover:border-teal-400' }
    if (n.includes('advanced java')) return { icon: Coffee, bg: 'bg-red-50', text: 'text-red-600', border: 'hover:border-red-400' }
    if (n.includes('.net')) return { icon: Code2, bg: 'bg-sky-50', text: 'text-sky-600', border: 'hover:border-sky-400' }
    if (n.includes('cossdm')) return { icon: Server, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'hover:border-indigo-400' }
    if (n.includes('aptitude')) return { icon: BrainCircuit, bg: 'bg-pink-50', text: 'text-pink-600', border: 'hover:border-pink-400' }
    return { icon: Brain, bg: 'bg-slate-50', text: 'text-slate-600', border: 'hover:border-slate-400' }
  }


  const filteredQuestions = questions.filter(q => {
    const matchSearch = q.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        q.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterDifficulty === 'All' || q.difficulty.toUpperCase() === filterDifficulty.toUpperCase();
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 flex-shrink-0">
            <Database className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Question Bank</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Manage modules, topics, and bulk question repositories.</p>
          </div>
        </div>
      </div>

      {/* STAGE 1: MODULES */}
      {stage === 'modules' && (
        <div className="animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Available Modules</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowGlobalUploadMenu(!showGlobalUploadMenu)}
                  className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm"
                >
                  <Upload className="w-4 h-4" /> Import Questions
                </button>
                {showGlobalUploadMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-10 animate-fade-in">
                    <button 
                      onClick={() => { setUploadType('csv'); setShowGlobalUploadMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> Import CSV
                    </button>
                    <button 
                      onClick={() => { setUploadType('json'); setShowGlobalUploadMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                    >
                      <Code2 className="w-4 h-4" /> Import JSON
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowAddModuleModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm text-sm"
              >
                <PlusCircle className="w-4 h-4" /> Add Module
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 font-medium">No modules found. Please add a module to get started.</div>
            ) : (
              modules.map((m) => {
                const style = getModuleStyle(m.name);
                const Icon = style.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModule(m);
                      setStage('topics');
                      fetchTopics(m.id);
                    }}
                    className={`relative bg-white p-6 rounded-3xl shadow-sm border border-slate-200 ${style.border} hover:shadow-md hover:-translate-y-1 transition-all text-left flex flex-col items-start gap-4 group`}
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if(confirm('Are you sure you want to delete this module?')) {
                            try {
                              await api.delete(`/modules/${m.id}`);
                              fetchModules();
                            } catch(err) { console.error(err); }
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm bg-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`w-14 h-14 ${style.bg} ${style.text} rounded-2xl flex items-center justify-center shadow-sm`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">{m.name}</h3>
                      <p className="text-slate-500 text-sm mt-1 font-medium">{m.topicCount || 0} Topics Available</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* STAGE 2: TOPICS */}
      {stage === 'topics' && (
        <div className="animate-slide-up">
          <button onClick={() => setStage('modules')} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Modules
          </button>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">{selectedModule?.name} — Topics</h2>
                <p className="text-slate-500 font-medium text-lg">Select a topic to manage its question repository.</p>
              </div>
              <button 
                onClick={() => setShowAddTopicModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm text-sm"
              >
                <PlusCircle className="w-4 h-4" /> Add Topic
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(!selectedModule?.topics || selectedModule.topics.length === 0) ? (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium">No topics found. Please add a topic.</div>
              ) : (
                selectedModule.topics.map((topic: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedTopic(topic);
                      setStage('management');
                      fetchQuestions(topic.id);
                    }}
                    className="relative flex flex-col gap-2 p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm text-left transition-all group"
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if(confirm('Are you sure you want to delete this topic?')) {
                            try {
                              await api.delete(`/topics/${topic.id}`);
                              fetchTopics(selectedModule.id);
                            } catch(err) { console.error(err); }
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm bg-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white group-hover:text-indigo-600 text-slate-400 transition-colors">
                        <List className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700 text-lg group-hover:text-indigo-900">{topic.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-700 px-3 py-1 rounded-md self-start transition-colors">
                      {topic.qCount || 0} Questions
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: QUESTION MANAGEMENT */}
      {stage === 'management' && (
        <div className="animate-slide-up space-y-6">
          <button onClick={() => setStage('topics')} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Topics
          </button>

          {/* Topic Info Header */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
            <div>
              <p className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-1">{selectedModule?.name}</p>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{selectedTopic?.name}</h2>
              <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-slate-600 font-semibold">
                <span className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg"><Database className="w-4 h-4 text-slate-400"/> {selectedTopic?.qCount} Total Questions</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <PlusCircle className="w-5 h-5" /> Add Manually
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => setUploadType('csv')}
                  className="flex-1 sm:flex-none items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-3 rounded-xl font-bold hover:bg-emerald-100 transition-colors flex"
                >
                  <Upload className="w-5 h-5" /> CSV
                </button>
                <button 
                  onClick={() => setUploadType('json')}
                  className="flex-1 sm:flex-none items-center justify-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 px-5 py-3 rounded-xl font-bold hover:bg-purple-100 transition-colors flex"
                >
                  <Upload className="w-5 h-5" /> JSON
                </button>
              </div>
            </div>
          </div>

          {/* Table Controls */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search questions by ID or content..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
                />
              </div>
              <select 
                value={filterDifficulty}
                onChange={(e) => { setFilterDifficulty(e.target.value as any); setCurrentPage(1); }}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors cursor-pointer outline-none focus:border-indigo-500"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Questions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500 uppercase font-black text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-5">Q-ID</th>
                    <th className="px-6 py-5 w-1/3">Question Preview</th>
                    <th className="px-6 py-5">Difficulty Level</th>
                    <th className="px-6 py-5">Mock Test Analytics</th>
                    <th className="px-6 py-5">Added On</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                        No questions available. Please add some manually or adjust your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedQuestions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{q.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-slate-800 font-semibold truncate max-w-sm">{q.preview}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border ${
                            q.difficulty?.toUpperCase() === 'EASY' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            q.difficulty?.toUpperCase() === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-4">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Appeared</p>
                              <p className="text-sm font-bold text-slate-500">- No Data</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Accuracy</p>
                              <p className="text-sm font-bold text-slate-500">- No Data</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-500">{q.dateAdded || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => { setSelectedQuestion(q); setShowViewModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Preview"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => { setSelectedQuestion(q); setEditForm({...q.fullQuestion}); setShowEditModal(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={async () => {
                               if(confirm('Are you sure you want to delete this question?')) {
                                  try {
                                     await api.delete(`/questions/${q.questionId}`);
                                     fetchQuestions(selectedTopic.id);
                                  } catch(e) { console.error(e); }
                               }
                            }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-5 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="font-semibold text-sm text-slate-500">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredQuestions.length)} to {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} entries
              </span>
              <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50">Prev</button>
                <button className="px-3 py-1.5 text-sm font-bold bg-indigo-50 text-indigo-700 rounded-md">{currentPage} / {totalPages || 1}</button>
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Manually Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add New Question</h3>
                <p className="text-slate-500 font-medium text-sm mt-1">{selectedModule?.name} &rsaquo; {selectedTopic?.name}</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">X</button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Question Text</label>
                <textarea className="w-full border-2 border-slate-200 rounded-xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all resize-none shadow-sm" rows={3} placeholder="Enter your question here..."></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold text-slate-800 mb-2">Option A</label><input type="text" placeholder="First option" className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" /></div>
                <div><label className="block text-sm font-bold text-slate-800 mb-2">Option B</label><input type="text" placeholder="Second option" className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" /></div>
                <div><label className="block text-sm font-bold text-slate-800 mb-2">Option C</label><input type="text" placeholder="Third option" className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" /></div>
                <div><label className="block text-sm font-bold text-slate-800 mb-2">Option D</label><input type="text" placeholder="Fourth option" className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Correct Answer</label>
                  <select className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-700 bg-white transition-all shadow-sm cursor-pointer">
                    <option>Option A</option><option>Option B</option><option>Option C</option><option>Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Difficulty (Internal)</label>
                  <select className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-700 bg-white transition-all shadow-sm cursor-pointer">
                    <option value="easy">Easy (6/20 ratio)</option>
                    <option value="medium">Medium (8/20 ratio)</option>
                    <option value="hard">Hard (6/20 ratio)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Explanation (Optional)</label>
                <textarea className="w-full border-2 border-slate-200 rounded-xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all resize-none shadow-sm" rows={2} placeholder="Explain why the correct answer is right..."></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-3xl">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95">Save Question to Bank</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload CSV/JSON Modal */}
      {uploadType !== 'none' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col p-8 md:p-10 text-center relative">
             <button onClick={() => setUploadType('none')} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold transition-colors">X</button>
             
             <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border ${
                uploadType === 'csv' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-purple-50 text-purple-600 border-purple-100'
             }`}>
               <Upload className="w-10 h-10" />
             </div>
             
             <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Upload {uploadType.toUpperCase()} File</h3>
             <p className="text-slate-500 font-medium mb-8">
               Drag and drop your structured {uploadType.toUpperCase()} file containing questions 
               {selectedTopic ? <span> for <strong>{selectedTopic.name}</strong></span> : <span> to import into the Question Bank</span>}.
             </p>
             
             <label className="border-2 border-dashed border-slate-300 rounded-2xl p-12 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors cursor-pointer mb-2 group block relative overflow-hidden">
                <input 
                  type="file" 
                  accept={uploadType === 'csv' ? '.csv' : '.json'} 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e) => {
                    if(e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                      setUploadMessage(null);
                    }
                  }}
                />
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-700 font-bold">{selectedFile ? selectedFile.name : 'Click to browse or drag file here'}</p>
                <p className="text-slate-400 text-sm mt-1">Supports .{uploadType} files up to 10MB</p>
             </label>

             {uploadMessage && (
               <div className={`mb-4 text-sm font-bold p-3 rounded-lg ${uploadMessage.includes('Success') || uploadMessage.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                 {uploadMessage}
               </div>
             )}

             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 mt-6">
               <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-2">
                 <FileText className="w-4 h-4"/> Download Template
               </a>
               <button 
                 onClick={handleFileUpload} 
                 disabled={!selectedFile || isUploading}
                 className={`px-6 py-2.5 font-bold text-white rounded-lg shadow-sm transition-colors ${!selectedFile || isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900'}`}
               >
                 {isUploading ? 'Uploading...' : 'Start Import'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModuleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col p-6 relative">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Add New Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Module Name</label>
                <input 
                  type="text" 
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder="e.g., Python Basics" 
                  className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => {
                  setShowAddModuleModal(false);
                  setNewModuleName('');
                }} 
                className="px-5 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if(newModuleName.trim()) {
                    try {
                      await api.post('/modules', { 
                        moduleName: newModuleName.trim(), 
                        moduleCode: 'M' + Date.now(),
                        description: 'Created by teacher'
                      });
                      fetchModules();
                      setNewModuleName('');
                      setShowAddModuleModal(false);
                    } catch (err) {
                      console.error('Failed to create module', err);
                    }
                  }
                }} 
                className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-95"
              >
                Create Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showAddTopicModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col p-6 relative">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Add New Topic</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Topic Name</label>
                <input 
                  type="text" 
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g., Data Types" 
                  className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => {
                  setShowAddTopicModal(false);
                  setNewTopicName('');
                }} 
                className="px-5 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if(newTopicName.trim() && selectedModule) {
                    try {
                      await api.post('/topics', { 
                        moduleId: selectedModule.id, 
                        topicName: newTopicName.trim(),
                        description: 'Created by teacher'
                      });
                      fetchTopics(selectedModule.id);
                      setNewTopicName('');
                      setShowAddTopicModal(false);
                    } catch (err) {
                      console.error('Failed to create topic', err);
                    }
                  }
                }} 
                className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-95"
              >
                Create Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Question Modal */}
      {showViewModal && selectedQuestion && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col p-6 relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => setShowViewModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold transition-colors">X</button>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2"><Eye className="text-indigo-500"/> Preview Question</h3>
             <div className="bg-slate-50 p-6 rounded-2xl mb-6">
                <p className="text-lg font-bold text-slate-800 mb-4">{selectedQuestion.fullQuestion.questionText}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border-2 font-semibold ${[selectedQuestion.fullQuestion.optionA, 'A', 'Option A'].includes(selectedQuestion.fullQuestion.correctAnswer) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-600'}`}>A. {selectedQuestion.fullQuestion.optionA}</div>
                  <div className={`p-4 rounded-xl border-2 font-semibold ${[selectedQuestion.fullQuestion.optionB, 'B', 'Option B'].includes(selectedQuestion.fullQuestion.correctAnswer) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-600'}`}>B. {selectedQuestion.fullQuestion.optionB}</div>
                  <div className={`p-4 rounded-xl border-2 font-semibold ${[selectedQuestion.fullQuestion.optionC, 'C', 'Option C'].includes(selectedQuestion.fullQuestion.correctAnswer) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-600'}`}>C. {selectedQuestion.fullQuestion.optionC}</div>
                  <div className={`p-4 rounded-xl border-2 font-semibold ${[selectedQuestion.fullQuestion.optionD, 'D', 'Option D'].includes(selectedQuestion.fullQuestion.correctAnswer) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-600'}`}>D. {selectedQuestion.fullQuestion.optionD}</div>
                </div>
             </div>
             {selectedQuestion.fullQuestion.explanation && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl">
                  <p className="text-xs font-black uppercase text-indigo-500 mb-1">Explanation</p>
                  <p className="text-slate-700 font-medium text-sm">{selectedQuestion.fullQuestion.explanation}</p>
                </div>
             )}
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditModal && selectedQuestion && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
             <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2"><Edit2 className="text-emerald-500"/> Edit Question</h3>
                <p className="text-slate-500 font-medium text-sm mt-1">{selectedQuestion.id}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">X</button>
            </div>
             <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Question Text</label>
                  <textarea value={editForm?.questionText || ''} onChange={e => setEditForm({...editForm, questionText: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all resize-none shadow-sm" rows={2}></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Option A</label>
                    <input type="text" value={editForm?.optionA || ''} onChange={e => setEditForm({...editForm, optionA: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Option B</label>
                    <input type="text" value={editForm?.optionB || ''} onChange={e => setEditForm({...editForm, optionB: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Option C</label>
                    <input type="text" value={editForm?.optionC || ''} onChange={e => setEditForm({...editForm, optionC: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Option D</label>
                    <input type="text" value={editForm?.optionD || ''} onChange={e => setEditForm({...editForm, optionD: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Correct Answer</label>
                    <select value={editForm?.correctAnswer || ''} onChange={e => setEditForm({...editForm, correctAnswer: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-700 bg-white transition-all shadow-sm cursor-pointer">
                      <option value="Option A">Option A</option>
                      <option value="Option B">Option B</option>
                      <option value="Option C">Option C</option>
                      <option value="Option D">Option D</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Explanation (Optional)</label>
                  <textarea value={editForm?.explanation || ''} onChange={e => setEditForm({...editForm, explanation: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium transition-all resize-none shadow-sm" rows={2}></textarea>
                </div>
             </div>
             <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <button onClick={() => setShowEditModal(false)} className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={async () => { 
                   try {
                     await api.put(`/questions/${selectedQuestion.questionId}`, editForm);
                     setShowEditModal(false); 
                     fetchQuestions(selectedTopic?.id); 
                   } catch(err) {
                     console.error(err);
                     alert('Failed to update question');
                   }
                }} className="px-6 py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95">Update Question</button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
