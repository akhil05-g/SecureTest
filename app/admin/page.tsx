'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Upload, BookOpen, CheckCircle, AlertCircle, FileText, Clock, Key } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string; // JSON string
  correctIndex: number;
}

interface Section {
  id: string;
  name: string;
  questions: Question[];
}

interface ExamConfig {
  id: string;
  title: string;
  duration: number;
  passkey: string;
  isActive: boolean;
  sections: Section[];
}

const DEFAULT_JSON_TEMPLATE = JSON.stringify(
  {
    title: 'Software Engineer Assessment 2025',
    duration: 30,
    passkey: 'SECURE2025',
    sections: [
      {
        name: 'Data Structures & Algorithms',
        questions: [
          {
            question: 'Which data structure operates on a First-In, First-Out (FIFO) policy?',
            options: ['Stack', 'Queue', 'Binary Tree', 'Heap'],
            correctIndex: 1,
          },
          {
            question: 'What is the worst-case time complexity of QuickSort?',
            options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(1)'],
            correctIndex: 2,
          },
        ],
      },
      {
        name: 'System Architecture & Web APIs',
        questions: [
          {
            question: 'In HTTP, which status code represents "404 Not Found"?',
            options: ['200 OK', '401 Unauthorized', '404 Client Error', '500 Server Error'],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
  null,
  2
);

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'view'>('upload');
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentExam, setCurrentExam] = useState<ExamConfig | null>(null);

  const fetchCurrentExam = async () => {
    try {
      const res = await fetch('/api/admin/exam');
      if (res.ok) {
        const data = await res.json();
        setCurrentExam(data);
      } else {
        setCurrentExam(null);
      }
    } catch {
      setCurrentExam(null);
    }
  };

  useEffect(() => {
    fetchCurrentExam();
  }, []);

  const handleUploadExam = async () => {
    setFeedback(null);
    let parsedBody;

    try {
      parsedBody = JSON.parse(jsonInput);
    } catch {
      setFeedback({ type: 'error', message: 'Invalid JSON syntax. Please check formatting.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload exam config.');
      }

      setFeedback({
        type: 'success',
        message: `Successfully uploaded & activated "${data.title}"! Sections: ${data.sectionCount}, Total Questions: ${data.questionCount}, Passkey: ${data.passkey}`,
      });

      fetchCurrentExam();
      setActiveTab('view');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFeedback({ type: 'error', message: err.message });
      } else {
        setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> SecureTest Admin Portal
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Exam Question Management</h1>
          <p className="text-sm text-slate-400 mt-1">Configure active assessment sections, passkeys, and question banks.</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'upload' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" /> Upload New Exam
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'view' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> View Active Exam
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Upload Mode */}
      {activeTab === 'upload' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" /> Paste Exam Configuration (JSON)
            </h2>
            <button
              onClick={() => setJsonInput(DEFAULT_JSON_TEMPLATE)}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              Reset Sample Template
            </button>
          </div>

          <textarea
            rows={18}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors leading-relaxed"
            placeholder="Paste exam JSON structure here..."
          />

          <button
            onClick={handleUploadExam}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Uploading & Activating Exam...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload & Activate Exam</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* View Active Exam Mode */}
      {activeTab === 'view' && (
        <div className="space-y-6">
          {currentExam ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">{currentExam.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">Active Status: <span className="text-emerald-400 font-bold">● ONLINE</span></p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" /> {currentExam.duration} mins
                  </div>
                  <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" /> Passkey: <code className="text-cyan-400 font-bold">{currentExam.passkey}</code>
                  </div>
                </div>
              </div>

              {/* Sections & Questions List */}
              <div className="space-y-6">
                {currentExam.sections.map((sec, secIdx) => (
                  <div key={sec.id} className="border border-slate-800 bg-slate-950/60 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-wider font-bold border-b border-slate-800 pb-2">
                      Section {secIdx + 1}: {sec.name}
                    </h3>

                    <div className="space-y-4">
                      {sec.questions.map((q, qIdx) => {
                        let opts: string[] = [];
                        try {
                          opts = JSON.parse(q.options);
                        } catch {
                          opts = [];
                        }

                        return (
                          <div key={q.id} className="bg-slate-900 border border-slate-800/80 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium text-slate-200">
                              <span className="text-cyan-400 font-mono">Q{qIdx + 1}.</span> {q.question}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                              {opts.map((opt, oIdx) => {
                                const isCorrect = oIdx === q.correctIndex;
                                return (
                                  <div
                                    key={oIdx}
                                    className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                                      isCorrect
                                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 font-bold'
                                        : 'bg-slate-950 border-slate-800 text-slate-400'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              No active exam configuration found. Please upload an exam configuration using the &quot;Upload New Exam&quot; tab.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
