"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const DoubleCheckIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 16 11"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.045 0.584961L11.9883 1.52829L5.85833 7.65829L2.55833 4.35829L3.50167 3.41496L5.85833 5.77163L11.045 0.584961ZM14.345 0.584961L15.2883 1.52829L9.15833 7.65829L8.215 6.71496L14.345 0.584961ZM9.15833 9.54496L5.85833 6.24496L6.80167 5.30163L9.15833 7.65829L14.345 2.47163L15.2883 3.41496L9.15833 9.54496Z" />
  </svg>
);

export const PhoneCallIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const VideoCallIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

export const ArrowLeftIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const MoreVerticalIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

export const PaperclipIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

export const CameraIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const MicrophoneIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

export const EmojiIcon = ({ className = "w-4.5 h-4.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} />
  </svg>
);

const DEFAULT_MESSAGES = [
  {
    id: 1,
    sender: "Taylor",
    avatarInitial: "T",
    text: "Hey! 👋",
    isCurrentUser: false,
    timestamp: "10:11 AM",
  },
  {
    id: 2,
    sender: "Taylor",
    avatarInitial: "T",
    text: "Wanted to catch up with you - are you in the office this week?",
    isCurrentUser: false,
    timestamp: "10:11 AM",
  },
  {
    id: 3,
    sender: "You",
    avatarInitial: "Y",
    text: "Hi! I'm working remotely this week 🏖️",
    isCurrentUser: true,
    timestamp: "10:12 AM",
  },
  {
    id: 4,
    sender: "You",
    avatarInitial: "Y",
    isImage: true,
    imageUrl:
      "https://cdn.21st.dev/assets/mirror/cc/cc2577fd1f665e5ae113dd127572d18996518a37d7020888d275a88c244feff2.jpg",
    imageCaption: "Catch you next Monday over coffee! ☕",
    isCurrentUser: true,
    timestamp: "10:12 AM",
  },
  {
    id: 5,
    sender: "Taylor",
    avatarInitial: "T",
    text: "Sounds good. Enjoy the rest of your week! 😊",
    isCurrentUser: false,
    timestamp: "10:13 AM",
  },
];

export function MobileMockup({
  headerTitle = "UK Brand Lover",
  headerSubtitle = "online",
  avatarUrl = "",
  avatarFallback = "🇬🇧",
  messages = DEFAULT_MESSAGES,
  autoPlay = false,
  className = "",
  children = null,
}) {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [showTyping, setShowTyping] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    if (!autoPlay || children) {
      return;
    }

    let isMounted = true;
    let t1, t2, t3, t4, tReset;

    const runSequence = () => {
      if (!isMounted) return;
      setVisibleMessages([]);
      setShowTyping(false);

      t1 = setTimeout(() => {
        if (!isMounted) return;
        setVisibleMessages([messages[0], messages[1]].filter(Boolean));
        setShowTyping(true);
      }, 800);

      t2 = setTimeout(() => {
        if (!isMounted) return;
        setShowTyping(false);
        setVisibleMessages([messages[0], messages[1], messages[2]].filter(Boolean));
      }, 2500);

      t3 = setTimeout(() => {
        if (!isMounted) return;
        setVisibleMessages([
          messages[0],
          messages[1],
          messages[2],
          messages[3],
        ].filter(Boolean));
        setTimeout(() => {
          if (isMounted) setShowTyping(true);
        }, 600);
      }, 4500);

      t4 = setTimeout(() => {
        if (!isMounted) return;
        setShowTyping(false);
        setVisibleMessages(messages);
      }, 6800);

      tReset = setTimeout(() => {
        if (isMounted) {
          setCycleKey((prev) => prev + 1);
        }
      }, 10800);
    };

    runSequence();

    return () => {
      isMounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tReset);
    };
  }, [autoPlay, children, messages, cycleKey]);

  const displayMessages = !autoPlay || children ? messages : visibleMessages;

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[320px] sm:max-w-[340px] items-center justify-center py-1 select-none",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative flex h-[520px] w-full transform-gpu flex-col overflow-hidden rounded-[38px] bg-neutral-900 p-2.5 shadow-2xl transition-colors"
      >
        {/* Hardware side buttons */}
        <div className="absolute top-24 -left-[5px] h-8 w-[2.5px] rounded-l-xs bg-neutral-700" />
        <div className="absolute top-36 -left-[5px] h-10 w-[2.5px] rounded-l-xs bg-neutral-700" />
        <div className="absolute top-48 -left-[5px] h-10 w-[2.5px] rounded-l-xs bg-neutral-700" />
        <div className="absolute top-32 -right-[5px] h-14 w-[2.5px] rounded-r-xs bg-neutral-700" />

        {/* Screen Bezel */}
        <div className="relative isolate flex h-full w-full transform-gpu flex-col overflow-hidden rounded-[28px] bg-[#efeae2] text-neutral-900">
          
          {/* Top Status Bar */}
          <div className="z-30 flex shrink-0 items-center justify-between bg-[#008069] px-4 pt-2 pb-1 text-[11px] font-semibold text-white">
            <span className="w-10 text-left font-bold tracking-tight text-[11px]">
              12:45
            </span>

            <div className="flex items-center justify-end gap-1.5 text-white">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="16" width="3.5" height="5" rx="0.5" />
                <rect x="7.5" y="12" width="3.5" height="9" rx="0.5" />
                <rect x="13" y="8" width="3.5" height="13" rx="0.5" />
                <rect x="18.5" y="4" width="3.5" height="17" rx="0.5" />
              </svg>
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
              <svg
                className="h-2.5 w-4"
                fill="none"
                viewBox="0 0 24 14"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="1" y="1" width="18" height="12" rx="3" />
                <rect
                  x="3"
                  y="3"
                  width="11"
                  height="8"
                  rx="1.5"
                  fill="currentColor"
                />
                <path d="M21 4v6" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* WhatsApp Header */}
          <div className="z-20 flex shrink-0 items-center justify-between bg-[#008069] px-3 py-1.5 text-white shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                className="text-white/90 transition-colors hover:text-white"
              >
                <ArrowLeftIcon />
              </button>

              <div className="relative flex h-7.5 w-7.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[#008069] text-xs font-black shadow-xs">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={headerTitle}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{avatarFallback}</span>
                )}
              </div>

              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-1">
                  <span className="max-w-[130px] truncate text-[11.5px] leading-tight font-bold text-white">
                    {headerTitle}
                  </span>
                  <svg className="size-3 text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m9 16.17 9.83-9.83 1.41 1.41L9 19 3.59 13.59l1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
                <span className="text-[9.5px] leading-none font-medium text-emerald-100">
                  {headerSubtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-white/90">
              <button
                type="button"
                className="transition-colors hover:text-white"
              >
                <VideoCallIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="transition-colors hover:text-white"
              >
                <PhoneCallIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="transition-colors hover:text-white"
              >
                <MoreVerticalIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Background & Message Area */}
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#efeae2] p-2.5">
            {children ? (
              <div className="relative z-10 h-full w-full [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {children}
              </div>
            ) : (
              <>
                <div className="relative z-10 mx-auto mb-1.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[9px] font-medium text-neutral-600 shadow-2xs">
                  Today
                </div>

                <div className="relative z-10 flex flex-1 [scrollbar-width:none] flex-col justify-start space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden pt-1">
                  <AnimatePresence mode="sync">
                    {displayMessages.map((msg) => (
                      <motion.div
                        key={`${cycleKey}-${msg.id}`}
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        className={`flex flex-col ${msg.isCurrentUser ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={cn(
                            "relative flex max-w-[92%] flex-col rounded-xl px-3 py-2 text-[11px] shadow-xs leading-relaxed transition-colors",
                            msg.isCurrentUser
                              ? "rounded-tr-none bg-[#dcf8c6] text-neutral-900 border border-emerald-200/50"
                              : "rounded-tl-none bg-white text-neutral-900 border border-slate-200/60",
                          )}
                        >
                          {msg.isImage ? (
                            <div className="flex min-w-[150px] flex-col gap-1">
                              <div className="relative max-h-[100px] overflow-hidden rounded-lg">
                                <img
                                  src={msg.imageUrl}
                                  alt="Attached media"
                                  className="h-22 w-full object-cover"
                                />
                              </div>
                              {msg.imageCaption && (
                                <p className="mt-0.5 px-0.5 text-[10.5px] leading-tight">
                                  {msg.imageCaption}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] leading-relaxed whitespace-pre-wrap font-sans text-slate-800">
                              {msg.text}
                            </p>
                          )}

                          <div className="mt-1 flex items-center justify-end gap-1 self-end">
                            <span
                              className={cn(
                                "text-[9px] font-medium",
                                msg.isCurrentUser
                                  ? "text-emerald-800/70"
                                  : "text-neutral-400",
                              )}
                            >
                              {msg.timestamp || "Just now"}
                            </span>
                            {msg.isCurrentUser && (
                              <DoubleCheckIcon className="h-3 w-3 text-[#34b7f1]" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {showTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-start"
                      >
                        <div className="flex items-center gap-1.5 rounded-xl rounded-tl-none bg-white px-3 py-2 shadow-xs">
                          <span className="text-[10px] font-semibold text-emerald-600">
                            typing
                          </span>
                          <div className="flex items-center gap-1">
                            {[0, 1, 2].map((dotIndex) => (
                              <motion.span
                                key={dotIndex}
                                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                                animate={{
                                  y: [0, -3, 0],
                                  opacity: [0.4, 1, 0.4],
                                }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: dotIndex * 0.15,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Bottom WhatsApp Input Bar */}
          <div className="z-20 flex shrink-0 items-center gap-1.5 bg-[#f0f2f5] p-2">
            <button
              type="button"
              className="p-1 text-neutral-600 transition-colors hover:text-emerald-600"
            >
              <EmojiIcon />
            </button>
            <div className="flex flex-1 items-center justify-between rounded-full bg-white px-3 py-1.5 text-xs text-neutral-400 shadow-2xs">
              <span className="truncate text-[11px]">Message</span>
              <div className="flex items-center gap-2 text-neutral-400">
                <button
                  type="button"
                  className="hover:text-neutral-600"
                >
                  <PaperclipIcon />
                </button>
                <button
                  type="button"
                  className="hover:text-neutral-600"
                >
                  <CameraIcon />
                </button>
              </div>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white shadow-xs transition-colors hover:bg-emerald-600"
            >
              <MicrophoneIcon />
            </button>
          </div>

          {/* Bottom gesture line */}
          <div className="flex shrink-0 justify-center bg-[#f0f2f5] pt-0.5 pb-1">
            <div className="h-1 w-20 rounded-full bg-neutral-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default MobileMockup;
