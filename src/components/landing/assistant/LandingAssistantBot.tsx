"use client";

import React, { useState, useRef, useEffect } from "react";
import TaskBot, { BotState } from "./TaskBot";
import {
  INITIAL_GREETING,
  QUICK_ACTIONS,
  KNOWLEDGE_BASE,
  matchQuery,
  AssistantResponse,
} from "./assistant-knowledge";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  timestamp: string;
  response: AssistantResponse;
}

export function LandingAssistantBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [botState, setBotState] = useState<BotState>("idle");
  const [botProgress, setBotProgress] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);

  // Contact form state inside chat
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "initial-welcome",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      response: INITIAL_GREETING,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowWelcomeBubble(false);
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setBotState("listening");
    setTimeout(() => {
      setBotState("idle");
    }, 1200);
  };

  const handleClose = () => {
    setIsOpen(false);
    setBotState("idle");
  };

  const deliverBotReply = (res: AssistantResponse) => {
    setBotState("thinking");
    setBotProgress(45);

    setTimeout(() => {
      setBotProgress(85);
      setBotState("speaking");

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          response: res,
        },
      ]);

      setTimeout(() => {
        setBotProgress(100);
        setBotState(res.isContactPrompt ? "listening" : "idle");
      }, 1500);
    }, 450);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        response: { text },
      },
    ]);

    setInputValue("");
    const matched = matchQuery(text);
    deliverBotReply(matched);
  };

  const handleActionClick = (actionId: string, queryLabel?: string) => {
    const matched = KNOWLEDGE_BASE[actionId] || matchQuery(queryLabel || actionId);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        response: { text: queryLabel || actionId },
      },
    ]);

    deliverBotReply(matched);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim()) return;

    setBotState("thinking");
    setBotProgress(60);

    setTimeout(() => {
      setBotState("success");
      setBotProgress(100);
      setContactSubmitted(true);

      setMessages((prev) => [
        ...prev,
        {
          id: `contact-ack-${Date.now()}`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          response: {
            title: "Query Dispatched Successfully",
            text: `Thank you, ${contactName}! Your note has been queued for the ISE Department project coordinator. We will reach back to you at ${contactEmail || "your college portal inbox"}.`,
            highlights: [
              "Reference ID: ACX-ISE-" + Math.floor(1000 + Math.random() * 9000),
              "Average response time: Within 24 academic working hours",
            ],
          },
        },
      ]);

      // Reset form fields
      setContactName("");
      setContactEmail("");
      setContactMessage("");

      setTimeout(() => {
        setBotState("idle");
      }, 3500);
    }, 600);
  };

  const handleResetChat = () => {
    setBotState("thinking");
    setMessages([
      {
        id: "initial-welcome-reset",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        response: INITIAL_GREETING,
      },
    ]);
    setContactSubmitted(false);
    setTimeout(() => {
      setBotState("idle");
      setBotProgress(0);
    }, 500);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans">
      {/* 1. Floating Launcher Button (Collapsed) */}
      {!isOpen && (
        <div className="relative flex items-center">
          {/* Welcome Speech Bubble Prompt */}
          {showWelcomeBubble && (
            <div
              onClick={handleOpen}
              className="absolute right-full mr-3.5 bottom-1/2 translate-y-1/2 whitespace-nowrap bg-white text-neutral-800 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl shadow-lg border border-neutral-200/90 cursor-pointer hover:border-neutral-300 transition-all duration-200 select-none animate-bounce"
              style={{ animationDuration: "2.8s" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span>Need help with <strong>AcadeX</strong>? Ask me!</span>
              </div>
              {/* Pointer arrow to the right */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-neutral-200/90 rotate-45" />
            </div>
          )}

          {/* Bot Launcher Pill */}
          <button
            type="button"
            onClick={handleOpen}
            onMouseEnter={() => setBotState("listening")}
            onMouseLeave={() => setBotState("idle")}
            aria-label="Open AcadeX Assistant Chatbot"
            className="group relative flex items-center gap-3 bg-[#111f3a] hover:bg-[#16274a] text-white pl-2 pr-4 sm:pr-5 py-1.5 rounded-full shadow-2xl border border-[#2b4170] transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] cursor-pointer"
          >
            {/* TaskBot mini avatar */}
            <div className="w-12 h-12 flex items-center justify-center -my-2 overflow-visible">
              <TaskBot state={botState} size={46} followCursor={false} />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-wide text-white leading-tight flex items-center gap-1.5">
                AcadeX Bot
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
              </span>
              <span className="text-[10px] text-neutral-300 font-medium leading-none mt-0.5">
                Project Guide & Help
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 2. Floating Chat Window (Expanded) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AcadeX Assistant"
          className="flex flex-col bg-white w-[calc(100vw-32px)] sm:w-[410px] h-[580px] max-h-[82vh] rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Header */}
          <div className="bg-[#111f3a] text-white px-4 py-3 border-b border-[#1d3159] flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              {/* Responsive interactive TaskBot avatar in header */}
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <TaskBot state={botState} size={38} progress={botProgress} followCursor={false} />
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                  AcadeX Assistant
                </h3>
                <p className="text-[11px] text-neutral-300 font-normal">
                  Sahyadri ISE
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart Chat"
                className="w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleClose}
                title="Minimize / Close"
                className="w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick topic pills strip */}
          <div className="bg-[#f8fafc] border-b border-neutral-200 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider shrink-0 mr-1">
              Quick:
            </span>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleActionClick(action.id, action.query)}
                className="text-[11px] whitespace-nowrap bg-white hover:bg-[#111f3a] text-neutral-700 hover:text-white px-2.5 py-1 rounded-full border border-neutral-200/90 hover:border-[#111f3a] font-medium transition-colors shrink-0 shadow-xs flex items-center gap-1 cursor-pointer"
              >
                {action.label}
                {action.badge && (
                  <span className="text-[9px] bg-[#38bdf8]/15 text-[#0284c7] px-1 rounded-sm font-semibold">
                    {action.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-neutral-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                      isUser
                        ? "bg-[#111f3a] text-white rounded-tr-xs"
                        : "bg-white text-neutral-800 border border-neutral-200/80 rounded-tl-xs"
                    }`}
                  >
                    {/* Bot response Title */}
                    {!isUser && msg.response.title && (
                      <div className="font-semibold text-neutral-900 pb-1 mb-1.5 border-b border-neutral-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                        <span>{msg.response.title}</span>
                      </div>
                    )}

                    {/* Main Text */}
                    <p className="whitespace-pre-line">{msg.response.text}</p>

                    {/* Bullet Highlights */}
                    {!isUser && msg.response.highlights && msg.response.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1 bg-neutral-50 p-2 rounded-lg border border-neutral-100 text-[11px] text-neutral-700">
                        {msg.response.highlights.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#0284c7] font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Action Links / Buttons */}
                    {!isUser && msg.response.links && msg.response.links.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-neutral-100 flex flex-wrap gap-1.5">
                        {msg.response.links.map((link, idx) => {
                          if (link.href) {
                            return (
                              <a
                                key={idx}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0284c7] hover:text-[#0369a1] bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                <span>{link.label}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                              </a>
                            );
                          }
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (link.actionId) handleActionClick(link.actionId, link.label);
                              }}
                              className="text-[11px] font-medium text-[#0284c7] hover:text-[#0369a1] bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                            >
                              → {link.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Contact Form Prompt */}
                    {!isUser && msg.response.isContactPrompt && !contactSubmitted && (
                      <form onSubmit={handleContactSubmit} className="mt-3 space-y-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-0.5">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#111f3a]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-0.5">
                            Email or USN
                          </label>
                          <input
                            type="text"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="e.g. 4SF22IS000 / rahul@sahyadri.edu.in"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#111f3a]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-0.5">
                            Query / Message *
                          </label>
                          <textarea
                            required
                            rows={2}
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder="What do you need assistance with?"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#111f3a] resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#111f3a] hover:bg-[#1b2f56] text-white text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-1 cursor-pointer"
                        >
                          <span>Submit Query to Coordinator</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      </form>
                    )}
                  </div>

                  <span className="text-[10px] text-neutral-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-neutral-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setBotState("listening")}
              onBlur={() => {
                if (botState === "listening") setBotState("idle");
              }}
              placeholder="Ask anything about AcadeX (reviews, team...)"
              className="flex-1 bg-neutral-100 hover:bg-neutral-50 focus:bg-white text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 px-3 py-2 rounded-xl border border-neutral-200 focus:border-[#111f3a] focus:outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Send message"
              className="w-9 h-9 flex items-center justify-center bg-[#111f3a] hover:bg-[#1a2e55] disabled:bg-neutral-200 text-white disabled:text-neutral-400 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default LandingAssistantBot;
