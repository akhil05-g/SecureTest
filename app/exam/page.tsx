'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  User,
  Mail,
  Key,
  ArrowRight,
  AlertCircle,
  Camera,
  Mic,
  Maximize,
  Check,
  RefreshCw,
  Clock,
  Radio,
  AlertTriangle,
  Lock,
  Send,
  CheckCircle2,
  Laptop,
  Zap,
} from 'lucide-react';
import { ProctorDetector } from '@/lib/detectors/face-detector';
import { EventOrchestrator } from '@/lib/detectors/event-orchestrator';
import { ProctorEvent, EventType } from '@/lib/types';

interface Question {
  id: string;
  question: string;
  options: string; // JSON string array
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
  sections: Section[];
}

export default function StudentPortalPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [emailOrRoll, setEmailOrRoll] = useState('');
  const [passkey, setPasskey] = useState('');

  // Exam Config State
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);

  // API State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  // System Check States
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'pending' | 'checking' | 'success' | 'failed'>('pending');
  const [cameraMessage, setCameraMessage] = useState('Camera initialization pending');

  const [micStatus, setMicStatus] = useState<'pending' | 'checking' | 'success' | 'failed'>('pending');
  const [micLevel, setMicLevel] = useState(0);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Exam State
  const [timeLeftSec, setTimeLeftSec] = useState(1800);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [questionTimings, setQuestionTimings] = useState<Record<string, number>>({});

  const [showWarningOverlay, setShowWarningOverlay] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [violatingCount, setViolatingCount] = useState(0);

  const [finalScore, setFinalScore] = useState<{
    score: number;
    maxPossible: number;
    correctCount: number;
    totalQuestions: number;
    speedBonus: number;
    avgTimePerQuestion: number;
  } | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<ProctorDetector | null>(null);
  const orchestratorRef = useRef<EventOrchestrator | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const candidateIdRef = useRef<string | null>(null);
  const activeQuestionIdRef = useRef<string | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Mobile / Tablet Device Detection
  useEffect(() => {
    const mobilePattern = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i;
    const isMobileDevice = mobilePattern.test(navigator.userAgent) || window.innerWidth < 1024;
    setIsMobile(isMobileDevice);
  }, []);

  // Keep candidate ID ref updated
  useEffect(() => {
    candidateIdRef.current = candidateId;
  }, [candidateId]);

  // Keep question timing refs updated
  useEffect(() => {
    activeQuestionIdRef.current = activeQuestionId;
    questionStartTimeRef.current = questionStartTime;
  }, [activeQuestionId, questionStartTime]);

  // Record timing for currently active question
  const recordCurrentQuestionTime = useCallback(() => {
    const currentQId = activeQuestionIdRef.current;
    if (currentQId) {
      const elapsedSec = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
      setQuestionTimings((prev) => ({
        ...prev,
        [currentQId]: (prev[currentQId] || 0) + elapsedSec,
      }));
    }
  }, []);

  // Handle Passkey Login
  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formattedPasskey = passkey.trim().toUpperCase();

    if (!fullName.trim() || !emailOrRoll.trim() || !formattedPasskey) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const configRes = await fetch('/api/admin/exam');
      if (!configRes.ok) {
        throw new Error('No active exam configuration found. Please contact the administrator.');
      }

      const configData: ExamConfig = await configRes.json();

      if (formattedPasskey !== configData.passkey) {
        throw new Error(`Invalid Exam Passkey. Expected passkey format for "${configData.title}".`);
      }

      setExamConfig(configData);
      setTimeLeftSec(configData.duration * 60);

      // Set initial active question for timing tracking
      if (configData.sections[0]?.questions[0]?.id) {
        setActiveQuestionId(configData.sections[0].questions[0].id);
        setQuestionStartTime(Date.now());
      }

      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: emailOrRoll.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create candidate record.');
      }

      const data = await res.json();
      setCandidateId(data.id);
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during verification.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Hardware Checks Setup
  const initHardwareChecks = useCallback(async () => {
    setCameraStatus('checking');
    setMicStatus('checking');
    setCameraMessage('Requesting media access...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 15 },
        audio: true,
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      audioAnalyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let detectedAudioOnce = false;

      const checkAudio = () => {
        if (!audioAnalyserRef.current) return;
        audioAnalyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalizedLevel = Math.min(100, Math.round((average / 128) * 100));

        setMicLevel(normalizedLevel);

        if (normalizedLevel > 5) {
          detectedAudioOnce = true;
          setMicStatus('success');
        } else if (!detectedAudioOnce) {
          setMicStatus('checking');
        }

        animFrameRef.current = requestAnimationFrame(checkAudio);
      };

      checkAudio();

      setCameraMessage('Loading AI Face Calibration Model...');
      const detector = new ProctorDetector();
      await detector.init();
      detectorRef.current = detector;

      let faceCheckPassCount = 0;

      const runFaceCheck = async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const detections = await detector.detectFrame(videoRef.current);
          const persons = detections.filter(
            (d) => d.class === 'person' && d.score >= 0.4
          );

          if (persons.length === 1) {
            faceCheckPassCount++;
            setCameraMessage(`Face detected & centered (${faceCheckPassCount}/3 calibration frames)`);

            if (faceCheckPassCount >= 3) {
              setCameraStatus('success');
              setCameraMessage('Exactly 1 face verified and calibrated ✅');
              return;
            }
          } else if (persons.length === 0) {
            faceCheckPassCount = 0;
            setCameraStatus('failed');
            setCameraMessage('No face detected. Please face the camera directly.');
          } else {
            faceCheckPassCount = 0;
            setCameraStatus('failed');
            setCameraMessage('Multiple faces detected! Ensure you are alone.');
          }
        }
        setTimeout(runFaceCheck, 800);
      };

      runFaceCheck();
    } catch (err) {
      console.error('Hardware access error:', err);
      setCameraStatus('failed');
      setMicStatus('failed');
      setCameraMessage('Camera or Microphone access denied / unreadable.');
    }
  }, []);

  // Hardware cleanup
  useEffect(() => {
    if (step === 2) {
      initHardwareChecks();
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (detectorRef.current) {
        detectorRef.current.stopDetectionLoop();
      }
    };
  }, [step, initHardwareChecks]);

  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);

      if (step === 3 && !active) {
        setShowWarningOverlay(true);
        setWarningMessage('Fullscreen Required! You exited fullscreen mode. Please lock fullscreen to continue your assessment.');
        recordViolationEvent(EventType.FULLSCREEN_EXIT, 100, 8);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [step]);

  // Request Fullscreen
  const requestKioskFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setShowWarningOverlay(false);
      }
    } catch (err) {
      console.error('Fullscreen request error:', err);
    }
  };

  // Record Violation Event
  const recordViolationEvent = useCallback(async (eventType: string, confidence: number = 100, baseSeverity: number = 7) => {
    const cId = candidateIdRef.current;
    if (!cId) return;

    setViolatingCount((prev) => prev + 1);

    try {
      await fetch(`/api/candidates/${cId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          detectorConfidence: confidence,
          baseSeverity,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to report violation event:', err);
    }
  }, []);

  // Anti-Cheat Shortcuts & Window Integrity
  useEffect(() => {
    if (step !== 3) return;

    if (window.screen && 'isExtended' in window.screen && (window.screen as unknown as { isExtended: boolean }).isExtended) {
      recordViolationEvent('MULTI_MONITOR', 100, 8);
    }

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopyPaste = (e: ClipboardEvent) => e.preventDefault();
    const handleSelectStart = (e: Event) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (k === 'I' || k === 'J' || k === 'C')) ||
        (e.ctrlKey && (k === 'U' || k === 'C' || k === 'V' || k === 'P' || k === 'A')) ||
        (e.altKey && e.key === 'Tab')
      ) {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (k === 'I' || k === 'J'))) {
          recordViolationEvent(EventType.DEVTOOLS_OPEN, 100, 9);
          setWarningMessage('Security Warning: Developer tools and inspect shortcuts are prohibited!');
          setShowWarningOverlay(true);
        } else if (e.ctrlKey && (k === 'C' || k === 'V')) {
          recordViolationEvent('COPY_PASTE_ATTEMPT', 100, 6);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolationEvent(EventType.TAB_SWITCH, 100, 8);
        setWarningMessage('Security Warning: Tab switch / Window blur detected! Please remain focused on the exam.');
        setShowWarningOverlay(true);
      }
    };

    const handleBlur = () => {
      recordViolationEvent(EventType.TAB_SWITCH, 90, 7);
      setWarningMessage('Security Warning: Exam window lost focus! Return focus immediately.');
      setShowWarningOverlay(true);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopyPaste);
    window.addEventListener('paste', handleCopyPaste);
    window.addEventListener('cut', handleCopyPaste);
    window.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopyPaste);
      window.removeEventListener('paste', handleCopyPaste);
      window.removeEventListener('cut', handleCopyPaste);
      window.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [step, recordViolationEvent]);

  // AI Background Proctoring Loop
  useEffect(() => {
    if (step !== 3 || !candidateId || !cameraStream) return;

    let isUnmounted = false;

    const startAIOrchestration = async () => {
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = cameraStream;
        await liveVideoRef.current.play().catch(() => {});
      }

      const orchestrator = new EventOrchestrator();
      orchestratorRef.current = orchestrator;

      orchestrator.onEvent((event: ProctorEvent) => {
        if (isUnmounted) return;
        recordViolationEvent(event.eventType, event.detectorConfidence, event.baseSeverity);
      });

      if (liveVideoRef.current) {
        await orchestrator.startMonitoring(liveVideoRef.current, candidateId);
      }
    };

    startAIOrchestration();

    return () => {
      isUnmounted = true;
      if (orchestratorRef.current) {
        orchestratorRef.current.stopMonitoring();
      }
    };
  }, [step, candidateId, cameraStream, recordViolationEvent]);

  // Countdown Timer
  useEffect(() => {
    if (step !== 3) return;

    const timer = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const allChecksPassed = cameraStatus === 'success' && micStatus === 'success' && isFullscreen;

  const handleStartExam = async () => {
    if (allChecksPassed) {
      setStep(3);
      setQuestionStartTime(Date.now());
    }
  };

  const handleOptionSelect = (questionId: string, optionIdx: number) => {
    recordCurrentQuestionTime();
    setActiveQuestionId(questionId);
    setQuestionStartTime(Date.now());
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  // Finish & Submit Exam with Speed Scoring Logic
  const handleFinishExam = async () => {
    recordCurrentQuestionTime();

    if (orchestratorRef.current) {
      orchestratorRef.current.stopMonitoring();
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    // Speed-Based Scoring
    let correctCount = 0;
    let totalQuestions = 0;
    let totalScore = 0;
    let totalSpeedBonus = 0;
    let totalTimeTakenSec = 0;

    const currentTimings = { ...questionTimings };
    if (activeQuestionIdRef.current) {
      const elapsed = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
      currentTimings[activeQuestionIdRef.current] = (currentTimings[activeQuestionIdRef.current] || 0) + elapsed;
    }

    if (examConfig) {
      examConfig.sections.forEach((sec) => {
        sec.questions.forEach(() => {
          totalQuestions++;
        });
      });

      const avgTimePerQuestion = (examConfig.duration * 60) / Math.max(1, totalQuestions);

      examConfig.sections.forEach((sec) => {
        sec.questions.forEach((q) => {
          const timeTaken = currentTimings[q.id] || 10;
          totalTimeTakenSec += timeTaken;

          if (selectedAnswers[q.id] === q.correctIndex) {
            correctCount++;
            let speedBonus = 0;

            if (timeTaken <= 0.25 * avgTimePerQuestion) {
              speedBonus = 5;
            } else if (timeTaken <= 0.5 * avgTimePerQuestion) {
              speedBonus = 3;
            } else if (timeTaken <= 0.75 * avgTimePerQuestion) {
              speedBonus = 1;
            }

            totalSpeedBonus += speedBonus;
            totalScore += 10 + speedBonus;
          }
        });
      });

      const maxPossible = totalQuestions * 15;
      const actualAvgTime = Math.round(totalTimeTakenSec / Math.max(1, totalQuestions));

      setFinalScore({
        score: totalScore,
        maxPossible,
        correctCount,
        totalQuestions,
        speedBonus: totalSpeedBonus,
        avgTimePerQuestion: actualAvgTime,
      });

      // Include formatted note in completion API call
      const noteString = `Score: ${totalScore}/${maxPossible} | Correct: ${correctCount}/${totalQuestions} | Avg Time: ${actualAvgTime}s/question`;

      if (candidateId) {
        try {
          await fetch(`/api/candidates/${candidateId}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'COMPLETE',
              reviewerId: 'SYSTEM_PORTAL',
              note: noteString,
            }),
          });
        } catch (err) {
          console.error('Failed to submit exam status:', err);
        }
      }
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    setStep(4);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Mobile Block Screen
  if (isMobile === true) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 text-center">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="inline-flex p-4 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Laptop className="w-12 h-12" />
          </div>

          <h2 className="text-2xl font-bold text-slate-100">Desktop Computer Required</h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            SecureTest requires a desktop or laptop computer with a webcam. Mobile devices and tablets are not supported for proctored assessments.
          </p>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-400">
            Please reopen this assessment on a desktop or laptop browser.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 select-none">
      {/* Header */}
      {step !== 3 && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> SecureTest Student Entry Portal
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Proctored Assessment Access</h1>
          <p className="text-sm text-slate-400 mt-1">Authenticating & calibrating system environment before exam entry.</p>
        </div>
      )}

      {/* Progress Steps (Steps 1 & 2 only) */}
      {step < 3 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2.5 ${step === 1 ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300' : 'border-slate-800 bg-slate-900/50 text-slate-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${step === 1 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>1</div>
            <span className="truncate">Passkey Auth</span>
          </div>

          <div className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2.5 ${step === 2 ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300' : 'border-slate-800 bg-slate-900/50 text-slate-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${step === 2 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>2</div>
            <span className="truncate">AI & Hardware Checks</span>
          </div>

          <div className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2.5 ${step === 3 ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300' : 'border-slate-800 bg-slate-900/50 text-slate-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${step === 3 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>3</div>
            <span className="truncate">Live Assessment</span>
          </div>
        </div>
      )}

      {/* Step 1: Passkey Login */}
      {step === 1 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" /> Candidate Verification
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePasskeySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Email / Roll Number</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Enter email address or roll number"
                  value={emailOrRoll}
                  onChange={(e) => setEmailOrRoll(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Exam Passkey</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Enter exam passkey"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm font-mono tracking-wider text-slate-100 placeholder-slate-600 uppercase focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Enter the passkey provided by your assessment administrator.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2 text-slate-950 font-medium">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  Verifying Passkey & Creating Record...
                </span>
              ) : (
                <>
                  <span>Verify Passkey & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Hardware Checks */}
      {step === 2 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Pre-Exam Hardware & AI Calibration</h2>
              <p className="text-xs text-slate-400">Candidate ID: <code className="text-cyan-400 font-mono">{candidateId}</code></p>
            </div>
            <button
              onClick={initHardwareChecks}
              className="p-2 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Checks
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" /> Camera & Face Check
                </span>
                {cameraStatus === 'success' && <span className="text-xs text-emerald-400 font-medium flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Ready</span>}
                {cameraStatus === 'checking' && <span className="text-xs text-amber-400 font-medium animate-pulse">Calibrating...</span>}
                {cameraStatus === 'failed' && <span className="text-xs text-rose-400 font-medium">Action Required</span>}
              </div>

              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                {cameraStatus === 'checking' && (
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className={`p-2.5 rounded-lg border text-xs font-mono ${
                cameraStatus === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : cameraStatus === 'failed'
                  ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                {cameraMessage}
              </div>
            </div>

            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-cyan-400" /> Microphone Check
                  </span>
                  {micStatus === 'success' && <span className="text-xs text-emerald-400 font-medium flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Audio Detected</span>}
                  {micStatus === 'checking' && <span className="text-xs text-amber-400 font-medium animate-pulse">Speak into mic...</span>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Input Level</span>
                    <span>{micLevel}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-75 ${
                        micLevel > 50 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
                    <Maximize className="w-4 h-4 text-cyan-400" /> Kiosk Fullscreen Mode
                  </span>
                  {isFullscreen ? (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Locked</span>
                  ) : (
                    <span className="text-xs text-rose-400 font-medium">Not Fullscreen</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={requestKioskFullscreen}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    isFullscreen
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 cursor-pointer'
                  }`}
                >
                  <Maximize className="w-3.5 h-3.5" />
                  {isFullscreen ? 'Fullscreen Locked' : 'Lock Fullscreen Mode'}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className={`px-2 py-1 rounded border font-mono ${cameraStatus === 'success' ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>Camera ✓</span>
              <span className={`px-2 py-1 rounded border font-mono ${micStatus === 'success' ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>Mic ✓</span>
              <span className={`px-2 py-1 rounded border font-mono ${isFullscreen ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>Fullscreen ✓</span>
            </div>

            <button
              type="button"
              disabled={!allChecksPassed}
              onClick={handleStartExam}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Begin Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Dynamic Exam Room */}
      {step === 3 && examConfig && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shadow-lg sticky top-4 z-30">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold flex items-center gap-2 animate-pulse">
                <Radio className="w-3.5 h-3.5" /> 🔴 AI PROCTORING ACTIVE
              </div>
              <div className="text-xs font-mono text-slate-400">
                ID: <code className="text-cyan-400">{candidateId}</code>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {violatingCount > 0 && (
                <div className="text-xs font-mono text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded border border-rose-500/30 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Violations: {violatingCount}
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm font-mono font-semibold">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{formatTime(timeLeftSec)}</span>
              </div>

              <button
                type="button"
                onClick={handleFinishExam}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Submit Exam
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {examConfig.sections.map((sec, secIdx) => (
              <div key={sec.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                <h2 className="text-base font-mono text-cyan-400 uppercase tracking-wider font-bold border-b border-slate-800 pb-3 flex items-center gap-2">
                  <span>Section {secIdx + 1}:</span>
                  <span className="text-slate-100">{sec.name}</span>
                </h2>

                <div className="space-y-6">
                  {sec.questions.map((q, qIdx) => {
                    let optionsArray: string[] = [];
                    try {
                      optionsArray = JSON.parse(q.options);
                    } catch {
                      optionsArray = [];
                    }

                    return (
                      <div key={q.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
                        <h3 className="text-sm font-medium text-slate-100 flex items-start gap-2">
                          <span className="text-cyan-400 font-mono shrink-0">Q{qIdx + 1}.</span>
                          <span>{q.question}</span>
                        </h3>

                        <div className="space-y-2.5 pt-1">
                          {optionsArray.map((opt, optIdx) => {
                            const isSelected = selectedAnswers[q.id] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleOptionSelect(q.id, optIdx)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                                }`}
                              >
                                <span>{opt}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-slate-700'}`}>
                                  {isSelected && <div className="w-2 h-2 bg-cyan-400 rounded-full" />}
                                </div>
                              </button>
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

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleFinishExam}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Complete & Finish Assessment</span>
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Picture-in-Picture Webcam */}
          <div className="fixed bottom-6 right-6 z-40 w-44 aspect-video rounded-xl overflow-hidden border-2 border-cyan-500/50 bg-slate-950 shadow-2xl group">
            <video
              ref={liveVideoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> AI Live
            </div>
          </div>

          {/* Warning Overlay */}
          {showWarningOverlay && (
            <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 text-center">
              <div className="max-w-md w-full bg-slate-900 border border-rose-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="inline-flex p-3 rounded-full bg-rose-950 border border-rose-500/40 text-rose-400">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Assessment Interrupted</h3>
                <p className="text-xs text-slate-300">{warningMessage || 'Fullscreen and focus lock is required to continue this proctored exam.'}</p>

                <button
                  type="button"
                  onClick={requestKioskFullscreen}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Maximize className="w-4 h-4" /> Lock Fullscreen & Resume
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Submission Confirmation with Speed Breakdown */}
      {step === 4 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 shadow-xl text-center space-y-6 max-w-xl mx-auto my-12">
          <div className="inline-flex p-4 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-100">Test Submitted Successfully</h2>
            <p className="text-xs text-slate-400 mt-1">
              Your responses and proctoring telemetry log have been transmitted to the HR Command Center.
            </p>
          </div>

          {finalScore && (
            <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-5 space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-mono uppercase text-slate-400">Final Candidate Score</span>
                <span className="text-xl font-mono font-bold text-cyan-400">
                  Score: {finalScore.score} / {finalScore.maxPossible}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300 pt-1">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px]">CORRECT ANSWERS</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {finalScore.correctCount} / {finalScore.totalQuestions}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px]">SPEED BONUS</span>
                  <span className="text-cyan-400 font-bold text-sm flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> +{finalScore.speedBonus} pts
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800/60">
                <span>Average Speed Per Question:</span>
                <span className="text-slate-200 font-bold">{finalScore.avgTimePerQuestion}s / question</span>
              </div>
            </div>
          )}

          <div className="block text-xs font-mono text-slate-500">
            Candidate Reference ID: <code className="text-cyan-400">{candidateId}</code>
          </div>
        </div>
      )}
    </div>
  );
}
