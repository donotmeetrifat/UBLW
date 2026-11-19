"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Format WhatsApp text:
 * - *bold* -> <strong>
 * - URLs -> styled blue clickable links
 * - preserves linebreaks
 */
function formatWhatsAppMessage(text) {
  if (!text) return "";
  const lines = String(text).split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*[^*]+\*|https?:\/\/[^\s]+)/g);
    return (
      <React.Fragment key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return (
              <strong key={partIdx} className="font-bold text-[#111B21]">
                {part.slice(1, -1)}
              </strong>
            );
          }
          if (part.startsWith("http://") || part.startsWith("https://")) {
            return (
              <span
                key={partIdx}
                className="text-[#027EB5] underline font-medium break-all cursor-pointer"
              >
                {part}
              </span>
            );
          }
          return part;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export function MobileMockup({
  headerTitle = "UK Brand Lover",
  headerSubtitle = "online",
  avatarUrl = "/images/web-logo-optimized.png",
  avatarFallback = "🇬🇧",
  messageText = "",
  messages,
  timestamp = "12:45 PM",
  className = "",
}) {
  let resolvedText = messageText;
  if (!resolvedText && Array.isArray(messages) && messages.length > 0) {
    const target = messages.find((m) => m.id === 2) || messages[0];
    resolvedText = target?.text || "";
  }

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[340px] sm:max-w-[360px] items-center justify-center py-2 select-none",
        className
      )}
    >
      {/* Real Samsung Galaxy Flagship Phone Chassis (Tall 19.5:9 / 20:9 Aspect Ratio) */}
      <div className="relative flex h-[720px] sm:h-[750px] w-full flex-col overflow-hidden rounded-[38px] bg-[#141518] p-[7px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border-[2.5px] border-[#2C2E35] ring-1 ring-white/10">
        
        {/* Samsung Hardware Buttons on Right Edge */}
        <div className="absolute top-28 -right-[4.5px] h-14 w-[3.5px] rounded-r-xs bg-[#363840]" />
        <div className="absolute top-48 -right-[4.5px] h-9 w-[3.5px] rounded-r-xs bg-[#363840]" />

        {/* Samsung Dynamic AMOLED Screen (Ultra-Slim Uniform Bezels, White Theme) */}
        <div className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-[31px] bg-[#EFEAE2] text-[#111B21] shadow-inner">
          
          {/* Samsung One UI Status Bar (Deep WhatsApp Teal #008069) */}
          <div className="z-30 flex shrink-0 items-center justify-between bg-[#008069] px-4 pt-2.5 pb-1 text-white">
            {/* Time & Mini WhatsApp Icon */}
            <div className="flex items-center gap-1.5 w-16">
              <span className="font-semibold text-[11.5px] tracking-tight">12:45</span>
              <svg className="size-3 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.004 2C6.479 2 2 6.48 2 12c0 1.96.568 3.79 1.55 5.34L2.05 22l4.82-1.47A9.95 9.95 0 0 0 12.004 22c5.524 0 10-4.48 10-10s-4.476-10-10-10z" />
              </svg>
            </div>

            {/* Samsung Infinity-O Centered Punch-Hole Camera */}
            <div className="size-2.5 rounded-full bg-black ring-1 ring-black/60 shadow-inner flex items-center justify-center">
              <span className="size-0.5 rounded-full bg-[#1A1F2B]" />
            </div>

            {/* Samsung One UI Status Icons (5G, Wi-Fi, Signal, Battery) */}
            <div className="flex items-center justify-end gap-1.5 text-white">
              <span className="text-[8.5px] font-black border border-white/60 px-0.5 rounded-xs leading-none">
                5G
              </span>
              {/* Wi-Fi */}
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              {/* Signal Bars */}
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="16" width="3" height="6" rx="0.5" />
                <rect x="7" y="12" width="3" height="10" rx="0.5" />
                <rect x="12" y="8" width="3" height="14" rx="0.5" />
                <rect x="17" y="4" width="3" height="18" rx="0.5" />
              </svg>
              {/* Battery */}
              <div className="flex items-center">
                <span className="text-[9px] font-bold mr-0.5">98%</span>
                <svg className="h-2.5 w-4" fill="none" viewBox="0 0 24 14" stroke="currentColor" strokeWidth={2}>
                  <rect x="1" y="1" width="18" height="12" rx="3" />
                  <rect x="3" y="3" width="13" height="8" rx="1.5" fill="currentColor" />
                  <path d="M21 4v6" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Official WhatsApp Android Header (Light / White Theme) */}
          <div className="z-20 flex shrink-0 items-center justify-between bg-[#008069] px-2.5 py-2 text-white shadow-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Android Back Arrow */}
              <button type="button" className="p-1 text-white hover:opacity-80">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>

              {/* Store Avatar */}
              <div className="relative size-9.5 shrink-0 overflow-hidden rounded-full bg-white flex items-center justify-center text-xs font-black shadow-xs border border-white/20">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={headerTitle}
                    className="h-full w-full object-contain p-0.5"
                  />
                ) : (
                  <span className="text-base">{avatarFallback}</span>
                )}
              </div>

              {/* Title & Online Status */}
              <div className="flex min-w-0 flex-col ml-0.5">
                <div className="flex items-center gap-1">
                  <span className="truncate text-[13px] font-bold leading-tight text-white max-w-[130px]">
                    {headerTitle}
                  </span>
                  {/* Verified Checkmark Badge */}
                  <svg className="size-3.5 text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <span className="text-[10px] text-emerald-100 font-normal leading-none mt-0.5">
                  {headerSubtitle}
                </span>
              </div>
            </div>

            {/* Header Right Action Icons */}
            <div className="flex items-center gap-3 pr-1 text-white">
              {/* Video Call */}
              <button type="button" className="hover:opacity-80">
                <svg className="size-4.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </button>
              {/* Voice Call */}
              <button type="button" className="hover:opacity-80">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.28-.28.37-.67.25-1.02A11.36 11.36 0 0 1 8.96 4.3c0-.55-.45-1-1-1H4.35c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.62c0-.55-.45-1-1-1.3z" />
                </svg>
              </button>
              {/* 3-dots Menu */}
              <button type="button" className="hover:opacity-80">
                <svg className="size-4.5" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.75" />
                  <circle cx="12" cy="12" r="1.75" />
                  <circle cx="12" cy="19" r="1.75" />
                </svg>
              </button>
            </div>
          </div>

          {/* Official WhatsApp Light Wallpaper Chat Canvas */}
          <div
            className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-3 space-y-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              backgroundColor: "#EFEAE2",
              backgroundImage: `radial-gradient(#DFD8CE 1px, transparent 1px)`,
              backgroundSize: "16px 16px",
            }}
          >
            {/* End-to-End Encryption Notice */}
            <div className="mx-auto my-1 max-w-[280px] bg-[#FFEECD] text-[#54656F] text-[9.5px] leading-tight px-3 py-1.5 rounded-lg shadow-2xs text-center flex items-center justify-center gap-1.5 border border-[#FFE0A3]/60">
              <svg className="size-3 shrink-0 text-[#8C6D23]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
              <span>Messages are end-to-end encrypted. No one outside of this chat can read them.</span>
            </div>

            {/* "TODAY" Date Pill */}
            <div className="mx-auto mb-1 rounded-md bg-white/90 px-3 py-0.5 text-[10px] font-semibold text-[#54656F] shadow-2xs uppercase tracking-wider">
              Today
            </div>

            {/* Official WhatsApp Outgoing Message Bubble (Light Theme #DCF8C6) */}
            <div className="relative ml-auto max-w-[92%] sm:max-w-[88%] bg-[#DCF8C6] text-[#111B21] rounded-2xl rounded-tr-none px-3.5 py-3 shadow-xs border border-[#CDE8B5]/60">
              {/* WhatsApp Message Tail (pointing to the right) */}
              <svg
                className="absolute -top-[1px] -right-[7px] w-2 h-3 text-[#DCF8C6]"
                viewBox="0 0 8 12"
                fill="currentColor"
              >
                <path d="M0 0 L8 0 C5 3 2 8 0 12 Z" />
              </svg>

              {/* Message Body with WhatsApp Bold & Link Formatting */}
              <div className="text-[12.5px] leading-[18.5px] text-[#111B21] font-sans whitespace-pre-wrap select-text">
                {formatWhatsAppMessage(resolvedText)}
              </div>

              {/* Bubble Bottom: Timestamp & Blue Double Checkmarks */}
              <div className="mt-2 flex items-center justify-end gap-1">
                <span className="text-[10px] text-slate-500 font-medium">
                  {timestamp}
                </span>
                {/* Official Double Blue Checkmark */}
                <svg
                  className="w-3.5 h-3 text-[#53BDEB]"
                  viewBox="0 0 16 11"
                  fill="currentColor"
                >
                  <path d="M11.045 0.585L11.988 1.528 5.858 7.658 2.558 4.358 3.502 3.415 5.858 5.772 11.045 0.585ZM14.345 0.585L15.288 1.528 9.158 7.658 8.215 6.715 14.345 0.585ZM9.158 9.545L5.858 6.245 6.801 5.302 9.158 7.658 14.345 2.472 15.288 3.415 9.158 9.545Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Official WhatsApp Android Bottom Input Bar (Light Theme) */}
          <div className="z-20 flex shrink-0 items-center gap-1.5 bg-[#EFEAE2] p-2.5 pt-1.5 border-t border-[#DFD8CE]/50">
            {/* White Rounded Input Pill */}
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-xs border border-slate-200/50">
              {/* Emoji Smiley Icon */}
              <button type="button" className="text-slate-500 hover:text-slate-700">
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} />
                  <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} />
                </svg>
              </button>

              {/* Message Placeholder */}
              <span className="flex-1 text-xs text-slate-400 font-normal">
                Message
              </span>

              {/* Paperclip Attachment Icon */}
              <button type="button" className="text-slate-500 hover:text-slate-700">
                <svg
                  className="size-4.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              {/* Camera Icon */}
              <button type="button" className="text-slate-500 hover:text-slate-700">
                <svg
                  className="size-4.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>

            {/* Circular Green Microphone Button (#00A884) */}
            <button
              type="button"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#00A884] text-white shadow-sm hover:bg-[#008f6f] transition"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>

          {/* Samsung One UI Bottom Gesture Bar */}
          <div className="flex shrink-0 justify-center bg-[#EFEAE2] pb-1.5">
            <div className="h-[3.5px] w-28 rounded-full bg-neutral-400/90" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileMockup;
