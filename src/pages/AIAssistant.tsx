import React, { useEffect, useRef, useState } from 'react';
import { askGemini, GeminiResponse } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import {
  BrainCircuit,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  History,
  Terminal,
  Trash2,
  Copy,
  RefreshCw,
  X,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  responseDetails?: GeminiResponse;
}

// SpeechRecognition type augmentation
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const AIAssistant: React.FC = () => {
  const { chatHistory, addMessage, clearChat, language } = useAppContext();
  const messages = chatHistory;
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [showReasoning, setShowReasoning] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ---- Voice State ----
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Warm up voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Suggested Prompts
  const suggestedPrompts = [
    "Which ward needs immediate attention?",
    "Predict tomorrow's traffic.",
    "Which area has highest flood risk?",
    "How can waste collection be optimized?"
  ];

  // ---- SpeechRecognition ----
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported in this browser.');
      return;
    }
    setVoiceError(null);
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      handleSendMessage(transcript, true);
    };
    recognition.onerror = (event: any) => {
      setVoiceError(`Voice error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const cancelListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
    setInputText('');
  };

  // Helper to remove markdown characters so speech sounds clean
  const sanitizeForSpeech = (rawText: string) => {
    return rawText
      .replace(/\*\*/g, '')          // remove bold **
      .replace(/\*/g, '')           // remove italic *
      .replace(/#/g, '')            // remove headers #
      .replace(/`([^`]+)`/g, '$1')  // remove inline code ticks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links but keep text
      .trim();
  };

  // ---- SpeechSynthesis ----
  const speakText = (text: string, msgId: string) => {
    if (!window.speechSynthesis) {
      setVoiceError('Text-to-speech not supported in this browser.');
      return;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setIsSpeaking(false);

    const cleanText = sanitizeForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Map language setting from app context
    const targetLang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.lang = targetLang;

    // Retrieve available system voices
    const voices = window.speechSynthesis.getVoices();
    let matchingVoice = voices.find(v => v.lang === targetLang || v.lang.replace('_', '-').toLowerCase() === targetLang.toLowerCase());
    
    if (!matchingVoice) {
      // Find matching language code prefix (e.g. kn, hi, en)
      const prefix = language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en';
      matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.rate = 0.95;
    synthRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageId(msgId);
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onend = handleSpeechEnd;
    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      handleSpeechEnd();
    };

    // Chrome/Safari workaround: schedule speech slightly after cancel
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  };

  // ---- Send message handler ----
  const handleSendMessage = async (text: string, isVoiceInput = false) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    addMessage(userMsg);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await askGemini(text);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: result.text,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        responseDetails: result
      };
      addMessage(assistantMsg);
      setSelectedMessage(assistantMsg);

      // Auto-speak if user used voice inputs
      if (isVoiceInput) {
        speakText(result.text, assistantMsg.id);
      }
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: "I experienced an error connecting to Vertex AI. Please check your credentials or run in local fallback mode.",
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      addMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Select message to inspect reasoning
  const inspectReasoning = (msg: ChatMessage) => {
    if (msg.sender === 'assistant' && msg.responseDetails) {
      setSelectedMessage(msg);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-premium font-sans">
      
      {/* Sidebar: Historical Chats */}
      <div className="hidden md:flex w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col p-4 justify-between shrink-0">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Recent Consultations
          </h3>
          <div className="space-y-1">
            {messages.filter(m => m.sender === 'user').slice(-3).reverse().map((m, i) => (
              <button
                key={m.id}
                onClick={() => handleSendMessage(m.text)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                  i === 0
                    ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{m.text}</span>
              </button>
            ))}
            {messages.filter(m => m.sender === 'user').length === 0 && (
              <>
                <button className="w-full text-left p-2.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/25 flex items-center gap-2">
                  <BrainCircuit className="w-3.5 h-3.5" /> Sector Risk Evaluation
                </button>
                <button className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" /> BigQuery Query Session
                </button>
                <button className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> SWM Route Optimization
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <button onClick={clearChat} className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
          <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] text-slate-500">
            <strong>Agent Status:</strong> Gemini-1.5-Flash online. System latency: 42ms.
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col justify-between relative bg-slate-50/40 dark:bg-slate-900/10">
        
        {/* Chat header */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center dark:bg-blue-500/20 dark:text-blue-400"><BrainCircuit className="w-4 h-4" /></div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-none">Gemini Copilot Agent</h3>
              <span className="text-[10px] text-green-500 font-mono mt-1 block">Decision Support Layer — Voice Enabled</span>
            </div>
          </div>

          <button 
            onClick={() => setShowReasoning(!showReasoning)}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
          >
            {showReasoning ? 'Hide Reasoning' : 'Show Reasoning'}
            {showReasoning ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Voice Error Banner */}
        {voiceError && (
          <div className="mx-4 mt-2 p-2 bg-red-500/10 border border-red-500/25 rounded-lg text-xs text-red-500 flex items-center justify-between">
            <span>{voiceError}</span>
            <button onClick={() => setVoiceError(null)}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Chat bubbles list */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'} group`}
              >
                <div 
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed border shadow-premium ${
                    isUser 
                      ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Action shortcut chips */}
                  {!isUser && msg.responseDetails && (
                    <div className="mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-2 flex flex-wrap gap-1.5">
                      {msg.responseDetails.actions.map((act, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-[10px] font-semibold text-blue-500 dark:text-blue-400">
                          &bull; {act}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                  {!isUser && msg.responseDetails && (
                    <>
                      <button onClick={() => inspectReasoning(msg)} className="text-[9px] text-blue-500 dark:text-blue-400 font-semibold hover:underline">Inspect Reasoning &rarr;</button>
                      <button onClick={() => copyToClipboard(msg.text)} className="text-slate-400 hover:text-slate-600"><Copy className="w-3 h-3" /></button>
                      <button
                        onClick={() => speakingMessageId === msg.id ? stopSpeaking() : speakText(msg.text, msg.id)}
                        className={`transition-colors ${speakingMessageId === msg.id ? 'text-blue-500 font-bold' : 'text-slate-400 hover:text-blue-500'}`}
                        title={speakingMessageId === msg.id ? 'Stop speaking' : 'Read aloud'}
                      >
                        {speakingMessageId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loader */}
          {isLoading && (
            <div className="flex flex-col mr-auto max-w-[80%] items-start">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-tl-none flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input panel & suggested prompts */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Suggested Prompts */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => handleSendMessage(p)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Listening status banner */}
          {isListening && (
            <div className="flex items-center gap-2 text-xs text-blue-500 font-semibold animate-pulse">
              <Mic className="w-3.5 h-3.5" /> Listening... speak now
              <button onClick={cancelListening} className="ml-auto text-slate-400 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form */}
          <div className="flex items-center gap-2">
            {/* Voice controls */}
            {isListening ? (
              <div className="flex gap-1 shrink-0">
                <button 
                  title="Stop listening"
                  onClick={stopListening}
                  className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0"
                >
                  <MicOff className="w-4 h-4" />
                </button>
                <button
                  title="Cancel"
                  onClick={cancelListening}
                  className="p-2.5 rounded-xl bg-red-600 text-white shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                title="Voice Input"
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all shrink-0"
                onClick={startListening}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <input
              type="text"
              placeholder="Ask a question about Bangalore's urban operations..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputText)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />

            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Reasoning, Evidence & Sources Panel */}
      {showReasoning && (
        <div className="w-80 bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col p-5 overflow-y-auto shrink-0 justify-between">
          {selectedMessage && selectedMessage.responseDetails ? (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-blue-500" /> Model Reasoning Details
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Explains how Gemini computed the selected recommendation response.</p>
              </div>

              {/* Confidence Meter */}
              <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-premium">
                <span className="block text-[9px] text-slate-400 uppercase tracking-widest font-mono">CONFIDENCE INDEX</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500" 
                      style={{ width: `${selectedMessage.responseDetails.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {Math.round(selectedMessage.responseDetails.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Reasoning Nodes */}
              <div className="space-y-2">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">Evidence Chain Path</span>
                <ul className="space-y-2">
                  {selectedMessage.responseDetails.reasoning.map((reason, i) => (
                    <li key={i} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg text-xs text-slate-650 dark:text-slate-300 leading-relaxed shadow-premium">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sources */}
              <div className="space-y-2">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">BigQuery / SCADA References</span>
                <ul className="space-y-1">
                  {selectedMessage.responseDetails.sources.map((src, i) => (
                    <li key={i} className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{src}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <BrainCircuit className="w-12 h-12 text-slate-350 dark:text-slate-700 animate-pulse mb-3" />
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-400">No message selected</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 max-w-[200px]">
                Click on any assistant message bubble containing reasoning pathways to inspect confidence and source evidence.
              </p>
            </div>
          )}

          {/* Voice Response trigger */}
          {selectedMessage && selectedMessage.responseDetails && (
            <button
              onClick={() => speakingMessageId === selectedMessage.id ? stopSpeaking() : speakText(selectedMessage.text, selectedMessage.id)}
              className={`w-full mt-4 py-2.5 border rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                speakingMessageId === selectedMessage.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              {speakingMessageId === selectedMessage.id ? (
                <><VolumeX className="w-3.5 h-3.5" /> Stop Speaking</>
              ) : (
                <><Volume2 className="w-3.5 h-3.5" /> Read Aloud</>
              )}
            </button>
          )}
        </div>
      )}

    </div>
  );
};
