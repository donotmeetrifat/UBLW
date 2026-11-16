"use client";
import * as React from "react";
import { forwardRef, createElement, type SVGAttributes, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { cn } from "@/lib/utils";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import AiProductCard from "@/components/AiProductCard";
const CHATCN_CSS = ":root{--chatcn-accent:var(--chatcn-gray-1000);--chatcn-alpha-200:oklch(0 0 0 / 0.05);--chatcn-alpha-300:oklch(0 0 0 / 0.08);--chatcn-alpha-500:oklch(0 0 0 / 0.14);--chatcn-alpha-600:oklch(0 0 0 / 0.2);--chatcn-bg:oklch(1 0 0);--chatcn-bg-subtle:oklch(0.985 0 0);--chatcn-border:var(--chatcn-gray-400);--chatcn-border-strong:var(--chatcn-gray-600);--chatcn-card:oklch(1 0 0);--chatcn-ease-out:cubic-bezier(0.23, 1, 0.32, 1);--chatcn-ease-out-soft:cubic-bezier(0.25, 0.46, 0.45, 0.94);--chatcn-ease-standard:ease;--chatcn-fg:var(--chatcn-gray-1000);--chatcn-fg-faint:var(--chatcn-gray-700);--chatcn-fg-muted:var(--chatcn-gray-900);--chatcn-fg-subtle:var(--chatcn-gray-800);--chatcn-fill:var(--chatcn-gray-100);--chatcn-fill-active:var(--chatcn-gray-300);--chatcn-fill-hover:var(--chatcn-gray-200);--chatcn-gray-100:oklch(0.970 0 0);--chatcn-gray-1000:oklch(0.145 0 0);--chatcn-gray-200:oklch(0.950 0 0);--chatcn-gray-300:oklch(0.930 0 0);--chatcn-gray-400:oklch(0.910 0 0);--chatcn-gray-600:oklch(0.800 0 0);--chatcn-gray-700:oklch(0.700 0 0);--chatcn-gray-800:oklch(0.525 0 0);--chatcn-gray-900:oklch(0.440 0 0);--chatcn-inset:oklch(0.975 0 0);--chatcn-press-scale:0.97;--chatcn-press-scale-icon:0.94;--chatcn-primary:var(--chatcn-gray-1000);--chatcn-primary-fg:var(--chatcn-bg);--chatcn-primary-hover:var(--chatcn-gray-900);--chatcn-radius-2xl:24px;--chatcn-radius-lg:12px;--chatcn-radius-md:8px;--chatcn-radius-sm:6px;--chatcn-radius-xl:16px;--chatcn-radius-xs:4px;--chatcn-red:oklch(0.560 0.200 27);--chatcn-scrollbar:var(--chatcn-alpha-500);--chatcn-scrollbar-hover:var(--chatcn-alpha-600);--chatcn-shadow-border:0 0 0 1px oklch(0 0 0 / 0.08);--chatcn-shadow-lg:0 0 0 1px oklch(0 0 0 / 0.06), 0 4px 8px -2px oklch(0 0 0 / 0.06), 0 16px 32px -8px oklch(0 0 0 / 0.12);--chatcn-shadow-md:0 0 0 1px oklch(0 0 0 / 0.06), 0 2px 4px -1px oklch(0 0 0 / 0.06), 0 8px 16px -4px oklch(0 0 0 / 0.08);--chatcn-shadow-sm:0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04);--chatcn-shadow-xs:0 0 0 1px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.04);--chatcn-surface:oklch(1 0 0)}.dark{--chatcn-accent:var(--chatcn-gray-1000);--chatcn-alpha-200:oklch(1 0 0 / 0.06);--chatcn-alpha-300:oklch(1 0 0 / 0.09);--chatcn-alpha-500:oklch(1 0 0 / 0.16);--chatcn-alpha-600:oklch(1 0 0 / 0.24);--chatcn-bg:oklch(0.145 0 0);--chatcn-bg-subtle:oklch(0.178 0 0);--chatcn-border:var(--chatcn-gray-400);--chatcn-border-strong:var(--chatcn-gray-600);--chatcn-card:oklch(0.175 0 0);--chatcn-fg:var(--chatcn-gray-1000);--chatcn-fg-faint:var(--chatcn-gray-700);--chatcn-fg-muted:var(--chatcn-gray-900);--chatcn-fg-subtle:var(--chatcn-gray-800);--chatcn-fill:var(--chatcn-gray-100);--chatcn-fill-active:var(--chatcn-gray-300);--chatcn-fill-hover:var(--chatcn-gray-200);--chatcn-gray-100:oklch(0.195 0 0);--chatcn-gray-1000:oklch(0.970 0 0);--chatcn-gray-200:oklch(0.225 0 0);--chatcn-gray-300:oklch(0.255 0 0);--chatcn-gray-400:oklch(0.285 0 0);--chatcn-gray-600:oklch(0.410 0 0);--chatcn-gray-700:oklch(0.500 0 0);--chatcn-gray-800:oklch(0.620 0 0);--chatcn-gray-900:oklch(0.720 0 0);--chatcn-inset:oklch(0.155 0 0);--chatcn-primary:var(--chatcn-gray-1000);--chatcn-primary-fg:var(--chatcn-bg);--chatcn-primary-hover:var(--chatcn-gray-900);--chatcn-red:oklch(0.700 0.175 22);--chatcn-scrollbar:var(--chatcn-alpha-500);--chatcn-scrollbar-hover:var(--chatcn-alpha-600);--chatcn-shadow-border:0 0 0 1px oklch(1 0 0 / 0.08);--chatcn-shadow-lg:0 0 0 1px oklch(1 0 0 / 0.1), inset 0 1px 0 oklch(1 0 0 / 0.05), 0 16px 32px -8px oklch(0 0 0 / 0.6);--chatcn-shadow-md:0 0 0 1px oklch(1 0 0 / 0.09), inset 0 1px 0 oklch(1 0 0 / 0.04), 0 8px 16px -4px oklch(0 0 0 / 0.5);--chatcn-shadow-sm:0 0 0 1px oklch(1 0 0 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.03), 0 2px 4px oklch(0 0 0 / 0.4);--chatcn-shadow-xs:0 0 0 1px oklch(1 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.4);--chatcn-surface:oklch(0.205 0 0)}.chatcn-focus{}.chatcn-focus:focus-visible{outline: 2px solid var(--chatcn-accent); outline-offset: 2px;}.chatcn-shimmer{color: transparent; background-image: linear-gradient(90deg, var(--chatcn-fg-subtle) 0%, var(--chatcn-fg-subtle) 40%, var(--chatcn-fg) 50%, var(--chatcn-fg-subtle) 60%, var(--chatcn-fg-subtle) 100%); background-size: 250% 100%; background-clip: text; -webkit-background-clip: text; animation: chatcn-shimmer 1.6s linear infinite;}.chatcn-spin{animation: chatcn-spin 0.8s linear infinite;}.chatcn-scroll{scrollbar-width: thin; scrollbar-color: var(--chatcn-scrollbar) transparent;}.chatcn-scroll:hover{scrollbar-color: var(--chatcn-scrollbar-hover) transparent;}.chatcn-scroll::-webkit-scrollbar{width: 10px; height: 10px;}.chatcn-scroll::-webkit-scrollbar-track, .chatcn-scroll::-webkit-scrollbar-corner{background: transparent;}.chatcn-scroll::-webkit-scrollbar-thumb{background-color: var(--chatcn-scrollbar); background-clip: content-box; border: 3px solid transparent; border-radius: 9999px;}.chatcn-scroll::-webkit-scrollbar-thumb:hover{background-color: var(--chatcn-scrollbar-hover);}.chatcn-scroll-fade{}@supports (animation-timeline: scroll()){.chatcn-scroll-fade{mask-size: 100% calc(100% + 24px); mask-repeat: no-repeat; animation: chatcn-scroll-fade linear both; animation-timeline: scroll(self); animation-range: 0 48px;}}@keyframes chatcn-spin { to { transform: rotate(360deg); } }@keyframes chatcn-shimmer { from { background-position: 100% 0; } to { background-position: 0% 0; } }@keyframes chatcn-scroll-fade { from { mask-image: linear-gradient(to bottom, transparent, #000 24px); mask-position: 0 -24px; } to { mask-image: linear-gradient(to bottom, transparent, #000 24px); mask-position: 0 0; } }@media (prefers-reduced-motion: reduce){.chatcn-shimmer{animation:none;color:var(--chatcn-fg-subtle);background-image:none}}@media (prefers-reduced-motion: reduce){:root{--chatcn-press-scale:1;--chatcn-press-scale-icon:1;--chatcn-enter-scale:1}}";
const EXTRA_CHATCN_CSS = `
[data-slot="voice-session"] {
    background-color: var(--chatcn-card, #ffffff);
    color: var(--chatcn-fg, #141414);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.bg-\\(color\\:--chatcn-card\\) { background-color: var(--chatcn-card) !important; }
.bg-\\(color\\:--chatcn-bg\\) { background-color: var(--chatcn-bg) !important; }
.bg-\\(color\\:--chatcn-bg-subtle\\) { background-color: var(--chatcn-bg-subtle) !important; }
.bg-\\(color\\:--chatcn-fill\\) { background-color: var(--chatcn-fill) !important; }
.bg-\\(color\\:--chatcn-fill-hover\\) { background-color: var(--chatcn-fill-hover) !important; }
.bg-\\(color\\:--chatcn-fill-active\\) { background-color: var(--chatcn-fill-active) !important; }
.bg-\\(color\\:--chatcn-primary\\) { background-color: var(--chatcn-primary) !important; }
.text-\\(color\\:--chatcn-fg\\) { color: var(--chatcn-fg) !important; }
.text-\\(color\\:--chatcn-fg-muted\\) { color: var(--chatcn-fg-muted) !important; }
.text-\\(color\\:--chatcn-fg-subtle\\) { color: var(--chatcn-fg-subtle) !important; }
.text-\\(color\\:--chatcn-primary-fg\\) { color: var(--chatcn-primary-fg) !important; }
.text-\\(color\\:--chatcn-red\\) { color: var(--chatcn-red) !important; }
.border-\\(color\\:--chatcn-border\\) { border-color: var(--chatcn-border) !important; }
.border-\\(color\\:--chatcn-border-strong\\) { border-color: var(--chatcn-border-strong) !important; }

/* Premium Keyframe Animations */
@keyframes orbAuraBreathe {
    0%, 100% {
        transform: translate(-50%, -50%) scale(0.92);
        opacity: 0.6;
    }
    50% {
        transform: translate(-50%, -50%) scale(1.08);
        opacity: 0.95;
    }
}

@keyframes orbPulseWave {
    0%, 100% {
        transform: translate(-50%, -50%) scale(0.94);
        opacity: 0.65;
    }
    50% {
        transform: translate(-50%, -50%) scale(1.12);
        opacity: 1;
    }
}

@keyframes orbSpinGlow {
    0% {
        transform: translate(-50%, -50%) rotate(0deg) scale(0.95);
    }
    50% {
        transform: translate(-50%, -50%) rotate(180deg) scale(1.06);
    }
    100% {
        transform: translate(-50%, -50%) rotate(360deg) scale(0.95);
    }
}

@keyframes transcriptGlideIn {
    0% {
        opacity: 0;
        transform: translateY(10px) scale(0.985);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes transcriptGroupFade {
    0% {
        opacity: 0;
        transform: translateY(6px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes interimBreathing {
    0% { opacity: 0.55; transform: translateX(0); }
    100% { opacity: 0.95; transform: translateX(1.5px); }
}

@keyframes textStatusFadeIn {
    0% {
        opacity: 0;
        transform: translateY(-4px) scale(0.96);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes modalBackdropFade {
    0% {
        opacity: 0;
        backdrop-filter: blur(0px);
    }
    100% {
        opacity: 1;
        backdrop-filter: blur(12px);
    }
}

@keyframes modalLuxuryPop {
    0% {
        opacity: 0;
        transform: scale(0.94) translateY(14px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* Transcript Animations */
[data-slot="transcript-group"] {
    animation: transcriptGroupFade 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
}

[data-slot="transcript-segment"] {
    animation: transcriptGlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
    transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

[data-slot="transcript-segment"]:hover {
    background-color: rgba(108, 48, 110, 0.035) !important;
}

[data-slot="transcript-interim"] {
    display: inline-block;
    animation: interimBreathing 1.2s ease-in-out infinite alternate;
    font-style: italic;
    color: #6b7280;
}

/* Call Control Buttons & Luxury Micro-Interactions */
[data-slot="voice-controls"] {
    background: #ffffff !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    box-shadow: 0 10px 30px -4px rgba(108, 48, 110, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px #EFE0EF !important;
    border-radius: 9999px !important;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
    border: 1px solid #EFE0EF !important;
}
.dark [data-slot="voice-controls"] {
    background: #241224 !important;
    border: 1px solid rgba(239, 224, 239, 0.2) !important;
    box-shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
}

/* 1. Luxury Microphone Button */
[data-slot="voice-controls-mute"] {
    background-color: #FAF6FA !important;
    border: 1.5px solid #E5D5E5 !important;
    color: #6C306E !important;
    border-radius: 9999px !important;
    width: 42px !important;
    height: 42px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    box-shadow: 0 2px 6px rgba(108, 48, 110, 0.06) !important;
}
.dark [data-slot="voice-controls-mute"] {
    background-color: rgba(108, 48, 110, 0.25) !important;
    border-color: rgba(239, 224, 239, 0.3) !important;
    color: #F5EDF5 !important;
}
[data-slot="voice-controls-mute"]:hover {
    transform: translateY(-1.5px) scale(1.06) !important;
    background-color: #F3E4F3 !important;
    border-color: #6C306E !important;
    box-shadow: 0 6px 18px rgba(108, 48, 110, 0.22) !important;
}
.dark [data-slot="voice-controls-mute"]:hover {
    background-color: rgba(108, 48, 110, 0.45) !important;
    border-color: #D1A3D1 !important;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35) !important;
}
[data-slot="voice-controls-mute"]:active {
    transform: translateY(0.5px) scale(0.96) !important;
}
[data-slot="voice-controls-mute"] svg,
[data-slot="voice-controls-mute"] svg * {
    stroke: #6C306E !important;
    color: #6C306E !important;
    transition: stroke 0.2s ease, transform 0.22s ease !important;
}
.dark [data-slot="voice-controls-mute"] svg,
.dark [data-slot="voice-controls-mute"] svg * {
    stroke: #F5EDF5 !important;
    color: #F5EDF5 !important;
}
[data-slot="voice-controls-mute"]:hover svg,
[data-slot="voice-controls-mute"]:hover svg * {
    stroke: #531E55 !important;
    color: #531E55 !important;
    transform: scale(1.08) !important;
}
.dark [data-slot="voice-controls-mute"]:hover svg,
.dark [data-slot="voice-controls-mute"]:hover svg * {
    stroke: #FFFFFF !important;
    color: #FFFFFF !important;
}
/* Muted State */
[data-slot="voice-controls-mute"][data-muted] {
    background-color: #FEF2F2 !important;
    border-color: #FCA5A5 !important;
    color: #DC2626 !important;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15) !important;
}
.dark [data-slot="voice-controls-mute"][data-muted] {
    background-color: rgba(185, 28, 28, 0.25) !important;
    border-color: #EF4444 !important;
    color: #FCA5A5 !important;
}
[data-slot="voice-controls-mute"][data-muted] svg,
[data-slot="voice-controls-mute"][data-muted] svg * {
    stroke: #DC2626 !important;
    color: #DC2626 !important;
}
.dark [data-slot="voice-controls-mute"][data-muted] svg,
.dark [data-slot="voice-controls-mute"][data-muted] svg * {
    stroke: #FCA5A5 !important;
    color: #FCA5A5 !important;
}
[data-slot="voice-controls-mute"][data-muted]:hover {
    background-color: #FEE2E2 !important;
    border-color: #EF4444 !important;
}

/* 2. Luxury Keyboard Button */
[data-slot="voice-controls-keyboard"] {
    background-color: #FAF6FA !important;
    border: 1.5px solid #E5D5E5 !important;
    color: #6C306E !important;
    border-radius: 9999px !important;
    width: 42px !important;
    height: 42px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    box-shadow: 0 2px 6px rgba(108, 48, 110, 0.06) !important;
}
.dark [data-slot="voice-controls-keyboard"] {
    background-color: rgba(108, 48, 110, 0.25) !important;
    border-color: rgba(239, 224, 239, 0.3) !important;
    color: #F5EDF5 !important;
}
[data-slot="voice-controls-keyboard"]:hover {
    transform: translateY(-1.5px) scale(1.06) !important;
    background-color: #F3E4F3 !important;
    border-color: #6C306E !important;
    box-shadow: 0 6px 18px rgba(108, 48, 110, 0.22) !important;
}
.dark [data-slot="voice-controls-keyboard"]:hover {
    background-color: rgba(108, 48, 110, 0.45) !important;
    border-color: #D1A3D1 !important;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35) !important;
}
[data-slot="voice-controls-keyboard"]:active {
    transform: translateY(0.5px) scale(0.96) !important;
}
[data-slot="voice-controls-keyboard"] svg,
[data-slot="voice-controls-keyboard"] svg * {
    stroke: #6C306E !important;
    color: #6C306E !important;
    transition: stroke 0.2s ease, transform 0.22s ease !important;
}
.dark [data-slot="voice-controls-keyboard"] svg,
.dark [data-slot="voice-controls-keyboard"] svg * {
    stroke: #F5EDF5 !important;
    color: #F5EDF5 !important;
}
[data-slot="voice-controls-keyboard"]:hover svg,
[data-slot="voice-controls-keyboard"]:hover svg * {
    stroke: #531E55 !important;
    color: #531E55 !important;
    transform: scale(1.08) !important;
}
.dark [data-slot="voice-controls-keyboard"]:hover svg,
.dark [data-slot="voice-controls-keyboard"]:hover svg * {
    stroke: #FFFFFF !important;
    color: #FFFFFF !important;
}

/* 3. Luxury End Call Button */
[data-slot="voice-controls-end"] {
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%) !important;
    color: #ffffff !important;
    border-radius: 9999px !important;
    font-weight: 700 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    border: none !important;
    cursor: pointer !important;
    padding-left: 18px !important;
    padding-right: 20px !important;
    height: 42px !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
[data-slot="voice-controls-end"]:hover {
    background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%) !important;
    transform: translateY(-1.5px) scale(1.04) !important;
    box-shadow: 0 6px 22px rgba(239, 68, 68, 0.58), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
}
[data-slot="voice-controls-end"]:active {
    transform: translateY(0.5px) scale(0.96) !important;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4) !important;
}
[data-slot="voice-controls-end"] svg,
[data-slot="voice-controls-end"] svg * {
    color: #ffffff !important;
    stroke: #ffffff !important;
    fill: none !important;
    transition: transform 0.25s ease !important;
}
[data-slot="voice-controls-end"]:hover svg {
    transform: rotate(12deg) scale(1.1) !important;
}

/* Luxury Tooltip Palette */
[data-slot="tooltip"] {
    background: #4A1E4C !important;
    color: #FAF6FA !important;
    border: 1px solid rgba(239, 224, 239, 0.25) !important;
    box-shadow: 0 4px 14px rgba(74, 30, 76, 0.3) !important;
    border-radius: 8px !important;
    font-size: 0.75rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.01em !important;
    padding: 4px 8px !important;
}

[data-slot="voice-control-button"][aria-pressed="true"] {
    background-color: rgba(108, 48, 110, 0.12) !important;
    color: #6C306E !important;
    box-shadow: inset 0 0 0 1px rgba(108, 48, 110, 0.25) !important;
}

[data-slot="voice-session-mode"] {
    background: rgba(0, 0, 0, 0.04) !important;
    border: 1px solid rgba(0, 0, 0, 0.06) !important;
    border-radius: 9999px !important;
    padding: 3px !important;
    transition: all 0.2s ease !important;
}
.dark [data-slot="voice-session-mode"] {
    background: rgba(255, 255, 255, 0.06) !important;
    border-color: rgba(255, 255, 255, 0.08) !important;
}
[data-slot="voice-session-mode"] button {
    border-radius: 9999px !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    font-weight: 600 !important;
}
[data-slot="voice-session-mode"] button:hover {
    transform: translateY(-0.5px) scale(1.02) !important;
}
[data-slot="voice-session-mode"] button[aria-checked="true"] {
    background: #ffffff !important;
    color: #6C306E !important;
    box-shadow: 0 2px 8px rgba(108, 48, 110, 0.15), 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}
.dark [data-slot="voice-session-mode"] button[aria-checked="true"] {
    background: #27272a !important;
    color: #f472b6 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

[data-slot="send-button"]:not([data-empty]) {
    background: linear-gradient(135deg, #6C306E 0%, #53144C 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 2px 10px rgba(108, 48, 110, 0.35) !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
[data-slot="send-button"]:not([data-empty]):hover {
    transform: translateY(-1.5px) scale(1.08) !important;
    box-shadow: 0 4px 16px rgba(108, 48, 110, 0.5) !important;
}
[data-slot="send-button"]:not([data-empty]):active {
    transform: translateY(0) scale(0.92) !important;
}
`;

if (typeof document !== "undefined" && !document.getElementById("chatcn-voice-session")) {
    const style = document.createElement("style");
    style.id = "chatcn-voice-session";
    style.textContent = CHATCN_CSS + EXTRA_CHATCN_CSS;
    document.head.appendChild(style);
}
export type VoiceSessionState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "interrupted" | "muted" | "reconnecting" | "error" | "ended";
type TranscriptRole = "user" | "assistant" | "system";
export interface TranscriptSegment {
    id: string;
    role: TranscriptRole;
    speaker?: string;
    text: string;
    interim?: string;
    at?: number;
    channel?: "voice" | "text";
    interrupted?: boolean;
    unspoken?: string;
    live?: boolean;
    products?: any[];
}
export type ChatcnLevel = number | (() => number);
type AudioVisualizerVariant = "bars" | "radial" | "grid" | "line" | "dots";
export type VoiceSessionMode = "voice" | "text";
interface ChatcnAudioDevice {
    id: string;
    label: string;
    isDefault?: boolean;
}
type ChatcnMicrophoneError = "not-allowed" | "not-found" | "unsupported" | "unknown";
type VoiceControlsSize = "md" | "lg";
interface VoiceControlsProps extends Omit<React.ComponentProps<"div">, "children"> {
    muted?: boolean;
    onMutedChange?: (muted: boolean) => void;
    onModeChange?: (mode: VoiceSessionMode) => void;
    captions?: boolean;
    onCaptionsChange?: (on: boolean) => void;
    microphones?: ChatcnAudioDevice[];
    microphone?: string;
    onMicrophoneChange?: (id: string) => void;
    speakers?: ChatcnAudioDevice[];
    speaker?: string;
    onSpeakerChange?: (id: string) => void;
    inputLevel?: ChatcnLevel;
    micError?: ChatcnMicrophoneError;
    onRetryMicrophone?: () => void;
    status?: "connecting" | "active" | "ended";
    onEnd?: () => void;
    onClose?: () => void;
    endLabel?: string;
    disabled?: boolean;
    size?: VoiceControlsSize;
    children?: React.ReactNode;
}
export type VoiceSessionControls = Omit<VoiceControlsProps, "muted" | "onMutedChange" | "captions" | "onCaptionsChange" | "onEnd" | "status" | "inputLevel">;
export interface VoiceSessionProps extends Omit<React.ComponentProps<"div">, "title"> {
    state: VoiceSessionState;
    segments: TranscriptSegment[];
    inputLevel?: ChatcnLevel;
    outputLevel?: ChatcnLevel;
    visual?: "orb" | AudioVisualizerVariant;
    mode?: VoiceSessionMode;
    defaultMode?: VoiceSessionMode;
    onModeChange?: (mode: VoiceSessionMode) => void;
    onSendText?: (text: string) => void;
    onQuickAdd?: (product: any) => void;
    muted?: boolean;
    onMutedChange?: (muted: boolean) => void;
    captions?: boolean;
    defaultCaptions?: boolean;
    onCaptionsChange?: (captions: boolean) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onClose?: () => void;
    onReconnect?: () => void;
    onInterrupt?: () => void;
    startedAt?: number;
    endedAt?: number;
    title?: string;
    userLabel?: string;
    errorMessage?: React.ReactNode;
    controls?: VoiceSessionControls;
    placeholder?: string;
    language?: 'en' | 'bn';
    onLanguageChange?: (lang: 'en' | 'bn') => void;
}
function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
    const [inner, setInner] = React.useState(initial);
    const current = value ?? inner;
    const set = React.useCallback((next: T) => {
        if (value === undefined)
            setInner(next);
        onChange?.(next);
    }, [value, onChange]);
    return [current, set] as const;
}
function useElapsed(startedAt: number | undefined, endedAt: number | undefined) {
    const [now, setNow] = React.useState<number | null>(null);
    React.useEffect(() => {
        if (startedAt === undefined || endedAt !== undefined)
            return;
        setNow(Date.now());
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [startedAt, endedAt]);
    if (startedAt === undefined)
        return undefined;
    return (endedAt ?? now ?? startedAt) - startedAt;
}
const LABELS: Record<VoiceSessionState, string> = {
    idle: "Ready",
    connecting: "Connecting",
    listening: "Listening",
    thinking: "Thinking",
    speaking: "Speaking",
    interrupted: "Go ahead",
    muted: "Muted",
    reconnecting: "Reconnecting",
    error: "Connection lost",
    ended: "Call ended",
};
function formatElapsed(ms: number) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, "0");
    if (m < 60)
        return `${m}:${ss}`;
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${ss}`;
}
type VoiceOrbState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "interrupted" | "muted" | "error";
type VoiceOrbSize = "sm" | "md" | "lg" | "xl";
interface VoiceOrbProps extends Omit<React.ComponentProps<"div">, "children"> {
    state?: VoiceOrbState;
    level?: ChatcnLevel;
    inputLevel?: ChatcnLevel;
    outputLevel?: ChatcnLevel;
    simulate?: boolean;
    size?: VoiceOrbSize | number;
    renderer?: "auto" | "canvas" | "svg";
    reducedMotion?: boolean;
    label?: string;
}
const SIZES: Record<VoiceOrbSize, number> = { sm: 40, md: 72, lg: 144, xl: 224 };
const REDUCED = "(prefers-reduced-motion: reduce)";
function useChatcnPrefersReducedMotion() {
    const [reduced, setReduced] = React.useState(false);
    React.useEffect(() => {
        const query = window.matchMedia?.(REDUCED);
        if (!query)
            return;
        const update = () => setReduced(query.matches);
        update();
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
    }, []);
    return reduced;
}
interface ChatcnSpeechLevel {
    getLevel: () => number;
    getBands: (count: number) => Float32Array;
    setSpeaking: (speaking: boolean) => void;
    isSpeaking: () => boolean;
}
interface ChatcnSpeechLevelOptions {
    seed?: number;
    syllableRate?: number;
    loudness?: number;
    floor?: number;
}
const fract = (x: number) => x - Math.floor(x);
const hash = (n: number, seed: number) => fract(Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453);
export function createChatcnSpeechLevel(options: ChatcnSpeechLevelOptions = {}): ChatcnSpeechLevel {
    const { seed = 1, syllableRate = 4.2, loudness = 0.8, floor = 0.02 } = options;
    let speaking = false;
    let envelope = floor;
    let last = 0;
    let phase = 0;
    let syllable = 0;
    const target = (t: number) => {
        if (!speaking)
            return floor + 0.01 * (0.5 + 0.5 * Math.sin(t * 7.3 + seed));
        const k = Math.floor(phase);
        const u = phase - k;
        let amp = 0.45 + 0.55 * hash(k, seed);
        if (hash(k * 1.7 + 3, seed) < 0.17)
            amp *= 0.08;
        const shape = u < 0.22 ? (u / 0.22) ** 0.7 : (1 - (u - 0.22) / 0.78) ** 1.5;
        const contour = 0.78 + 0.22 * Math.sin(t * 0.55 + seed * 2);
        return loudness * contour * (0.12 + 0.88 * amp * shape);
    };
    const getLevel = () => {
        const now = performance.now();
        if (now - last < 8)
            return envelope;
        const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
        last = now;
        const t = now / 1000;
        const k = Math.floor(phase);
        phase += dt * syllableRate * (0.8 + 0.4 * hash(k * 3.1, seed));
        syllable = k;
        const goal = target(t);
        const rate = goal > envelope ? 28 : 9;
        envelope += (goal - envelope) * (1 - Math.exp(-rate * dt));
        return envelope;
    };
    const getBands = (count: number) => {
        const level = getLevel();
        const out = new Float32Array(Math.max(0, count));
        const t = performance.now() / 1000;
        const f1 = 0.16 + 0.1 * hash(syllable * 2.3, seed);
        const f2 = 0.42 + 0.18 * hash(syllable * 5.9 + 1, seed);
        for (let i = 0; i < count; i++) {
            const x = count === 1 ? 0.5 : i / (count - 1);
            const bump = Math.exp(-(((x - f1) / 0.14) ** 2)) + 0.75 * Math.exp(-(((x - f2) / 0.2) ** 2));
            const air = 0.18 * (1 - x);
            const flicker = 0.85 + 0.15 * Math.sin(t * 23 + i * 1.9 + seed);
            out[i] = Math.min(1, level * (bump + air) * flicker * 1.15);
        }
        return out;
    };
    return {
        getLevel,
        getBands,
        setSpeaking: (next) => {
            speaking = next;
        },
        isSpeaking: () => speaking,
    };
}
const clamp01 = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0);
export function readLevel(level: ChatcnLevel | undefined): number {
    if (level === undefined)
        return 0;
    return clamp01(typeof level === "function" ? level() : level);
}
const voiceOrbStateLabels: Record<VoiceOrbState, string> = {
    idle: "Ready",
    connecting: "Connecting",
    listening: "Listening",
    thinking: "Thinking",
    speaking: "Speaking",
    interrupted: "Interrupted",
    muted: "Muted",
    error: "Disconnected",
};
interface OrbForm {
    scale: number;
    flow: number;
    stir: number;
    wave: number;
    travel: number;
    turn: number;
    breathe: number;
    ink: number;
    back: number;
    trace: number;
    dots: number;
    split: number;
    squash: number;
    shimmer: number;
}
function withLevel(form: OrbForm, state: VoiceOrbState, level: number): OrbForm {
    if (state === "listening") {
        return {
            ...form,
            scale: form.scale + 0.06 * level,
            flow: form.flow + 0.05 * level,
            stir: form.stir + 1.1 * level,
            wave: form.wave + 0.05 * level,
            travel: form.travel - 2.2 * level,
        };
    }
    if (state === "speaking") {
        return {
            ...form,
            scale: form.scale + 0.08 * level,
            flow: form.flow + 0.03 * level,
            stir: form.stir + 1.4 * level,
            wave: form.wave + 0.065 * level,
            travel: form.travel + 2.6 * level,
        };
    }
    return form;
}
function f(partial: Partial<OrbForm>): OrbForm {
    return {
        scale: 0.9,
        flow: 0,
        stir: 0,
        wave: 0,
        travel: 0,
        turn: 0,
        breathe: 0,
        ink: 1,
        back: 0.11,
        trace: 1,
        dots: 0,
        split: 0,
        squash: 0,
        shimmer: 0,
        ...partial,
    };
}
const FORMS: Record<VoiceOrbState, OrbForm> = {
    idle: f({ flow: 0.022, stir: 0.32, turn: 0.1, breathe: 0.014 }),
    connecting: f({ scale: 0.86, flow: 0.012, stir: 0.4, turn: 0.5, trace: 0.3, back: 0.08 }),
    listening: f({ flow: 0.03, stir: 0.6, wave: 0.014, travel: -0.9, turn: 0.16, breathe: 0.01 }),
    thinking: f({ scale: 0.84, flow: 0.08, stir: 1.3, turn: 1, breathe: 0.024, shimmer: 1 }),
    speaking: f({ flow: 0.026, stir: 0.7, wave: 0.02, travel: 1.3, turn: 0.22 }),
    interrupted: f({ scale: 0.88, flow: 0.016, squash: 0.16, back: 0.1 }),
    muted: f({ scale: 0.86, ink: 0.62, back: 0.05, dots: 1 }),
    error: f({ scale: 0.86, ink: 0.55, back: 0.06, split: 1 }),
};
const STILL_LEVEL = 0.4;
function stillForm(state: VoiceOrbState): OrbForm {
    const form = withLevel(FORMS[state], state, STILL_LEVEL);
    return { ...form, breathe: 0, trace: form.trace < 1 ? 0.55 : 1 };
}
function density(px: number) {
    return {
        lines: Math.round(Math.min(22, Math.max(5, px / 10))),
        samples: px > 120 ? 120 : px > 60 ? 84 : 56,
    };
}
interface OrbPhase {
    flow: number;
    wave: number;
    turn: number;
    breath: number;
    trace: number;
    sweep: number;
}
type Point = [
    number,
    number
];
interface Strokes {
    front: Point[][][];
    back: Point[][];
}
const BANDS = 5;
const GLOWS = 4;
const TILT = 0.36;
const COS_T = Math.cos(TILT);
const SIN_T = Math.sin(TILT);
function sphere(form: OrbForm, phase: OrbPhase, cx: number, cy: number, r: number, lines: number, samples: number): { front: Point[][][]; back: Point[][] } {
    const front: Point[][][] = Array.from({ length: BANDS * GLOWS }, () => []);
    const back: Point[][] = [];
    const breath = 1 + form.breathe * Math.sin(phase.breath);
    const radius = r * form.scale * breath;
    const sx = 1 + form.squash * 0.5;
    const sy = 1 - form.squash;
    const ct = Math.cos(phase.turn);
    const st = Math.sin(phase.turn);
    for (let i = 0; i < lines; i++) {
        const lat = -Math.PI / 2 + (Math.PI * (i + 1)) / (lines + 1);
        const cl = Math.cos(lat);
        const sl = Math.sin(lat);
        const start = phase.trace + i * 0.06;
        const off = (1 - (i + 0.5) / lines - (phase.sweep * 1.3 - 0.15)) / 0.18;
        const near = Math.exp(-off * off);
        const lit = 1 - form.shimmer * (1 - near);
        const step = Math.round(lit * (GLOWS - 1));
        let line: Point[] | null = null;
        let band = -2;
        let prev: Point | null = null;
        let prevZ = 0;
        let prevOn = false;
        for (let j = 0; j <= samples; j++) {
            const a = (j / samples) * Math.PI * 2;
            const ux = cl * Math.cos(a);
            const uy = sl;
            const uz = cl * Math.sin(a);
            const fx = ux * ct - uz * st;
            const fz = ux * st + uz * ct;
            const vy = uy * COS_T - uz * SIN_T;
            const vz = uy * SIN_T + uz * COS_T;
            const flow = 0.5 * Math.sin(2.3 * fx + 1.4 * uy + phase.flow) +
                0.3 * Math.sin(3.1 * uy - 1.9 * fz - phase.flow * 1.27 + 1.1) +
                0.2 * Math.sin(4.3 * fz + 2.6 * fx + phase.flow * 0.71 + 2.4);
            const front01 = Math.max(vz, 0);
            const distVal = Math.acos(Math.min(1, Math.max(-1, vz)));
            const wave = Math.sin(distVal * 8 - phase.wave) * front01;
            const give = 0.3 + 0.7 * cl;
            const rr = radius * (1 + give * (form.flow * flow + form.wave * wave));
            const lift = form.wave * wave * radius * 0.7 * give;
            const point: Point = [cx + ux * rr * sx, cy - (vy * rr + lift) * sy];
            let on = true;
            if (form.trace < 0.985) {
                const u = (((j / samples - start) % 1) + 1) % 1;
                on = u < form.trace;
            }
            if (prev && on && prevOn) {
                const z = (prevZ + vz) / 2;
                const next = z < 0 ? -1 : Math.min(BANDS - 1, Math.floor(z * BANDS)) * GLOWS + step;
                if (next !== band || !line) {
                    line = [prev];
                    if (next < 0)
                        back.push(line);
                    else
                        (front[next] as Point[][]).push(line);
                    band = next;
                }
                line.push(point);
            }
            else {
                line = null;
                band = -2;
            }
            prev = point;
            prevZ = vz;
            prevOn = on;
        }
    }
    return { front, back };
}
const STILL_PHASE: OrbPhase = {
    flow: 1.3,
    wave: 2.2,
    turn: 0.6,
    breath: 0,
    trace: 0.15,
    sweep: 0.4,
};
const lineWeight = (px: number) => Math.min(1.6, Math.max(0.9, px / 130));
function approach(current: number, target: number, rate: number, dt: number) {
    return current + (target - current) * (1 - Math.exp(-rate * dt));
}
function polylineData(points: Point[]) {
    let d = "";
    for (let k = 0; k < points.length; k++) {
        const p = points[k] as Point;
        d += `${k ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
    }
    return d;
}
function bandStyle(index: number) {
    const z = (Math.floor(index / GLOWS) + 0.5) / BANDS;
    const lit = (index % GLOWS) / (GLOWS - 1);
    return { alpha: (0.28 + 0.72 * z ** 0.8) * (0.45 + 0.55 * lit), weight: 0.7 + 0.55 * z };
}
function OrbSvg({ state, px, levelFor, reducedMotion, }: {
    state: VoiceOrbState;
    px: number;
    levelFor: () => number;
    reducedMotion: boolean;
}) {
    const id = `orb${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
    const scaleRef = React.useRef<SVGGElement>(null);
    const form = stillForm(state);
    const C = 50;
    const R = 45;
    const { lines, samples } = density(px);
    const strokes = sphere(form, STILL_PHASE, C, C, R, lines, samples);
    const unit = 100 / px;
    const weight = lineWeight(px) * unit;
    const live = !reducedMotion && (state === "listening" || state === "speaking");
    const levelRef = React.useRef(levelFor);
    levelRef.current = levelFor;
    React.useEffect(() => {
        const el = scaleRef.current;
        if (!el)
            return;
        if (!live) {
            el.style.scale = "";
            return;
        }
        let raf = 0;
        let last = 0;
        let env = 0;
        const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            if (now - last < 33)
                return;
            const dt = last ? (now - last) / 1000 : 0.033;
            last = now;
            const lvl = levelRef.current();
            env = approach(env, lvl, lvl > env ? 16 : 5, dt);
            el.style.scale = String(1 + env * 0.08);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [live]);
    const dash = form.dots > 0.5 ? `0 ${(weight * 3.2).toFixed(2)}` : undefined;
    const drawing = (<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {strokes.back.length ? (<path d={strokes.back.map(polylineData).join("")} strokeOpacity={form.back * form.ink} strokeWidth={weight * 0.7} strokeDasharray={dash}/>) : null}
      {strokes.front.map((bandLines, band) => {
            if (!bandLines.length)
                return null;
            const style = bandStyle(band);
            return (<path key={band} d={bandLines.map(polylineData).join("")} strokeOpacity={style.alpha * form.ink} strokeWidth={weight * style.weight * (form.dots > 0.5 ? 1.5 : 1)} strokeDasharray={dash}/>);
        })}
    </g>);
    return (<svg viewBox="0 0 100 100" aria-hidden="true" data-slot="voice-orb-svg" className="absolute inset-0 size-full overflow-visible">
      <defs>
        <clipPath id={`${id}-top`}>
          <rect x="0" y="0" width="100" height="50"/>
        </clipPath>
        <clipPath id={`${id}-bottom`}>
          <rect x="0" y="50" width="100" height="50"/>
        </clipPath>
      </defs>
      <g ref={scaleRef} className="origin-center transition-[scale] duration-100 ease-linear [transform-box:view-box]">
        {form.split > 0 ? (<>
            <g transform={`translate(0 ${-R * 0.06})`}>
              <g clipPath={`url(#${id}-top)`}>{drawing}</g>
            </g>
            <g transform={`translate(0 ${R * 0.06})`}>
              <g clipPath={`url(#${id}-bottom)`}>{drawing}</g>
            </g>
          </>) : (drawing)}
      </g>
    </svg>);
}
interface ChatcnVoiceColors {
    fg: string;
    muted: string;
    subtle: string;
    faint: string;
    border: string;
    fill: string;
    bg: string;
}
interface ChatcnVoiceFrame {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    dpr: number;
    t: number;
    dt: number;
    colors: ChatcnVoiceColors;
    reducedMotion: boolean;
}
type ChatcnVoiceDraw = (frame: ChatcnVoiceFrame) => boolean;
interface UseChatcnVoiceCanvasOptions {
    reducedMotion?: boolean;
}
interface ChatcnVoiceCanvas {
    ref: (element: HTMLCanvasElement | null) => void;
    invalidate: () => void;
    reducedMotion: boolean;
    supported: boolean;
}
function readColors(element: Element): ChatcnVoiceColors {
    const style = getComputedStyle(element);
    const v = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
    const fg = style.color || v("--chatcn-fg", "currentColor");
    return {
        fg,
        muted: v("--chatcn-fg-muted", fg),
        subtle: v("--chatcn-fg-subtle", fg),
        faint: v("--chatcn-fg-faint", fg),
        border: v("--chatcn-border", fg),
        fill: v("--chatcn-fill-active", fg),
        bg: v("--chatcn-bg", "transparent"),
    };
}
function useChatcnVoiceCanvas(draw: ChatcnVoiceDraw, options: UseChatcnVoiceCanvasOptions = {}): ChatcnVoiceCanvas {
    const prefersReduced = useChatcnPrefersReducedMotion();
    const reducedMotion = options.reducedMotion ?? prefersReduced;
    const [supported, setSupported] = React.useState(true);
    const drawRef = React.useRef(draw);
    drawRef.current = draw;
    const reducedRef = React.useRef(reducedMotion);
    reducedRef.current = reducedMotion;
    const s = React.useRef({
        canvas: null as HTMLCanvasElement | null,
        ctx: null as CanvasRenderingContext2D | null,
        colors: null as ChatcnVoiceColors | null,
        raf: 0,
        running: false,
        visible: true,
        last: 0,
        t: 0,
        cleanup: [] as (() => void)[],
    });
    const frame = React.useCallback((now: number) => {
        const st = s.current;
        st.raf = 0;
        const canvas = st.canvas;
        const ctx = st.ctx;
        if (!canvas || !ctx) {
            st.running = false;
            return;
        }
        const dt = st.last ? Math.min(0.05, Math.max(0, (now - st.last) / 1000)) : 1 / 60;
        st.last = now;
        st.t += dt;
        const dpr = Math.min(3, window.devicePixelRatio || 1);
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const bw = Math.max(1, Math.round(width * dpr));
        const bh = Math.max(1, Math.round(height * dpr));
        if (canvas.width !== bw || canvas.height !== bh) {
            canvas.width = bw;
            canvas.height = bh;
        }
        if (!st.colors)
            st.colors = readColors(canvas);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = 1;
        const keep = width > 0 &&
            height > 0 &&
            drawRef.current({
                ctx,
                width,
                height,
                dpr,
                t: st.t,
                dt,
                colors: st.colors,
                reducedMotion: reducedRef.current,
            });
        if (keep && st.visible) {
            st.raf = requestAnimationFrame(frameRef.current);
        }
        else {
            st.running = false;
            st.last = 0;
        }
    }, []);
    const frameRef = React.useRef(frame);
    frameRef.current = frame;
    const invalidate = React.useCallback(() => {
        const st = s.current;
        if (st.running || !st.ctx)
            return;
        st.running = true;
        st.raf = requestAnimationFrame(frameRef.current);
    }, []);
    const ref = React.useCallback((canvas: HTMLCanvasElement | null) => {
        const st = s.current;
        for (const fn of st.cleanup)
            fn();
        st.cleanup = [];
        if (st.raf)
            cancelAnimationFrame(st.raf);
        st.raf = 0;
        st.running = false;
        st.canvas = canvas;
        st.ctx = null;
        st.colors = null;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            setSupported(false);
            return;
        }
        st.ctx = ctx;
        const refreshColors = () => {
            st.colors = null;
            invalidate();
        };
        const resize = new ResizeObserver(() => invalidate());
        resize.observe(canvas);
        st.cleanup.push(() => resize.disconnect());
        const io = new IntersectionObserver((entries) => {
            const entry = entries[entries.length - 1];
            st.visible = entry ? entry.isIntersecting && !document.hidden : true;
            if (st.visible)
                invalidate();
        });
        io.observe(canvas);
        st.cleanup.push(() => io.disconnect());
        const onVisibility = () => {
            st.visible = !document.hidden;
            if (st.visible)
                invalidate();
        };
        document.addEventListener("visibilitychange", onVisibility);
        st.cleanup.push(() => document.removeEventListener("visibilitychange", onVisibility));
        const mo = new MutationObserver(refreshColors);
        mo.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "style", "data-theme"],
        });
        st.cleanup.push(() => mo.disconnect());
        const dark = window.matchMedia?.("(prefers-color-scheme: dark)");
        dark?.addEventListener("change", refreshColors);
        st.cleanup.push(() => dark?.removeEventListener("change", refreshColors));
        invalidate();
    }, [invalidate]);
    React.useEffect(() => {
        void reducedMotion;
        invalidate();
    }, [reducedMotion, invalidate]);
    React.useEffect(() => () => {
        const st = s.current;
        for (const fn of st.cleanup)
            fn();
        if (st.raf)
            cancelAnimationFrame(st.raf);
    }, []);
    return { ref, invalidate, reducedMotion, supported };
}
const KEYS = Object.keys(FORMS.idle) as (keyof OrbForm)[];
const BREATH: Partial<Record<VoiceOrbState, number>> = { idle: 4.6, listening: 3.4, thinking: 1.8 };
function tracePolyline(ctx: CanvasRenderingContext2D, points: Point[]) {
    const first = points[0] as Point;
    ctx.moveTo(first[0], first[1]);
    for (let k = 1; k < points.length; k++) {
        const p = points[k] as Point;
        ctx.lineTo(p[0], p[1]);
    }
}
function OrbCanvas({ state, levelFor, reducedMotion, onUnsupported, }: {
    state: VoiceOrbState;
    levelFor: () => number;
    reducedMotion?: boolean;
    onUnsupported: () => void;
}) {
    const stateRef = React.useRef(state);
    stateRef.current = state;
    const levelRef = React.useRef(levelFor);
    levelRef.current = levelFor;
    const m = React.useRef({
        form: { ...FORMS[state] },
        phase: { ...STILL_PHASE },
        level: 0,
        first: true,
    });
    const canvas = useChatcnVoiceCanvas(({ ctx, width, height, dt, colors, reducedMotion: reduced }) => {
        const st = m.current;
        const current = stateRef.current;
        const raw = current === "listening" || current === "speaking" ? levelRef.current() : 0;
        let form: OrbForm;
        let phase: OrbPhase;
        if (reduced) {
            form = stillForm(current);
            phase = STILL_PHASE;
            st.form = { ...form };
            st.phase = { ...STILL_PHASE };
            st.level = 0;
        }
        else {
            st.level = approach(st.level, raw, raw > st.level ? 16 : 5, dt);
            const target = withLevel(FORMS[current], current, st.level);
            for (const key of KEYS) {
                const rate = key === "split" || key === "squash" ? 11 : key === "trace" ? 4 : 6;
                st.form[key] = st.first ? target[key] : approach(st.form[key], target[key], rate, dt);
            }
            st.first = false;
            form = st.form;
            st.phase.flow += dt * form.stir;
            st.phase.wave += dt * form.travel * 6;
            st.phase.turn += dt * form.turn;
            st.phase.breath += (dt * Math.PI * 2) / (BREATH[current] ?? 3.6);
            st.phase.trace += dt * 0.42;
            st.phase.sweep = (st.phase.sweep + dt / 1.8) % 1;
            phase = st.phase;
        }
        const px = Math.min(width, height);
        const cx = width / 2;
        const cy = height / 2;
        const r = (px / 2) * 0.9;
        const { lines, samples } = density(px);
        const strokes = sphere(form, phase, cx, cy, r, lines, samples);
        const weight = lineWeight(px);
        const paint = () => {
            ctx.strokeStyle = colors.fg;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            if (form.dots > 0.5)
                ctx.setLineDash([0, weight * 3.2]);
            else if (form.dots > 0.01)
                ctx.setLineDash([weight * 6 * (1 - form.dots), weight * 3.2]);
            if (form.back > 0.005 && strokes.back.length) {
                ctx.beginPath();
                for (const line of strokes.back)
                    tracePolyline(ctx, line);
                ctx.globalAlpha = form.back * form.ink;
                ctx.lineWidth = weight * 0.7;
                ctx.stroke();
            }
            strokes.front.forEach((bandLines, band) => {
                if (!bandLines.length)
                    return;
                const style = bandStyle(band);
                ctx.beginPath();
                for (const line of bandLines)
                    tracePolyline(ctx, line);
                ctx.globalAlpha = style.alpha * form.ink;
                ctx.lineWidth = weight * style.weight * (form.dots > 0.5 ? 1.5 : 1);
                ctx.stroke();
            });
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        };
        if (form.split > 0.01) {
            const gap = form.split * r * 0.12;
            for (const half of [-1, 1]) {
                ctx.save();
                ctx.translate(0, (gap / 2) * half);
                ctx.beginPath();
                ctx.rect(0, half < 0 ? 0 : cy, width, half < 0 ? cy : height - cy);
                ctx.clip();
                paint();
                ctx.restore();
            }
        }
        else {
            paint();
        }
        if (reduced)
            return false;
        const target = withLevel(FORMS[current], current, st.level);
        const settled = KEYS.every((key) => Math.abs(st.form[key] - target[key]) < 0.0015);
        const moving = (form.stir > 0.002 && form.flow > 0.0005) ||
            form.breathe > 0.0005 ||
            form.turn > 0.002 ||
            form.trace < 0.985 ||
            form.shimmer > 0.005 ||
            (Math.abs(form.travel) > 0.002 && form.wave > 0.0005);
        return !settled || moving || st.level > 0.002;
    }, { reducedMotion });
    React.useEffect(() => {
        void state;
        canvas.invalidate();
    }, [state, canvas.invalidate]);
    React.useEffect(() => {
        if (!canvas.supported)
            onUnsupported();
    }, [canvas.supported, onUnsupported]);
    return (<canvas ref={canvas.ref} data-slot="voice-orb-canvas" className="absolute inset-0 size-full"/>);
}
export function VoiceOrbComponent({ state = "idle", level, inputLevel, outputLevel, simulate = true, size = "lg", renderer = "auto", reducedMotion: reducedProp, label, className, style, ...props }: VoiceOrbProps) {
    const px = typeof size === "number" ? size : SIZES[size];
    const prefersReduced = useChatcnPrefersReducedMotion();
    const reducedMotion = reducedProp ?? prefersReduced;
    const [canvasFailed, setCanvasFailed] = React.useState(false);
    const useSvg = renderer === "svg" || (renderer === "auto" && canvasFailed);
    const sims = React.useRef<{
        user: ChatcnSpeechLevel;
        agent: ChatcnSpeechLevel;
    } | null>(null);
    if (simulate && !sims.current) {
        sims.current = {
            user: createChatcnSpeechLevel({ seed: 3 }),
            agent: createChatcnSpeechLevel({ seed: 7, loudness: 0.85 }),
        };
    }
    React.useEffect(() => {
        const s = sims.current;
        if (!s)
            return;
        s.user.setSpeaking(simulate && state === "listening");
        s.agent.setSpeaking(simulate && state === "speaking");
    }, [simulate, state]);
    const sources = React.useRef({ level, inputLevel, outputLevel, state, simulate });
    sources.current = { level, inputLevel, outputLevel, state, simulate };
    const levelFor = React.useCallback(() => {
        const { level: l, inputLevel: i, outputLevel: o, state: st, simulate: sim } = sources.current;
        const s = sim ? sims.current : null;
        if (st === "listening") {
            const source = i ?? l;
            return source === undefined && s ? s.user.getLevel() : readLevel(source);
        }
        if (st === "speaking") {
            const source = o ?? l;
            return source === undefined && s ? s.agent.getLevel() : readLevel(source);
        }
        return 0;
    }, []);
    const onUnsupported = React.useCallback(() => setCanvasFailed(true), []);
    return (<div role="img" aria-label={label ?? `Voice: ${voiceOrbStateLabels[state].toLowerCase()}`} data-slot="voice-orb" data-voice-state={state} data-renderer={useSvg ? "svg" : "canvas"} style={{ width: px, height: px, ...style }} className={cn("text-(color:--chatcn-fg) relative shrink-0 select-none", className)} {...props}>
      {useSvg ? (<OrbSvg state={state} px={px} levelFor={levelFor} reducedMotion={reducedMotion}/>) : (<OrbCanvas state={state} levelFor={levelFor} reducedMotion={reducedProp} onUnsupported={onUnsupported}/>)}
    </div>);
}
function orbState(state: VoiceSessionState): VoiceOrbState {
    if (state === "reconnecting")
        return "connecting";
    if (state === "ended")
        return "idle";
    return state;
}
type ChatcnBands = ArrayLike<number> | ((count: number) => ArrayLike<number>);
type AudioVisualizerState = "idle" | "connecting" | "listening" | "thinking" | "speaking";
interface AudioVisualizerProps extends Omit<React.ComponentProps<"div">, "children"> {
    variant?: AudioVisualizerVariant;
    level?: ChatcnLevel;
    bands?: ChatcnBands;
    state?: AudioVisualizerState;
    count?: number;
    reducedMotion?: boolean;
    label?: string;
}
const COUNTS: Record<AudioVisualizerVariant, number> = {
    bars: 7,
    radial: 48,
    grid: 16,
    line: 40,
    dots: 9,
};
const dist = (i: number, count: number) => count <= 1 ? 0 : Math.abs(i - (count - 1) / 2) / ((count - 1) / 2);
function stillValues(state: AudioVisualizerState, count: number) {
    return Array.from({ length: count }, (_, i) => {
        const d = dist(i, count);
        if (state === "connecting")
            return i === Math.round((count - 1) / 2) ? 0.5 : 0;
        if (state === "thinking")
            return 0.22 * (1 - d * 0.5);
        if (state === "listening")
            return 0.3 * (1 - d) ** 1.2;
        if (state === "speaking")
            return 0.62 * (1 - d * 0.8) ** 1.4;
        return 0;
    });
}
function readBands(bands: ChatcnBands | undefined, count: number): number[] | undefined {
    if (bands === undefined)
        return undefined;
    const source = typeof bands === "function" ? bands(count) : bands;
    if (source.length === 0)
        return undefined;
    const out = new Array<number>(count);
    for (let i = 0; i < count; i++) {
        const from = Math.floor((i * source.length) / count);
        const to = Math.max(from + 1, Math.floor(((i + 1) * source.length) / count));
        let sum = 0;
        for (let j = from; j < to; j++)
            sum += source[j] ?? 0;
        out[i] = clamp01(sum / (to - from));
    }
    return out;
}
function wobble(t: number, seed: number) {
    return (Math.sin(t * 1.31 + seed * 7.13) * 0.5 +
        Math.sin(t * 2.17 + seed * 3.71) * 0.3 +
        Math.sin(t * 3.73 + seed * 1.37) * 0.2);
}
function synthesizeBands(level: number, count: number, t: number): number[] {
    const out = new Array<number>(count);
    for (let i = 0; i < count; i++) {
        const x = count === 1 ? 0.5 : i / (count - 1);
        const hump = 0.45 + 0.55 * Math.exp(-(((x - 0.38) / 0.32) ** 2));
        const ripple = 0.72 + 0.28 * wobble(t * 2.4, i * 0.77 + 1);
        out[i] = clamp01(level * hump * ripple * 1.25);
    }
    return out;
}
function smooth(values: number[], count: number): number[] {
    return values.map((v, i) => {
        const a = values[i - 1] ?? v;
        const b = values[i + 1] ?? v;
        return (a * 0.25 + v * 0.5 + b * 0.25) * (1 - 0.3 * dist(i, count) ** 2) * 1.1;
    });
}
function centreOut(bands: number[], count: number): number[] {
    const out = new Array<number>(count);
    const half = (count - 1) / 2;
    for (let i = 0; i < count; i++) {
        const d = Math.abs(i - half) / Math.max(1, half);
        const idx = Math.min(bands.length - 1, Math.round(d * (bands.length - 1)));
        out[i] = bands[idx] ?? 0;
    }
    return out;
}
function stateValues(state: AudioVisualizerState, count: number, t: number, circular: boolean) {
    const out = new Array<number>(count).fill(0);
    if (state === "connecting") {
        const period = 1.6;
        const u = (t % period) / period;
        const pos = circular ? u * count : (0.5 - 0.5 * Math.cos(u * Math.PI * 2)) * (count - 1);
        const width = Math.max(1, count * (circular ? 0.08 : 0.16));
        for (let i = 0; i < count; i++) {
            let d = Math.abs(i - pos);
            if (circular)
                d = Math.min(d, count - d);
            out[i] = 0.55 * Math.exp(-((d / width) ** 2));
        }
    }
    else if (state === "thinking") {
        for (let i = 0; i < count; i++) {
            const d = circular ? 0.5 : dist(i, count);
            const wave = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 1.8 - d * 2.2);
            out[i] = (0.12 + 0.22 * wave) * (1 - d * 0.35);
        }
    }
    return out;
}
const clamp = (v: number) => Math.min(1, Math.max(0, v));
interface Paint {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    values: number[];
    fg: string;
    rest: string;
}
const inkAlpha = (v: number) => 0.28 + 0.72 * clamp(v * 2.4);
function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    if (typeof (ctx as any).roundRect === "function")
        (ctx as any).roundRect(x, y, w, h, Math.min(w, h) / 2);
    else
        ctx.rect(x, y, w, h);
}
function paintBars({ ctx, width, height, values, fg }: Paint) {
    const n = values.length;
    const gapRatio = 0.6;
    const w = Math.min(height * 0.3, width / (n + (n - 1) * gapRatio));
    const gap = w * gapRatio;
    const x0 = (width - (n * w + (n - 1) * gap)) / 2;
    ctx.fillStyle = fg;
    for (let i = 0; i < n; i++) {
        const v = values[i] ?? 0;
        const h = Math.max(w, v * height);
        ctx.globalAlpha = inkAlpha(v);
        ctx.beginPath();
        pill(ctx, x0 + i * (w + gap), (height - h) / 2, w, h);
        ctx.fill();
    }
}
function paintRadial({ ctx, width, height, values, fg }: Paint) {
    const n = values.length;
    const cx = width / 2;
    const cy = height / 2;
    const outer = Math.min(width, height) / 2 - 2;
    const inner = outer * 0.48;
    const lineWidth = Math.max(1.25, Math.min(3, ((Math.PI * 2 * inner) / n) * 0.42));
    ctx.strokeStyle = fg;
    ctx.lineCap = "round";
    ctx.lineWidth = lineWidth;
    for (let i = 0; i < n; i++) {
        const v = values[i] ?? 0;
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const len = lineWidth * 0.5 + v * (outer - inner - lineWidth);
        ctx.globalAlpha = inkAlpha(v);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * (inner + len), cy + Math.sin(a) * (inner + len));
        ctx.stroke();
    }
}
function paintGrid({ ctx, width, height, values, fg, rest }: Paint) {
    const cols = values.length;
    const gap = 2;
    const cell = Math.max(2, (width - (cols - 1) * gap) / cols);
    let rows = Math.max(3, Math.floor((height + gap) / (cell + gap)));
    if (rows % 2 === 0)
        rows -= 1;
    const x0 = (width - (cols * cell + (cols - 1) * gap)) / 2;
    const y0 = (height - (rows * cell + (rows - 1) * gap)) / 2;
    const half = (rows - 1) / 2;
    const r = Math.min(2, cell / 3);
    for (let c = 0; c < cols; c++) {
        const lit = (values[c] ?? 0) * (half + 1);
        for (let row = 0; row < rows; row++) {
            const d = Math.abs(row - half);
            const amount = clamp(lit - d);
            const x = x0 + c * (cell + gap);
            const y = y0 + row * (cell + gap);
            ctx.globalAlpha = 1;
            ctx.fillStyle = rest;
            ctx.beginPath();
            if (typeof (ctx as any).roundRect === "function")
                (ctx as any).roundRect(x, y, cell, cell, r);
            else
                ctx.rect(x, y, cell, cell);
            ctx.fill();
            if (amount > 0) {
                ctx.globalAlpha = amount;
                ctx.fillStyle = fg;
                ctx.fill();
            }
        }
    }
}
function paintLine({ ctx, width, height, values, fg }: Paint) {
    const n = values.length;
    const mid = height / 2;
    const amp = height / 2 - 2;
    const step = width / Math.max(1, n - 1);
    const ys = values.map((v, i) => v * amp * Math.sin((Math.PI * i) / Math.max(1, n - 1)) ** 0.8);
    ctx.strokeStyle = fg;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (const dir of [-1, 1]) {
        ctx.globalAlpha = dir < 0 ? 1 : 0.4;
        ctx.beginPath();
        ctx.moveTo(0, mid + dir * (ys[0] ?? 0));
        for (let i = 1; i < n - 1; i++) {
            const x = i * step;
            const nx = (i + 1) * step;
            ctx.quadraticCurveTo(x, mid + dir * (ys[i] ?? 0), (x + nx) / 2, mid + dir * (((ys[i] ?? 0) + (ys[i + 1] ?? 0)) / 2));
        }
        ctx.lineTo(width, mid + dir * (ys[n - 1] ?? 0));
        ctx.stroke();
    }
}
function paintDots({ ctx, width, height, values, fg }: Paint) {
    const n = values.length;
    const pitch = width / n;
    const rMax = Math.min(pitch * 0.42, height / 2);
    const rMin = Math.max(1.5, rMax * 0.28);
    ctx.fillStyle = fg;
    for (let i = 0; i < n; i++) {
        const v = values[i] ?? 0;
        ctx.globalAlpha = inkAlpha(v);
        ctx.beginPath();
        ctx.arc(pitch * (i + 0.5), height / 2, rMin + clamp(v * 1.3) * (rMax - rMin), 0, Math.PI * 2);
        ctx.fill();
    }
}
const PAINT: Record<AudioVisualizerVariant, (p: Paint) => void> = {
    bars: paintBars,
    radial: paintRadial,
    grid: paintGrid,
    line: paintLine,
    dots: paintDots,
};
const STATE_LABELS: Record<AudioVisualizerState, string> = {
    idle: "idle",
    connecting: "connecting",
    listening: "listening",
    thinking: "thinking",
    speaking: "speaking",
};
const SIZES2: Record<AudioVisualizerVariant, string> = {
    bars: "h-16 w-40",
    radial: "size-32",
    grid: "h-16 w-48",
    line: "h-16 w-48",
    dots: "h-12 w-40",
};
export function AudioVisualizer({ variant = "bars", level, bands, state = "speaking", count: countProp, reducedMotion: reducedProp, label, className, ...props }: AudioVisualizerProps) {
    const prefersReduced = useChatcnPrefersReducedMotion();
    const reducedMotion = reducedProp ?? prefersReduced;
    const count = Math.max(1, Math.round(countProp ?? COUNTS[variant]));
    const props$ = React.useRef({ variant, level, bands, state, count });
    props$.current = { variant, level, bands, state, count };
    const values = React.useRef<number[]>([]);
    const canvas = useChatcnVoiceCanvas(({ ctx, width, height, dt, t, colors, reducedMotion: reduced }) => {
        const p = props$.current;
        const circular = p.variant === "radial";
        const n = p.count;
        if (values.current.length !== n)
            values.current = new Array<number>(n).fill(0);
        let target: number[];
        if (reduced) {
            target = stillValues(p.state, n);
        }
        else {
            const audio = p.state === "listening" || p.state === "speaking";
            const bandCount = circular ? Math.ceil(n / 2) : Math.ceil(n / 2) + 1;
            let spectrum: number[] | undefined;
            if (audio) {
                spectrum = readBands(p.bands, bandCount);
                if (!spectrum)
                    spectrum = synthesizeBands(readLevel(p.level), bandCount, t);
            }
            const laid = spectrum
                ? circular
                    ? Array.from({ length: n }, (_, i) => {
                        const d = 1 - Math.abs(1 - (2 * Math.min(i, n - i)) / (n / 2));
                        return spectrum?.[Math.min(bandCount - 1, Math.round(d * (bandCount - 1)))] ?? 0;
                    })
                    : smooth(centreOut(spectrum, n), n)
                : new Array<number>(n).fill(0);
            const motion = stateValues(p.state, n, t, circular);
            target = laid.map((v, i) => Math.max(clamp(v * 1.4) ** 0.8, motion[i] ?? 0));
        }
        const cur = values.current;
        let settled = true;
        for (let i = 0; i < n; i++) {
            const goal = target[i] ?? 0;
            const prev = cur[i] ?? 0;
            const next = reduced ? goal : approach(prev, goal, goal > prev ? 24 : 8, dt);
            cur[i] = next;
            if (Math.abs(next - goal) > 0.002)
                settled = false;
        }
        PAINT[p.variant]({ ctx, width, height, values: cur, fg: colors.fg, rest: colors.fill });
        ctx.globalAlpha = 1;
        if (reduced)
            return false;
        return !(p.state === "idle" && settled);
    }, { reducedMotion });
    React.useEffect(() => {
        void [variant, state, count, level, bands];
        canvas.invalidate();
    }, [variant, state, count, level, bands, canvas.invalidate]);
    return (<div role="img" aria-label={label ?? `Audio: ${STATE_LABELS[state]}`} data-slot="audio-visualizer" data-variant={variant} data-visualizer-state={state} className={cn("text-(color:--chatcn-fg) relative shrink-0", SIZES2[variant], className)} {...props}>
      <canvas ref={canvas.ref} className="absolute inset-0 size-full"/>
    </div>);
}
function visualizerState(state: VoiceSessionState): AudioVisualizerState {
    if (state === "connecting" || state === "reconnecting")
        return "connecting";
    if (state === "listening" || state === "thinking" || state === "speaking")
        return state;
    return "idle";
}
interface IconProps extends SVGAttributes<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    color?: string;
    title?: string;
}
type Icon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
type IconElement = "path" | "circle" | "rect" | "ellipse" | "line" | "polyline" | "polygon";
type IconNode = ReadonlyArray<readonly [
    IconElement,
    Readonly<Record<string, string>>
]>;
const toPascal = (name: string): string => name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
function createIcon(name: string, iconNode: IconNode): Icon {
    const Component = forwardRef<SVGSVGElement, IconProps>(function ChatcnIcon({ size = 24, strokeWidth = 1.5, absoluteStrokeWidth = false, color = "currentColor", title, className, children, ...rest }, ref) {
        const stroke = absoluteStrokeWidth
            ? (Number(strokeWidth) * 24) / Number.parseFloat(String(size))
            : strokeWidth;
        const labelled = Boolean(title || rest["aria-label"] || rest["aria-labelledby"]);
        return createElement("svg", {
            ref,
            xmlns: "http://www.w3.org/2000/svg",
            width: size,
            height: size,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: color,
            strokeWidth: stroke,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "data-slot": "icon",
            className: className
                ? `chatcn-icon chatcn-icon-${name} ${className}`
                : `chatcn-icon chatcn-icon-${name}`,
            ...(labelled ? { role: "img" } : { "aria-hidden": true }),
            ...rest,
        }, title ? createElement("title", null, title) : null, ...iconNode.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs })), children);
    });
    Component.displayName = `${toPascal(name)}Icon`;
    return Component;
}
const iconNode: IconNode = [
    ["path", { "d": "M2.75 10.5v3" }],
    ["path", { "d": "M6.45 7v10" }],
    ["path", { "d": "M10.15 3.5v17" }],
    ["path", { "d": "M13.85 8.5v7" }],
    ["path", { "d": "M17.55 5.5v13" }],
    ["path", { "d": "M21.25 10.5v3" }],
];
const AudioLinesIcon: Icon = createIcon("audio-lines", iconNode);
const iconNode2: IconNode = [
    ["path", { "d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }],
    ["line", { "x1": "8", "y1": "9", "x2": "16", "y2": "9" }],
    ["line", { "x1": "8", "y1": "13", "x2": "13", "y2": "13" }],
];
const MessageTextIcon: Icon = createIcon("message-text", iconNode2);
const KeyboardIcon: Icon = MessageTextIcon;
function ModeSwitch({ mode, onChange, disabled, }: {
    mode: VoiceSessionMode;
    onChange: (mode: VoiceSessionMode) => void;
    disabled?: boolean;
}) {
    const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const options = [
        { value: "voice" as const, label: "Voice", Icon: AudioLinesIcon },
        { value: "text" as const, label: "Text", Icon: MessageTextIcon },
    ];
    return (<div role="radiogroup" aria-label="Conversation mode" data-slot="voice-session-mode" className="bg-gray-100 dark:bg-zinc-800 rounded-lg inline-grid h-8 shrink-0 grid-cols-2 p-0.5 border border-gray-200/80 dark:border-zinc-700 shadow-xs">
      {options.map(({ value, label, Icon }, i) => {
            const checked = mode === value;
            return (<button key={value} ref={(node) => {
                    refs.current[i] = node;
                }} type="button" role="radio" aria-checked={checked} tabIndex={checked ? 0 : -1} disabled={disabled} onClick={() => onChange(value)} onKeyDown={(event) => {
                    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key))
                        return;
                    event.preventDefault();
                    const next = options[(i + 1) % 2];
                    if (!next)
                        return;
                    onChange(next.value);
                    refs.current[(i + 1) % 2]?.focus();
                }} className={cn("rounded-md flex items-center justify-center gap-1.5 px-3 font-semibold text-xs transition-all duration-150 select-none cursor-pointer", checked
                    ? "bg-white text-gray-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100 font-bold"
                    : "text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200")}>
            <Icon aria-hidden="true" className={cn("size-3.5 shrink-0", checked ? "text-[#6C306E] dark:text-purple-400" : "text-gray-500 dark:text-zinc-400")}/>
            {label}
          </button>);
        })}
    </div>);
}
function ShimmerText({ active = true, className, ...props }: React.ComponentProps<"span"> & {
    active?: boolean;
}) {
    return (<span data-slot="shimmer-text" className={cn("font-medium", active ? "chatcn-shimmer" : "text-(color:--chatcn-fg-subtle)", className)} {...props}/>);
}
const NBSP = " ";
interface TranscriptProps extends Omit<React.ComponentProps<"div">, "children"> {
    segments: TranscriptSegment[];
    userLabel?: string;
    assistantLabel?: string;
    follow?: boolean;
    onSeek?: (ms: number) => void;
    activeId?: string;
    showTimestamps?: boolean;
    layout?: "stacked" | "inline";
    empty?: React.ReactNode;
    label?: string;
    announce?: boolean;
    onQuickAdd?: (product: any) => void;
}
interface Group {
    key: string;
    role: TranscriptRole;
    speaker: string;
    segments: TranscriptSegment[];
}
function groupSegments(segments: TranscriptSegment[], labels: {
    user: string;
    assistant: string;
}): Group[] {
    const groups: Group[] = [];
    for (const segment of segments) {
        const speaker = segment.speaker ??
            (segment.role === "user" ? labels.user : segment.role === "assistant" ? labels.assistant : "");
        const last = groups[groups.length - 1];
        if (last &&
            segment.role !== "system" &&
            last.role === segment.role &&
            last.speaker === speaker) {
            last.segments.push(segment);
        }
        else {
            groups.push({ key: segment.id, role: segment.role, speaker, segments: [segment] });
        }
    }
    return groups;
}
interface BodyProps {
    segments: TranscriptSegment[];
    groups: Group[];
    layout: "stacked" | "inline";
    showTimestamps: boolean;
    onSeek?: (ms: number) => void;
    activeId?: string;
    empty?: React.ReactNode;
    announce: boolean;
    announceFn?: (text: string) => void;
    onQuickAdd?: (product: any) => void;
    bottomRef?: React.RefObject<HTMLDivElement | null>;
}
function useAnnounce(segments: TranscriptSegment[], enabled: boolean, announce?: (t: string) => void) {
    const seen = React.useRef<Set<string> | null>(null);
    React.useEffect(() => {
        if (seen.current === null) {
            seen.current = new Set(segments.filter((s) => !s.live && !s.interim).map((s) => s.id));
            return;
        }
        if (!enabled || !announce)
            return;
        for (const s of segments) {
            if (s.role !== "assistant" || s.live || s.interim || seen.current.has(s.id))
                continue;
            seen.current.add(s.id);
            const text = s.text.trim();
            if (text)
                announce(s.interrupted ? `${text} (interrupted)` : text);
        }
    }, [segments, enabled, announce]);
}
function formatTime(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = String(total % 60).padStart(2, "0");
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}
function spokenTime(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    const parts: string[] = [];
    if (m)
        parts.push(`${m} ${m === 1 ? "minute" : "minutes"}`);
    parts.push(`${s} ${s === 1 ? "second" : "seconds"}`);
    return parts.join(" ");
}
function Timestamp({ ms, speaker, onSeek, className, }: {
    ms: number;
    speaker: string;
    onSeek?: (ms: number) => void;
    className?: string;
}) {
    const text = formatTime(ms);
    if (!onSeek) {
        return (<time dateTime={`PT${Math.floor(ms / 1000)}S`} className={cn("text-[0.75rem]/[1rem] text-(color:--chatcn-fg-subtle) tabular-nums", className)}>
        {text}
      </time>);
    }
    return (<button type="button" onClick={() => onSeek(ms)} aria-label={`${text}, play from ${spokenTime(ms)}${speaker ? `, ${speaker}` : ""}`} data-slot="transcript-seek" className={cn("chatcn-focus text-[0.75rem]/[1rem] text-(color:--chatcn-fg-subtle) rounded-(--chatcn-radius-xs) -mx-1 px-1 tabular-nums", "hover:bg-(color:--chatcn-fill-hover) hover:text-(color:--chatcn-fg) transition-colors duration-150", "relative pointer-coarse:after:absolute pointer-coarse:after:-inset-2 pointer-coarse:after:content-['']", className)}>
      {text}
    </button>);
}
type StreamingCaretStatus = "streaming" | "waiting" | "done";
interface StreamingCaretProps extends Omit<React.ComponentProps<"span">, "children"> {
    status?: StreamingCaretStatus;
    activity?: unknown;
    idleMs?: number;
}
function StreamingCaret({ status = "streaming", activity, idleMs = 600, className, ...props }: StreamingCaretProps) {
    const [idle, setIdle] = React.useState(false);
    const tracking = activity !== undefined && status === "streaming";
    React.useEffect(() => {
        if (!tracking)
            return;
        setIdle(false);
        const id = window.setTimeout(() => setIdle(true), idleMs);
        return () => window.clearTimeout(id);
    }, [activity, tracking, idleMs]);
    if (status === "done")
        return null;
    const blinking = status === "waiting" || (tracking && idle);
    return (<span aria-hidden="true" data-slot="streaming-caret" data-caret-state={blinking ? "waiting" : "streaming"} className={cn("bg-(color:--chatcn-accent) ms-0.5 inline-block size-[0.55em] translate-y-[0.04em] rounded-[0.12em] align-baseline forced-colors:bg-[CanvasText]", blinking &&
            "animate-[chatcn-caret-blink_1.2s_steps(1,end)_infinite] motion-reduce:animate-none", className)} {...props}/>);
}
function SegmentText({ segment }: {
    segment: TranscriptSegment;
}) {
    const typed = segment.channel === "text";
    return (<>
      {typed ? (<span className="me-1.5 inline-flex translate-y-[0.12em] align-baseline">
          <KeyboardIcon aria-hidden="true" className="text-(color:--chatcn-fg-subtle) size-[1em]"/>
          <span className="sr-only">Typed: </span>
        </span>) : null}
      {segment.text}
      {segment.interim ? (<span data-slot="transcript-interim" className="text-(color:--chatcn-fg-subtle)">
          {segment.text && !/\s$/.test(segment.text) ? " " : ""}
          {segment.interim}
        </span>) : null}
      {segment.interrupted ? (<>
          <span aria-hidden="true" data-slot="transcript-cut" className="bg-(color:--chatcn-accent) mx-1 inline-block h-[1.05em] w-px translate-y-[0.18em] align-baseline"/>
          {segment.unspoken ? (<span data-slot="transcript-unspoken" className="text-(color:--chatcn-fg-subtle) decoration-(color:--chatcn-border-strong) line-through">
              <span className="sr-only">Not spoken: </span>
              {segment.unspoken}
            </span>) : null}
          <span className="text-[0.75rem]/[1rem] text-(color:--chatcn-fg-subtle) ms-2 font-medium whitespace-nowrap">
            Interrupted
          </span>
        </>) : null}
      {segment.live ? (<StreamingCaret activity={`${segment.text}${segment.interim ?? ""}`}/>) : null}
    </>);
}
function TranscriptBody({ segments, groups, layout, showTimestamps, onSeek, activeId, empty, announce, announceFn, onQuickAdd, bottomRef }: BodyProps) {
    useAnnounce(segments, announce, announceFn);
    if (segments.length === 0) {
        return (<div data-slot="transcript-empty" className="flex min-h-40 flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        {empty ?? (<>
            <AudioLinesIcon aria-hidden="true" className="text-(color:--chatcn-fg-subtle) size-5"/>
            <p className="text-[0.8125rem]/[1.25rem] text-(color:--chatcn-fg-subtle) max-w-60 text-pretty">
              What you and Emma say appears here as you talk.
            </p>
          </>)}
      </div>);
    }
    if (layout === "inline") {
        return (<div data-slot="transcript-lines" className="flex flex-col">
        {groups.flatMap((group) => group.segments.map((segment, i) => {
                const active = segment.id === activeId;
                if (group.role === "system") {
                    return (<p key={segment.id} data-slot="transcript-system" className="text-[0.75rem]/[1rem] text-(color:--chatcn-fg-subtle) py-2 text-center">
                  {segment.text}
                </p>);
                }
                return (<div key={segment.id} data-slot="transcript-segment" data-role={segment.role} data-active={active ? "" : undefined} aria-current={active ? "true" : undefined} className={cn("rounded-(--chatcn-radius-md) -mx-2 grid grid-cols-[auto_1fr] items-baseline gap-x-3 px-2 py-1 sm:grid-cols-[auto_5.5rem_1fr]", "transition-colors duration-150", active && "bg-(color:--chatcn-fill)", i === 0 && "not-first:mt-2")}>
                <span className="w-10">
                  {showTimestamps && segment.at !== undefined ? (<Timestamp ms={segment.at} speaker={group.speaker} onSeek={onSeek}/>) : null}
                </span>
                <span title={group.speaker} className={cn("text-[0.8125rem]/[1.25rem] text-(color:--chatcn-fg) truncate leading-[22px] font-medium max-sm:col-start-2", i > 0 && "max-sm:hidden sm:invisible")}>
                  {group.speaker}
                </span>
                <div className="min-w-0 max-sm:col-start-2 flex flex-col gap-1.5">
                  <p className={cn("text-[0.875rem]/[1.25rem] tracking-[-0.003em] leading-[22px] text-pretty [overflow-wrap:anywhere]", active || segment.role === "user" ? "text-(color:--chatcn-fg)" : "text-(color:--chatcn-fg-muted)")}>
                    <SegmentText segment={segment}/>
                  </p>
                  {segment.products && segment.products.length > 0 && (
                    <div className="space-y-2 mt-1 max-w-[420px]">
                      {segment.products.map((p: any) => (
                        <AiProductCard
                          key={p.id}
                          product={p}
                          onQuickAdd={onQuickAdd}
                          onCloseChat={() => {}}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>);
            }))}
        <div ref={bottomRef} className="h-4 w-full shrink-0" aria-hidden="true" />
      </div>);
    }
    return (<>
      {groups.map((group) => {
            if (group.role === "system") {
                const segment = group.segments[0] as TranscriptSegment;
                return (<div key={group.key} data-slot="transcript-system" className="text-[0.75rem]/[1rem] text-(color:--chatcn-fg-subtle) flex items-center gap-3 text-center">
              <span aria-hidden="true" className="bg-(color:--chatcn-border) h-px flex-1"/>
              <span>
                {segment.text}
                {showTimestamps && segment.at !== undefined ? (<span className="tabular-nums"> · {formatTime(segment.at)}</span>) : null}
              </span>
              <span aria-hidden="true" className="bg-(color:--chatcn-border) h-px flex-1"/>
            </div>);
            }
            const first = group.segments[0] as TranscriptSegment;
            return (<section key={group.key} data-slot="transcript-group" data-role={group.role} aria-label={group.speaker} className="flex flex-col gap-1">
            <header className="flex h-5 items-baseline gap-2">
              <span className="text-[0.8125rem]/[1.25rem] text-(color:--chatcn-fg-muted) font-medium">
                {group.speaker}
              </span>
              {showTimestamps && first.at !== undefined ? (<Timestamp ms={first.at} speaker={group.speaker} onSeek={onSeek}/>) : null}
            </header>
            <div className="flex flex-col gap-2">
              {group.segments.map((segment) => {
                    const active = segment.id === activeId;
                    return (
                      <div key={segment.id} className="flex flex-col gap-1.5">
                        <p data-slot="transcript-segment" data-role={segment.role} data-active={active ? "" : undefined} aria-current={active ? "true" : undefined} className={cn("text-[0.9375rem]/[1.5rem] tracking-[-0.006em] text-(color:--chatcn-fg) max-w-[68ch] text-pretty [overflow-wrap:anywhere]", "rounded-(--chatcn-radius-sm) -mx-2 px-2 transition-colors duration-150", active && "bg-(color:--chatcn-fill)")}>
                          <SegmentText segment={segment}/>
                        </p>
                        {segment.products && segment.products.length > 0 && (
                          <div className="space-y-2 mt-1 max-w-[420px]">
                            {segment.products.map((p: any) => (
                              <AiProductCard
                                key={p.id}
                                product={p}
                                onQuickAdd={onQuickAdd}
                                onCloseChat={() => {}}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                })}
            </div>
          </section>);
        })}
        {/* Dedicated auto-scroll target element */}
        <div ref={bottomRef} className="h-4 w-full shrink-0" aria-hidden="true" />
    </>);
}
interface UseChatcnStickToBottomOptions {
    threshold?: number;
    anchor?: boolean | string;
    anchorOffset?: number;
    initial?: boolean;
}
interface ConversationProps extends React.ComponentProps<"div">, UseChatcnStickToBottomOptions {
}
type ChatcnScrollBehavior = "smooth" | "instant";
interface ChatcnStickToBottom {
    scrollRef: (element: HTMLElement | null) => void;
    contentRef: (element: HTMLElement | null) => void;
    spacerRef: (element: HTMLElement | null) => void;
    isAtBottom: boolean;
    isSticky: boolean;
    isFar: boolean;
    unread: number;
    scrollToBottom: (options?: {
        behavior?: ChatcnScrollBehavior;
    }) => void;
    scrollToTurn: (element: HTMLElement, options?: {
        behavior?: ChatcnScrollBehavior;
    }) => void;
}
const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
function nestedCanScroll(target: EventTarget | null, root: HTMLElement, dy: number) {
    let node = target instanceof Element ? target : null;
    while (node && node !== root) {
        if (node instanceof HTMLElement && node.scrollHeight > node.clientHeight) {
            const overflow = getComputedStyle(node).overflowY;
            if (overflow === "auto" || overflow === "scroll") {
                if (dy < 0 && node.scrollTop > 0)
                    return true;
                if (dy > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1)
                    return true;
            }
        }
        node = node.parentElement;
    }
    return false;
}
function isEditable(target: EventTarget | null) {
    return (target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)));
}
const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);
const USER_TURN = '[data-slot="message"][data-role="user"]';
const MESSAGE = '[data-slot="message"]';
function useChatcnStickToBottom({ threshold = 64, anchor = true, anchorOffset = 24, initial = true, }: UseChatcnStickToBottomOptions = {}): ChatcnStickToBottom {
    const [scroller, setScroller] = React.useState<HTMLElement | null>(null);
    const [content, setContent] = React.useState<HTMLElement | null>(null);
    const spacer = React.useRef<HTMLElement | null>(null);
    const [isAtBottom, setAtBottom] = React.useState(true);
    const [isSticky, setSticky] = React.useState(true);
    const [isFar, setFar] = React.useState(false);
    const [unread, setUnread] = React.useState(0);
    const s = React.useRef({
        sticky: true,
        written: -1,
        lastTop: 0,
        lastHeight: 0,
        raf: 0,
        target: null as null | (() => number),
        anchorEl: null as HTMLElement | null,
        mounted: false,
        unread: 0,
        touchY: 0,
        keep: null as null | {
            node: Element;
            top: number;
        },
    }).current;
    const options = React.useRef({ threshold, anchor, anchorOffset });
    options.current = { threshold, anchor, anchorOffset };
    const api = React.useRef<{
        toBottom: (behavior?: ChatcnScrollBehavior) => void;
        toTurn: (el: HTMLElement, behavior?: ChatcnScrollBehavior) => void;
    } | null>(null);
    React.useEffect(() => {
        const el = scroller;
        if (!el)
            return;
        const nativeAnchoring = typeof CSS !== "undefined" && CSS.supports?.("overflow-anchor", "auto") === true;
        const maxTop = () => Math.max(0, el.scrollHeight - el.clientHeight);
        const distance = () => maxTop() - el.scrollTop;
        const write = (top: number) => {
            el.scrollTop = top;
            s.written = el.scrollTop;
            s.lastTop = el.scrollTop;
        };
        const sync = () => {
            const d = distance();
            const atBottom = d <= options.current.threshold;
            if (atBottom && s.unread) {
                s.unread = 0;
                setUnread(0);
            }
            setAtBottom(atBottom);
            setFar(d > el.clientHeight);
            setSticky(s.sticky);
        };
        const stop = () => {
            if (s.raf)
                cancelAnimationFrame(s.raf);
            s.raf = 0;
            s.target = null;
        };
        const release = () => {
            stop();
            if (!s.sticky)
                return;
            s.sticky = false;
            setSticky(false);
        };
        const chase = (target: () => number, behavior: ChatcnScrollBehavior) => {
            s.target = target;
            if (behavior === "instant" || prefersReducedMotion()) {
                stop();
                write(Math.min(target(), maxTop()));
                sync();
                return;
            }
            if (s.raf)
                return;
            let last = performance.now();
            const step = (now: number) => {
                const goal = s.target;
                if (!goal)
                    return;
                const dt = Math.min(64, now - last);
                last = now;
                const to = Math.min(goal(), maxTop());
                const from = el.scrollTop;
                const gap = to - from;
                if (Math.abs(gap) < 1) {
                    write(to);
                    s.raf = 0;
                    s.target = null;
                    sync();
                    return;
                }
                const move = gap * (1 - Math.exp(-dt / 70));
                write(from + (Math.abs(move) < 1 ? Math.sign(gap) : move));
                s.raf = requestAnimationFrame(step);
            };
            s.raf = requestAnimationFrame(step);
        };
        const turnTop = (turn: HTMLElement) => turn.getBoundingClientRect().top -
            el.getBoundingClientRect().top +
            el.scrollTop -
            options.current.anchorOffset;
        const fitSpacer = () => {
            const pad = spacer.current;
            if (!pad)
                return;
            const turn = s.anchorEl;
            if (!turn?.isConnected || !content) {
                s.anchorEl = null;
                if (pad.style.height !== "0px")
                    pad.style.height = "0px";
                return;
            }
            const box = el.getBoundingClientRect();
            const contentBottom = content.getBoundingClientRect().bottom - box.top + el.scrollTop;
            const need = Math.max(0, Math.ceil(turnTop(turn) + el.clientHeight - contentBottom));
            pad.style.height = `${need}px`;
            if (need === 0)
                s.anchorEl = null;
        };
        const remember = () => {
            if (nativeAnchoring || !content)
                return;
            const top = el.getBoundingClientRect().top;
            for (const child of Array.from(content.children)) {
                const r = child.getBoundingClientRect();
                if (r.bottom > top) {
                    s.keep = { node: child, top: r.top - top };
                    return;
                }
            }
            s.keep = null;
        };
        const toBottom = (behavior: ChatcnScrollBehavior = "smooth") => {
            s.sticky = true;
            setSticky(true);
            chase(maxTop, behavior);
        };
        const toTurn = (turn: HTMLElement, behavior: ChatcnScrollBehavior = "smooth") => {
            s.anchorEl = turn;
            fitSpacer();
            s.sticky = true;
            setSticky(true);
            chase(() => turnTop(turn), behavior);
        };
        api.current = { toBottom, toTurn };
        const onScroll = () => {
            const top = el.scrollTop;
            const height = el.scrollHeight;
            const ours = Math.abs(top - s.written) < 1.5;
            if (!ours) {
                const movedUp = top < s.lastTop - 0.5;
                const clamped = distance() < 1 && height < s.lastHeight;
                if (movedUp && !clamped)
                    release();
                else if (!movedUp && distance() <= options.current.threshold && !s.sticky) {
                    s.sticky = true;
                }
                s.written = -1;
            }
            s.lastTop = top;
            s.lastHeight = height;
            remember();
            sync();
        };
        const onWheel = (event: WheelEvent) => {
            if (event.deltaY < 0 && el.scrollTop > 0 && !nestedCanScroll(event.target, el, -1))
                release();
        };
        const onTouchStart = (event: TouchEvent) => {
            s.touchY = event.touches[0]?.clientY ?? 0;
        };
        const onTouchMove = (event: TouchEvent) => {
            const y = event.touches[0]?.clientY ?? 0;
            if (y - s.touchY > 4 && !nestedCanScroll(event.target, el, -1))
                release();
            s.touchY = y;
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (isEditable(event.target))
                return;
            if (UP_KEYS.has(event.key) || (event.key === " " && event.shiftKey))
                release();
        };
        const onResize = () => {
            fitSpacer();
            if (!nativeAnchoring && !s.sticky && s.keep?.node.isConnected) {
                const now = s.keep.node.getBoundingClientRect().top - el.getBoundingClientRect().top;
                const delta = now - s.keep.top;
                if (Math.abs(delta) > 0.5)
                    write(el.scrollTop + delta);
            }
            if (s.sticky && !s.target) {
                chase(maxTop, s.mounted && distance() <= el.clientHeight ? "smooth" : "instant");
            }
            if (el.scrollHeight > s.lastHeight)
                s.lastHeight = el.scrollHeight;
            remember();
            sync();
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(el);
        if (content)
            ro.observe(content);
        const mo = new MutationObserver((records) => {
            if (!content)
                return;
            const selector = options.current.anchor === false
                ? null
                : typeof options.current.anchor === "string"
                    ? options.current.anchor
                    : USER_TURN;
            let turn: HTMLElement | null = null;
            let added = 0;
            for (const record of records) {
                for (const node of Array.from(record.addedNodes)) {
                    if (!(node instanceof HTMLElement))
                        continue;
                    const isMessage = node.matches(MESSAGE) || node.querySelector(MESSAGE);
                    if (isMessage)
                        added++;
                    if (!selector)
                        continue;
                    const match = node.matches(selector)
                        ? node
                        : (node.querySelector<HTMLElement>(selector) ?? null);
                    if (match)
                        turn = match;
                }
            }
            if (!s.mounted)
                return;
            if (turn && selector && added <= 2) {
                const all = content.querySelectorAll<HTMLElement>(selector);
                if (all[all.length - 1] === turn) {
                    toTurn(turn);
                    return;
                }
            }
            if (added && !s.sticky) {
                s.unread += added;
                setUnread(s.unread);
            }
        });
        if (content)
            mo.observe(content, { childList: true, subtree: true });
        el.addEventListener("scroll", onScroll, { passive: true });
        el.addEventListener("wheel", onWheel, { passive: true });
        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: true });
        el.addEventListener("keydown", onKeyDown);
        if (!s.mounted) {
            if (initial)
                write(maxTop());
            else
                s.sticky = distance() <= options.current.threshold;
        }
        s.lastHeight = el.scrollHeight;
        remember();
        sync();
        const ready = requestAnimationFrame(() => {
            s.mounted = true;
        });
        return () => {
            cancelAnimationFrame(ready);
            stop();
            ro.disconnect();
            mo.disconnect();
            el.removeEventListener("scroll", onScroll);
            el.removeEventListener("wheel", onWheel);
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("keydown", onKeyDown);
        };
    }, [scroller, content, initial, s]);
    const scrollToBottom = React.useCallback((opts?: {
        behavior?: ChatcnScrollBehavior;
    }) => api.current?.toBottom(opts?.behavior), []);
    const scrollToTurn = React.useCallback((element: HTMLElement, opts?: {
        behavior?: ChatcnScrollBehavior;
    }) => api.current?.toTurn(element, opts?.behavior), []);
    const spacerRef = React.useCallback((element: HTMLElement | null) => {
        spacer.current = element;
    }, []);
    return {
        scrollRef: setScroller,
        contentRef: setContent,
        spacerRef,
        isAtBottom,
        isSticky,
        isFar,
        unread,
        scrollToBottom,
        scrollToTurn,
    };
}
interface ConversationContextValue {
    scrollRef: (element: HTMLElement | null) => void;
    contentRef: (element: HTMLElement | null) => void;
    spacerRef: (element: HTMLElement | null) => void;
    isAtBottom: boolean;
    isSticky: boolean;
    isFar: boolean;
    unread: number;
    scrollToBottom: (options?: {
        behavior?: ChatcnScrollBehavior;
    }) => void;
    scrollToTurn: (element: HTMLElement, options?: {
        behavior?: ChatcnScrollBehavior;
    }) => void;
    announce: (text: string) => void;
    ready: boolean;
}
const ConversationContext = React.createContext<ConversationContextValue | null>(null);
function Conversation({ threshold, anchor, anchorOffset, initial, className, children, ...props }: ConversationProps) {
    const stick = useChatcnStickToBottom({ threshold, anchor, anchorOffset, initial });
    const [message, setMessage] = React.useState("");
    const [ready, setReady] = React.useState(false);
    React.useEffect(() => setReady(true), []);
    const announce = React.useCallback((text: string) => {
        setMessage("");
        requestAnimationFrame(() => setMessage(text));
    }, []);
    const value = React.useMemo<ConversationContextValue>(() => ({ ...stick, announce, ready }), [stick, announce, ready]);
    return (<ConversationContext.Provider value={value}>
      <div data-slot="conversation" data-at-bottom={stick.isAtBottom ? "" : undefined} className={cn("relative flex min-h-0 flex-col overflow-hidden", className)} {...props}>
        {children}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {message}
        </div>
      </div>
    </ConversationContext.Provider>);
}
interface ConversationContentProps extends React.ComponentProps<"div"> {
    viewportClassName?: string;
    label?: string;
}
function useConversation() {
    return React.useContext(ConversationContext);
}
function ConversationContent({ viewportClassName, label = "Conversation", className, children, ...props }: ConversationContentProps) {
    const ctx = useConversation();
    if (!ctx)
        throw new Error("ConversationContent must be used inside Conversation.");
    return (<div ref={ctx.scrollRef} role="log" aria-label={label} aria-live="off" tabIndex={0} data-slot="conversation-viewport" className={cn("chatcn-scroll chatcn-scroll-fade min-h-0 flex-1 overflow-y-auto outline-none [overflow-anchor:auto]", "focus-visible:outline-(color:--chatcn-accent) focus-visible:outline-2 focus-visible:-outline-offset-2", viewportClassName)}>
      <div ref={ctx.contentRef} data-slot="conversation-content" className={cn("mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 pt-8 pb-6 sm:px-6", className)} {...props}>
        {children}
      </div>
      <div ref={ctx.spacerRef} aria-hidden="true" data-slot="conversation-spacer" className="pointer-events-none shrink-0 [overflow-anchor:none]"/>
    </div>);
}
function FollowingBody(props: Omit<BodyProps, "announceFn">) {
    const ctx = useConversation();
    return <TranscriptBody {...props} announceFn={ctx?.announce}/>;
}
interface ScrollToBottomProps extends Omit<React.ComponentProps<"button">, "children"> {
    when?: "far" | "away";
    showUnread?: boolean;
    visible?: boolean;
}
const iconNode3: IconNode = [
    ["path", { "d": "m5.5 12.5 4.73 4.73a2.5 2.5 0 0 0 3.54 0l4.73-4.73" }],
    ["path", { "d": "M12 5v9" }],
];
const ArrowDownIcon: Icon = createIcon("arrow-down", iconNode3);
function ScrollToBottom({ when = "far", showUnread = true, visible, className, onClick, ...props }: ScrollToBottomProps) {
    const ctx = useConversation();
    if (!ctx)
        throw new Error("ScrollToBottom must be used inside Conversation.");
    const { isAtBottom, isFar, unread, scrollToBottom } = ctx;
    const show = visible ?? (when === "away" ? !isAtBottom : isFar || (!isAtBottom && unread > 0));
    const count = showUnread && unread > 0 ? unread : 0;
    const [shown, setShown] = React.useState(count);
    if (count > 0 && count !== shown)
        setShown(count);
    const label = count
        ? `${count} new ${count === 1 ? "message" : "messages"}, scroll to latest`
        : "Scroll to latest";
    return (<button type="button" aria-label={label} aria-hidden={show ? undefined : true} tabIndex={show ? undefined : -1} data-slot="scroll-to-bottom" data-visible={show ? "" : undefined} onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented)
                scrollToBottom({ behavior: "smooth" });
        }} className={cn("chatcn-focus absolute inset-x-0 bottom-4 z-10 mx-auto flex h-8 w-fit items-center rounded-full px-2", "bg-(color:--chatcn-card) text-(color:--chatcn-fg-muted) shadow-(--chatcn-shadow-md) text-[0.8125rem]/[1.25rem] font-medium tabular-nums select-none", "hover:text-(color:--chatcn-fg) active:scale-(--chatcn-press-scale) [&_svg]:size-4 [&_svg]:shrink-0", "ease-(--chatcn-ease-out) transition-[opacity,translate,color,scale] duration-150", "pointer-coarse:after:absolute pointer-coarse:after:-inset-1.5 pointer-coarse:after:content-['']", show
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0 duration-110", "motion-reduce:translate-y-0 motion-reduce:transition-opacity", className)} {...props}>
      <ArrowDownIcon aria-hidden="true"/>
      <span aria-hidden="true" data-slot="scroll-to-bottom-count" data-open={count ? "" : undefined} className={cn("grid grid-cols-[0fr] opacity-0 data-[open]:grid-cols-[1fr] data-[open]:opacity-100", "ease-(--chatcn-ease-out) transition-[grid-template-columns,opacity] duration-200", "motion-reduce:transition-opacity")}>
        <span className="overflow-hidden whitespace-nowrap">
          <span className="ps-1.5 pe-1">{shown > 99 ? "99+" : shown} new</span>
        </span>
      </span>
    </button>);
}
function Transcript({ segments, userLabel = "You", assistantLabel = "Assistant", follow = true, onSeek, activeId, showTimestamps = false, layout = "stacked", empty, label = "Transcript", announce = true, className, onQuickAdd, ...props }: TranscriptProps) {
    const groups = React.useMemo(() => groupSegments(segments, { user: userLabel, assistant: assistantLabel }), [segments, userLabel, assistantLabel]);
    const contentClass = cn("max-w-none px-4 sm:px-5", layout === "inline" ? "gap-0 py-3" : "gap-5 py-4", segments.length === 0 && "min-h-full");
    const staticRef = React.useRef<HTMLDivElement>(null);
    const scrollBottomRef = React.useRef<HTMLDivElement>(null);

    // Guaranteed auto-scroll to latest text whenever new segments arrive
    React.useEffect(() => {
        const t = setTimeout(() => {
            scrollBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 60);
        return () => clearTimeout(t);
    }, [segments]);

    React.useEffect(() => {
        if (follow || !activeId)
            return;
        const root = staticRef.current;
        const el = root?.querySelector<HTMLElement>(`[data-active]`);
        if (!root || !el)
            return;
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const box = root.getBoundingClientRect();
        const line = el.getBoundingClientRect();
        const delta = line.top < box.top
            ? line.top - box.top
            : line.bottom > box.bottom
                ? line.bottom - box.bottom
                : 0;
        if (delta)
            root.scrollBy({ top: delta, behavior: reduced ? "auto" : "smooth" });
    }, [activeId, follow]);
    React.useLayoutEffect(() => {
        const el = staticRef.current;
        if (follow || !el)
            return;
        const update = () => {
            el.toggleAttribute("data-scroll-top", el.scrollTop > 1);
            el.toggleAttribute("data-scroll-bottom", el.scrollTop + el.clientHeight < el.scrollHeight - 1);
        };
        update();
        el.addEventListener("scroll", update, { passive: true });
        const observer = new ResizeObserver(update);
        observer.observe(el);
        if (el.firstElementChild)
            observer.observe(el.firstElementChild);
        return () => {
            el.removeEventListener("scroll", update);
            observer.disconnect();
        };
    }, [follow]);
    const body = {
        segments,
        groups,
        layout,
        showTimestamps,
        onSeek,
        activeId,
        empty,
        announce,
        onQuickAdd,
        bottomRef: scrollBottomRef,
    };
    if (!follow) {
        return (<div data-slot="transcript" data-layout={layout} className={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden", className)} {...props}>
        <div ref={staticRef} role="log" aria-label={label} aria-live="off" tabIndex={0} className={cn("chatcn-scroll min-h-0 flex-1 overflow-y-auto outline-none", "focus-visible:outline-(color:--chatcn-accent) focus-visible:outline-2 focus-visible:-outline-offset-2", "[--edge-bottom:black] [--edge-top:black] [--fade-bottom:0px] [--fade-top:0px]", "data-[scroll-top]:[--edge-top:transparent] data-[scroll-top]:[--fade-top:1.5rem]", "data-[scroll-bottom]:[--edge-bottom:transparent] data-[scroll-bottom]:[--fade-bottom:2rem]", "[mask-image:linear-gradient(to_bottom,var(--edge-top),black_var(--fade-top),black_calc(100%-var(--fade-bottom)),var(--edge-bottom))]", "focus-visible:[mask-image:none]")}>
          <div className={cn("flex flex-col", contentClass)}>
            <TranscriptBody {...body}/>
          </div>
        </div>
      </div>);
    }
    return (<Conversation anchor={false} data-slot="transcript" data-layout={layout} className={cn("min-h-0 flex-1", className)} {...props}>
      <ConversationContent label={label} className={contentClass}>
        <FollowingBody {...body}/>
      </ConversationContent>
      <ScrollToBottom when="away" showUnread={false}/>
    </Conversation>);
}
type PromptInputStatus = "idle" | "submitting" | "streaming";
type PromptInputVariant = "default" | "floating" | "minimal" | "hero";
type FileSource = "paste" | "drop" | "picker";
interface FileRejection {
    file: File;
    reason: "type" | "size" | "count";
}
type SubmitOn = "enter" | "mod-enter" | "auto";
interface PromptInputProps extends Omit<React.ComponentProps<"form">, "onSubmit" | "onChange" | "defaultValue"> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    onSubmit?: (message: {
        text: string;
    }) => void;
    status?: PromptInputStatus;
    onStop?: () => void;
    disabled?: boolean;
    variant?: PromptInputVariant;
    onFiles?: (files: File[], source: FileSource) => void;
    onFilesRejected?: (rejections: FileRejection[]) => void;
    accept?: string;
    maxFileSize?: number;
    maxFiles?: number;
    pasteTextAsFileAt?: number;
    hasContent?: boolean;
    submitOn?: SubmitOn;
    clearOnSubmit?: boolean;
    dropLabel?: React.ReactNode;
    dropHint?: React.ReactNode;
}
interface UseChatcnFileDropOptions {
    accept?: string;
    maxSize?: number;
    maxFiles?: number;
    disabled?: boolean;
    onFiles?: (files: File[]) => void;
    onReject?: (rejections: FileRejection[]) => void;
    target?: "element" | "window";
}
const EXT_MIME: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".csv": "text/csv",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".json": "application/json",
    ".zip": "application/zip",
};
function matchesAccept(file: {
    type: string;
    name?: string;
}, accept?: string) {
    if (!accept)
        return true;
    const rules = accept
        .split(",")
        .map((r) => r.trim().toLowerCase())
        .filter(Boolean);
    if (rules.length === 0)
        return true;
    const type = file.type.toLowerCase();
    const name = file.name?.toLowerCase();
    if (!type && !name)
        return true;
    return rules.some((rule) => {
        if (rule.startsWith(".")) {
            if (name)
                return name.endsWith(rule);
            return EXT_MIME[rule] === type;
        }
        if (rule.endsWith("/*"))
            return type.startsWith(rule.slice(0, -1));
        return type === rule;
    });
}
function sortFiles(files: File[], { accept, maxSize, maxFiles }: Pick<UseChatcnFileDropOptions, "accept" | "maxSize" | "maxFiles">) {
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    for (const file of files) {
        if (!matchesAccept(file, accept))
            rejected.push({ file, reason: "type" });
        else if (maxSize !== undefined && file.size > maxSize)
            rejected.push({ file, reason: "size" });
        else if (maxFiles !== undefined && accepted.length >= maxFiles)
            rejected.push({ file, reason: "count" });
        else
            accepted.push(file);
    }
    return { accepted, rejected };
}
type DropState = "idle" | "accept" | "reject";
function hasFiles(event: DragEvent | React.DragEvent) {
    return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}
function judgeDrag(event: DragEvent | React.DragEvent, accept?: string, maxFiles?: number) {
    const items = Array.from(event.dataTransfer?.items ?? []).filter((i) => i.kind === "file");
    if (maxFiles !== undefined && items.length > maxFiles)
        return "reject" as const;
    return items.every((i) => matchesAccept({ type: i.type }, accept)) ? "accept" : "reject";
}
function useChatcnFileDrop(options: UseChatcnFileDropOptions = {}) {
    const optionsRef = React.useRef(options);
    optionsRef.current = options;
    const [state, setState] = React.useState<DropState>("idle");
    const depth = React.useRef(0);
    const handlers = React.useMemo(() => {
        const enter = (event: DragEvent | React.DragEvent) => {
            const { disabled, accept, maxFiles } = optionsRef.current;
            if (disabled || !hasFiles(event))
                return;
            event.preventDefault();
            depth.current += 1;
            setState(judgeDrag(event, accept, maxFiles));
        };
        const over = (event: DragEvent | React.DragEvent) => {
            if (optionsRef.current.disabled || !hasFiles(event))
                return;
            event.preventDefault();
            if (event.dataTransfer)
                event.dataTransfer.dropEffect = "copy";
        };
        const leave = (event: DragEvent | React.DragEvent) => {
            if (optionsRef.current.disabled || !hasFiles(event))
                return;
            depth.current = Math.max(0, depth.current - 1);
            if (depth.current === 0)
                setState("idle");
        };
        const drop = (event: DragEvent | React.DragEvent) => {
            const { disabled, onFiles, onReject } = optionsRef.current;
            if (disabled || !hasFiles(event))
                return;
            event.preventDefault();
            depth.current = 0;
            setState("idle");
            const files = Array.from(event.dataTransfer?.files ?? []);
            const { accepted, rejected } = sortFiles(files, optionsRef.current);
            if (accepted.length)
                onFiles?.(accepted);
            if (rejected.length)
                onReject?.(rejected);
        };
        return { enter, over, leave, drop };
    }, []);
    const target = options.target ?? "element";
    React.useEffect(() => {
        if (target !== "window")
            return;
        const { enter, over, leave, drop } = handlers;
        window.addEventListener("dragenter", enter);
        window.addEventListener("dragover", over);
        window.addEventListener("dragleave", leave);
        window.addEventListener("drop", drop);
        return () => {
            window.removeEventListener("dragenter", enter);
            window.removeEventListener("dragover", over);
            window.removeEventListener("dragleave", leave);
            window.removeEventListener("drop", drop);
        };
    }, [target, handlers]);
    React.useEffect(() => {
        if (options.disabled) {
            depth.current = 0;
            setState("idle");
        }
    }, [options.disabled]);
    const rootProps = React.useMemo(() => ({
        onDragEnter: handlers.enter as (event: React.DragEvent) => void,
        onDragOver: handlers.over as (event: React.DragEvent) => void,
        onDragLeave: handlers.leave as (event: React.DragEvent) => void,
        onDrop: handlers.drop as (event: React.DragEvent) => void,
    }), [handlers]);
    return { state, rootProps };
}
interface PromptInputContextValue {
    value: string;
    setValue: (value: string) => void;
    submit: () => void;
    stop: () => void;
    status: PromptInputStatus;
    disabled: boolean;
    empty: boolean;
    variant: PromptInputVariant;
    submitOn: SubmitOn;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    openFilePicker: () => void;
    acceptsFiles: boolean;
    handlePaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}
const PromptInputContext = React.createContext<PromptInputContextValue | null>(null);
const surface: Record<PromptInputVariant, string> = {
    default: "rounded-(--chatcn-radius-xl) bg-(color:--chatcn-card) shadow-(--chatcn-shadow-sm)",
    floating: cn("rounded-(--chatcn-radius-xl) shadow-(--chatcn-shadow-lg) bg-(color:--chatcn-card)", "supports-[backdrop-filter:blur(0)]:bg-[color-mix(in_oklch,var(--chatcn-card)_80%,transparent)] supports-[backdrop-filter:blur(0)]:backdrop-blur-lg"),
    minimal: "rounded-(--chatcn-radius-2xl) bg-(color:--chatcn-card) shadow-(--chatcn-shadow-sm) flex-row items-end gap-1 p-1.5",
    hero: "rounded-(--chatcn-radius-2xl) bg-(color:--chatcn-card) shadow-(--chatcn-shadow-sm)",
};
const focusRing = "focus-within:shadow-[0_0_0_1px_var(--chatcn-gray-900),0_0_0_4px_var(--chatcn-alpha-300)]";
interface DropZoneOverlayProps extends React.ComponentProps<"div"> {
    state: DropState;
    label?: React.ReactNode;
    hint?: React.ReactNode;
    rejectLabel?: React.ReactNode;
    accept?: string;
    count?: number;
    maxFiles?: number;
    variant?: "contained" | "page";
}
const KINDS: [
    RegExp,
    string
][] = [
    [/^image\/\*$/, "images"],
    [/^(\.pdf|application\/pdf)$/, "PDFs"],
    [/^video\/\*$/, "videos"],
    [/^audio\/\*$/, "audio"],
    [/^text\/\*$/, "text files"],
    [/^(\.csv|text\/csv)$/, "CSV files"],
    [/^(\.md|text\/markdown)$/, "Markdown files"],
    [/^(\.txt|text\/plain)$/, "text files"],
    [/^(\.json|application\/json)$/, "JSON files"],
];
function joinWords(words: string[]) {
    if (words.length <= 1)
        return words[0] ?? "";
    return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}
function describeAccept(accept?: string) {
    if (!accept)
        return "";
    const words: string[] = [];
    for (const raw of accept.split(",")) {
        const rule = raw.trim().toLowerCase();
        if (!rule)
            continue;
        const kind = KINDS.find(([re]) => re.test(rule))?.[1] ??
            (rule.startsWith(".") ? `${rule.slice(1).toUpperCase()} files` : rule);
        if (!words.includes(kind))
            words.push(kind);
    }
    return joinWords(words);
}
function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
const iconNode4: IconNode = [
    ["path", { "d": "M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" }],
    ["path", { "d": "m7.76 7.76 8.48 8.48" }],
];
const BanIcon: Icon = createIcon("ban", iconNode4);
const iconNode5: IconNode = [
    ["path", { "d": "M3.5 15v2.5a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3V15" }],
    ["path", { "d": "m16.5 8-3.09-3.09a2 2 0 0 0-2.82 0L7.5 8" }],
    ["path", { "d": "M12 15.5V8" }],
];
const UploadIcon: Icon = createIcon("upload", iconNode5);
function DropZoneOverlay({ state, label, hint, rejectLabel, accept, count, maxFiles, variant = "contained", className, ...props }: DropZoneOverlayProps) {
    const visible = state !== "idle";
    const reject = state === "reject";
    const types = describeAccept(accept);
    const page = variant === "page";
    const tooMany = count !== undefined && maxFiles !== undefined && count > maxFiles;
    const what = !count ? "files" : count === 1 ? "the file" : `${count.toLocaleString()} files`;
    const title = reject
        ? (rejectLabel ??
            (tooMany
                ? `Attach up to ${maxFiles} ${maxFiles === 1 ? "file" : "files"} at a time`
                : types
                    ? `Only ${types} can be attached`
                    : "These files can't be attached"))
        : (label ?? `Drop ${what} ${page ? "anywhere " : ""}to attach`);
    const sub = reject
        ? tooMany && !rejectLabel
            ? `You're dragging ${count?.toLocaleString()}.`
            : null
        : (hint ?? (types ? capitalize(types) : null));
    return (<div aria-hidden="true" data-slot="drop-zone-overlay" data-drop-state={state} data-variant={variant} className={cn("pointer-events-none grid place-items-center", page ? "fixed inset-0 z-50 p-3" : "absolute inset-0 z-10 rounded-[inherit] p-2", page
            ? "bg-[color-mix(in_oklch,var(--chatcn-bg)_88%,transparent)]"
            : "bg-[color-mix(in_oklch,var(--chatcn-card)_94%,transparent)]", "ease-(--chatcn-ease-out) transition-[opacity,visibility] duration-150 motion-reduce:duration-100", visible ? "visible opacity-100" : "invisible opacity-0", className)} {...props}>
      <div className={cn("border-(color:--chatcn-border-strong) grid size-full place-items-center border border-dashed", page ? "rounded-(--chatcn-radius-lg) border-2" : "rounded-(--chatcn-radius-md)", reject && "border-solid")}>
        <div className={cn("flex flex-col items-center gap-1.5 px-4 text-center", "ease-(--chatcn-ease-out) transition-[scale] duration-150 motion-reduce:scale-none!", visible ? "scale-100" : "scale-98")}>
          <span key={reject ? "reject" : "accept"} className={cn("grid place-items-center motion-safe:animate-[chatcn-swap_150ms_var(--chatcn-ease-out)]", page ? "mb-1 [&_svg]:size-6" : "[&_svg]:size-5", reject ? "text-(color:--chatcn-red)" : "text-(color:--chatcn-fg)")}>
            {reject ? <BanIcon /> : <UploadIcon />}
          </span>
          <p className={cn("text-(color:--chatcn-fg) font-medium text-balance!", page ? "text-[1.25rem]/[1.75rem] tracking-[-0.018em]" : "text-[0.875rem]/[1.25rem] tracking-[-0.003em]")}>
            {title}
          </p>
          {sub ? (<p className={cn("text-(color:--chatcn-fg-subtle) tabular-nums", page ? "text-[0.875rem]/[1.25rem] tracking-[-0.003em]" : "text-[0.8125rem]/[1.25rem]")}>
              {sub}
            </p>) : null}
        </div>
      </div>
    </div>);
}
function PromptInput({ value: valueProp, defaultValue = "", onValueChange, onSubmit, status = "idle", onStop, disabled = false, variant = "default", onFiles, onFilesRejected, accept, maxFileSize, maxFiles, pasteTextAsFileAt, hasContent = false, submitOn = "auto", clearOnSubmit = true, dropLabel, dropHint, className, children, onKeyDown, onPointerDown, ...props }: PromptInputProps) {
    const [valueState, setValueState] = React.useState(defaultValue);
    const controlled = valueProp !== undefined;
    const value = controlled ? valueProp : valueState;
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const setValue = React.useCallback((next: string) => {
        if (!controlled)
            setValueState(next);
        onValueChange?.(next);
    }, [controlled, onValueChange]);
    const empty = value.trim().length === 0 && !hasContent;
    const submit = () => {
        if (disabled || status !== "idle" || empty)
            return;
        onSubmit?.({ text: value });
        if (!controlled && clearOnSubmit)
            setValueState("");
    };
    const stop = () => {
        if (status === "streaming")
            onStop?.();
    };
    const limits = { accept, maxSize: maxFileSize, maxFiles };
    const deliver = (files: File[], source: FileSource) => {
        const { accepted, rejected } = sortFiles(files, limits);
        if (accepted.length)
            onFiles?.(accepted, source);
        if (rejected.length)
            onFilesRejected?.(rejected);
    };
    const drop = useChatcnFileDrop({
        ...limits,
        disabled: disabled || !onFiles,
        onFiles: (files) => onFiles?.(files, "drop"),
        onReject: onFilesRejected,
    });
    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        if (!onFiles)
            return;
        const data = event.clipboardData;
        const files = Array.from(data.files);
        const text = data.getData("text/plain");
        if (files.length > 0 && text.length === 0) {
            event.preventDefault();
            deliver(files, "paste");
        }
        else if (pasteTextAsFileAt !== undefined && text.length >= pasteTextAsFileAt) {
            event.preventDefault();
            deliver([new File([text], "Pasted text.txt", { type: "text/plain" })], "paste");
        }
    };
    const context: PromptInputContextValue = {
        value,
        setValue,
        submit,
        stop,
        status,
        disabled,
        empty,
        variant,
        submitOn,
        textareaRef,
        openFilePicker: () => fileInputRef.current?.click(),
        acceptsFiles: Boolean(onFiles),
        handlePaste,
    };
    const [announcement, setAnnouncement] = React.useState("");
    const prevStatus = React.useRef(status);
    React.useEffect(() => {
        if (prevStatus.current === status)
            return;
        if (status === "streaming")
            setAnnouncement("Generating. Press Escape to stop.");
        else if (prevStatus.current === "streaming")
            setAnnouncement("");
        prevStatus.current = status;
    }, [status]);
    return (<PromptInputContext.Provider value={context}>
      <form data-slot="prompt-input" data-variant={variant} data-prompt-state={status} data-disabled={disabled ? "" : undefined} aria-disabled={disabled || undefined} className={cn("group/prompt-input @container/prompt-input relative flex w-full min-w-0 cursor-text flex-col", "forced-colors:border forced-colors:border-[CanvasText]", surface[variant], !disabled && focusRing, disabled && "bg-(color:--chatcn-bg-subtle) shadow-(--chatcn-shadow-border) cursor-not-allowed", className)} onSubmit={(event) => {
            event.preventDefault();
            if (status === "streaming")
                return;
            submit();
        }} onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.key === "Escape" &&
                !event.defaultPrevented &&
                status === "streaming" &&
                event.currentTarget.contains(event.target as Node)) {
                event.preventDefault();
                stop();
            }
        }} onPointerDown={(event) => {
            onPointerDown?.(event);
            const target = event.target as HTMLElement;
            if (event.button === 0 &&
                !disabled &&
                !target.closest("button,a,input,textarea,select,[role=button],[data-slot=attachment],[contenteditable=true]")) {
                event.preventDefault();
                textareaRef.current?.focus();
            }
        }} {...drop.rootProps} {...props}>
        {children}
        {onFiles ? (<>
            <input ref={fileInputRef} type="file" multiple={maxFiles !== 1} accept={accept} tabIndex={-1} aria-hidden="true" className="hidden" onChange={(event) => {
                deliver(Array.from(event.target.files ?? []), "picker");
                event.target.value = "";
            }}/>
            <DropZoneOverlay state={drop.state} accept={accept} label={dropLabel} hint={dropHint}/>
          </>) : null}
        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </form>
    </PromptInputContext.Provider>);
}
interface PromptInputTextareaProps extends Omit<React.ComponentProps<"textarea">, "value" | "defaultValue"> {
}
function usePromptInput() {
    const context = React.useContext(PromptInputContext);
    if (!context)
        throw new Error("usePromptInput must be used inside <PromptInput>.");
    return context;
}
interface UseChatcnAutoResizeOptions {
    value?: string;
    enabled?: boolean;
}
const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
let fieldSizing: boolean | undefined;
function supportsFieldSizing() {
    if (fieldSizing === undefined) {
        fieldSizing = typeof CSS !== "undefined" && CSS.supports?.("field-sizing", "content") === true;
    }
    return fieldSizing;
}
function resizeTextarea(el: HTMLTextAreaElement) {
    const { scrollTop } = el;
    const style = window.getComputedStyle(el);
    const borders = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth);
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + borders}px`;
    el.scrollTop = scrollTop;
}
function useChatcnAutoResize(ref: React.RefObject<HTMLTextAreaElement | null>, { value, enabled = true }: UseChatcnAutoResizeOptions = {}) {
    useIsoLayoutEffect(() => {
        const el = ref.current;
        if (!el || !enabled || supportsFieldSizing())
            return;
        resizeTextarea(el);
    }, [ref, value, enabled]);
    React.useEffect(() => {
        const el = ref.current;
        if (!el || !enabled || supportsFieldSizing())
            return;
        const onInput = () => resizeTextarea(el);
        el.addEventListener("input", onInput);
        let width = el.offsetWidth;
        const observer = new ResizeObserver(() => {
            if (el.offsetWidth === width)
                return;
            width = el.offsetWidth;
            resizeTextarea(el);
        });
        observer.observe(el);
        return () => {
            el.removeEventListener("input", onInput);
            observer.disconnect();
            el.style.height = "";
        };
    }, [ref, enabled]);
}
function useScrollEdges(ref: React.RefObject<HTMLTextAreaElement | null>, value: string) {
    const [edges, setEdges] = React.useState({ top: false, bottom: false });
    const update = React.useCallback(() => {
        const el = ref.current;
        if (!el)
            return;
        const top = el.scrollTop > 1;
        const bottom = el.scrollHeight - el.clientHeight - el.scrollTop > 1;
        setEdges((prev) => (prev.top === top && prev.bottom === bottom ? prev : { top, bottom }));
    }, [ref]);
    React.useLayoutEffect(update, [update, value]);
    React.useEffect(() => {
        const el = ref.current;
        if (!el || typeof ResizeObserver === "undefined")
            return;
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref, update]);
    return { ...edges, update };
}
interface UseChatcnImeSubmitOptions {
    onSubmit: () => void;
    onStop?: () => void;
    streaming?: boolean;
    submitOn?: SubmitOn;
    disabled?: boolean;
}
function isCoarsePointer() {
    return typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true;
}
function useChatcnImeSubmit(options: UseChatcnImeSubmitOptions) {
    const optionsRef = React.useRef(options);
    optionsRef.current = options;
    const composing = React.useRef(false);
    const onCompositionStart = React.useCallback(() => {
        composing.current = true;
    }, []);
    const onCompositionEnd = React.useCallback(() => {
        window.setTimeout(() => {
            composing.current = false;
        }, 0);
    }, []);
    const onKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (event.defaultPrevented)
            return;
        const native = event.nativeEvent;
        if (native.isComposing || composing.current || (native as any).keyCode === 229)
            return;
        const { onSubmit, onStop, streaming, submitOn = "auto", disabled } = optionsRef.current;
        if (event.key === "Escape" && streaming && onStop) {
            event.preventDefault();
            onStop();
            return;
        }
        if (event.key !== "Enter" || event.shiftKey || event.altKey)
            return;
        const mod = event.metaKey || event.ctrlKey;
        const mode = submitOn === "auto" ? (isCoarsePointer() ? "mod-enter" : "enter") : submitOn;
        if (mode === "mod-enter" && !mod)
            return;
        event.preventDefault();
        if (disabled)
            return;
        onSubmit();
    }, []);
    return { onKeyDown, onCompositionStart, onCompositionEnd };
}
const textareaVariant: Record<PromptInputVariant, string> = {
    default: "text-[0.9375rem]/[1.5rem] tracking-[-0.006em] min-h-12 px-4 pt-3.5 pb-1.5",
    floating: "text-[0.9375rem]/[1.5rem] tracking-[-0.006em] min-h-12 px-4 pt-3.5 pb-1.5",
    minimal: "text-[0.9375rem]/[1.5rem] tracking-[-0.006em] min-h-9 flex-1 px-2.5 py-1.5",
    hero: "text-[1.125rem]/[1.625rem] tracking-[-0.015em] min-h-24 px-5 pt-5 pb-2 tracking-[-0.005em]",
};
function PromptInputTextarea({ className, placeholder = "Ask anything...", onChange, onKeyDown, onPaste, onScroll, onCompositionStart, onCompositionEnd, ref, ...props }: PromptInputTextareaProps) {
    const { value, setValue, submit, stop, status, disabled, variant, submitOn, textareaRef, handlePaste, } = usePromptInput();
    useChatcnAutoResize(textareaRef, { value });
    const edges = useScrollEdges(textareaRef, value);
    const ime = useChatcnImeSubmit({
        onSubmit: () => {
            if (status === "idle")
                submit();
        },
        onStop: stop,
        streaming: status === "streaming",
        submitOn,
        disabled,
    });
    const setRefs = (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function")
            ref(node);
        else if (ref)
            ref.current = node;
    };
    return (<textarea ref={setRefs} data-slot="prompt-input-textarea" name="message" rows={1} aria-label={props["aria-label"] ?? "Message"} autoComplete="off" placeholder={placeholder} disabled={disabled} value={value} onChange={(event) => {
            onChange?.(event);
            setValue(event.target.value);
        }} onKeyDown={(event) => {
            onKeyDown?.(event);
            ime.onKeyDown(event);
        }} onPaste={(event) => {
            onPaste?.(event);
            if (!event.defaultPrevented)
                handlePaste(event);
        }} onScroll={(event) => {
            onScroll?.(event);
            edges.update();
        }} data-fade-top={edges.top ? "" : undefined} data-fade-bottom={edges.bottom ? "" : undefined} onCompositionStart={(event) => {
            onCompositionStart?.(event);
            ime.onCompositionStart();
        }} onCompositionEnd={(event) => {
            onCompositionEnd?.(event);
            ime.onCompositionEnd();
        }} className={cn("text-(color:--chatcn-fg) placeholder:text-(color:--chatcn-fg-subtle) block w-full resize-none bg-transparent outline-none", "chatcn-scroll field-sizing-content max-h-[40vh] overflow-y-auto [overflow-wrap:anywhere]", "data-[fade-bottom]:[--chatcn-fade-bottom:20px] data-[fade-top]:[--chatcn-fade-top:20px]", "[mask-image:linear-gradient(to_bottom,transparent,#000_var(--chatcn-fade-top,0px),#000_calc(100%-var(--chatcn-fade-bottom,0px)),transparent)]", "pointer-coarse:text-[1rem]/[1.5rem] pointer-coarse:tracking-[-0.01em] disabled:cursor-not-allowed disabled:opacity-60", textareaVariant[variant], className)} {...props}/>);
}
type ButtonVariant = "solid" | "outline" | "ghost" | "subtle";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon-xs" | "icon-sm" | "icon-md" | "icon-lg";
interface ButtonProps extends React.ComponentProps<"button"> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}
interface PromptInputButtonProps extends ButtonProps {
    tooltip?: string;
    shortcut?: string;
}
const base = cn("chatcn-focus inline-flex shrink-0 items-center justify-center gap-1.5 font-medium whitespace-nowrap select-none", "ease-(--chatcn-ease-standard) transition-[background-color,color,box-shadow,scale] duration-150", "active:scale-(--chatcn-press-scale) active:duration-100 disabled:pointer-events-none disabled:opacity-50", "[&_svg]:pointer-events-none [&_svg]:shrink-0");
const variants: Record<ButtonVariant, string> = {
    solid: "bg-(color:--chatcn-primary) text-(color:--chatcn-primary-fg) hover:bg-(color:--chatcn-primary-hover)",
    outline: "bg-(color:--chatcn-card) text-(color:--chatcn-fg) shadow-(--chatcn-shadow-xs) hover:bg-(color:--chatcn-fill-hover)",
    ghost: "text-(color:--chatcn-fg-muted) hover:bg-(color:--chatcn-fill-hover) hover:text-(color:--chatcn-fg)",
    subtle: "bg-(color:--chatcn-fill) text-(color:--chatcn-fg) hover:bg-(color:--chatcn-fill-hover)",
};
const sizes: Record<ButtonSize, string> = {
    xs: "h-6 rounded-(--chatcn-radius-sm) px-2 text-[0.75rem]/[1rem] [&_svg]:size-3.5",
    sm: "h-7 rounded-(--chatcn-radius-sm) px-2.5 text-[0.8125rem]/[1.25rem] [&_svg]:size-3.5",
    md: "h-8 rounded-(--chatcn-radius-md) px-3 text-[0.875rem]/[1.25rem] tracking-[-0.003em] [&_svg]:size-4",
    lg: "h-9 rounded-(--chatcn-radius-md) px-3.5 text-[0.875rem]/[1.25rem] tracking-[-0.003em] [&_svg]:size-4",
    "icon-xs": "size-6 rounded-(--chatcn-radius-sm) active:scale-(--chatcn-press-scale-icon) [&_svg]:size-3.5",
    "icon-sm": "size-7 rounded-(--chatcn-radius-sm) active:scale-(--chatcn-press-scale-icon) [&_svg]:size-3.5",
    "icon-md": "size-8 rounded-(--chatcn-radius-md) active:scale-(--chatcn-press-scale-icon) [&_svg]:size-4",
    "icon-lg": "size-9 rounded-(--chatcn-radius-md) active:scale-(--chatcn-press-scale-icon) [&_svg]:size-4",
};
function buttonVariants({ variant = "ghost", size = "md", }: {
    variant?: ButtonVariant;
    size?: ButtonSize;
} = {}) {
    return cn(base, variants[variant], sizes[size]);
}
function Button({ variant = "ghost", size = "md", type = "button", className, ...props }: ButtonProps) {
    return (<button type={type} data-slot="button" data-variant={variant} className={cn(buttonVariants({ variant, size }), className)} {...props}/>);
}
interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    shortcut?: React.ReactNode;
}
function Tooltip({ content, children, side = "top", align = "center", shortcut }: TooltipProps) {
    return (<TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger render={children}/>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} align={align} sideOffset={6} className="z-50">
          <TooltipPrimitive.Popup data-slot="tooltip" className={cn("rounded-(--chatcn-radius-sm) bg-(color:--chatcn-fg) text-[0.75rem]/[1rem] text-(color:--chatcn-bg) shadow-(--chatcn-shadow-md) flex max-w-xs origin-(--transform-origin) items-center gap-2 px-2 py-1 font-medium text-pretty", "ease-(--chatcn-ease-out) transition-[opacity,scale] duration-125", "data-[ending-style]:scale-97 data-[ending-style]:opacity-0 data-[ending-style]:duration-100 data-[starting-style]:scale-97 data-[starting-style]:opacity-0", "data-[instant]:transition-none motion-reduce:transition-opacity motion-reduce:data-[ending-style]:scale-100 motion-reduce:data-[starting-style]:scale-100")}>
            {content}
            {shortcut ? <span className="font-normal opacity-60">{shortcut}</span> : null}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>);
}
function PromptInputButton({ tooltip, shortcut, size = "icon-md", variant = "ghost", className, ...props }: PromptInputButtonProps) {
    const button = (<Button data-slot="prompt-input-button" aria-label={(props as any)["aria-label"] ?? tooltip} size={size} variant={variant} className={cn(size.startsWith("icon") ? "pointer-coarse:size-11" : "pointer-coarse:h-11", className)} {...props}/>);
    return tooltip ? (<Tooltip content={tooltip} shortcut={shortcut}>
      {button}
    </Tooltip>) : (button);
}
type SendButtonStatus = "idle" | "submitting" | "streaming";
interface SendButtonProps extends Omit<React.ComponentProps<"button">, "children"> {
    status?: SendButtonStatus;
    empty?: boolean;
    onStop?: () => void;
    shape?: "round" | "square";
    size?: "sm" | "md" | "lg";
    labels?: {
        send?: string;
        stop?: string;
        submitting?: string;
    };
}
const sizes2 = {
    sm: { box: "size-7", icon: "size-3.5", square: "size-2" },
    md: { box: "size-8", icon: "size-4", square: "size-2.5" },
    lg: { box: "size-9", icon: "size-4", square: "size-2.5" },
};
const layer = cn("pointer-events-none absolute grid place-items-center", "ease-(--chatcn-ease-out) transition-[opacity,scale,translate,filter] duration-150", "motion-reduce:translate-none! motion-reduce:scale-none! motion-reduce:blur-none!");
const shown = "opacity-100 blur-0 scale-100 translate-y-0";
const iconNode6: IconNode = [
    ["path", { "d": "m18.5 11.5-4.73-4.73a2.5 2.5 0 0 0-3.54 0L5.5 11.5" }],
    ["path", { "d": "M12 19v-9" }],
];
const ArrowUpIcon: Icon = createIcon("arrow-up", iconNode6);
function Spinner({ className, label }: {
    className?: string;
    label?: string;
}) {
    return (<svg viewBox="0 0 16 16" fill="none" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} data-slot="spinner" className={cn("chatcn-spin size-3.5 shrink-0", className)}>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5"/>
      <path d="M8 1.75A6.25 6.25 0 0 1 14.25 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>);
}
function SendButton({ status = "idle", empty = false, onStop, shape = "round", size = "md", labels, type = "submit", className, onClick, disabled, ...props }: SendButtonProps) {
    const s = sizes2[size];
    const streaming = status === "streaming";
    const submitting = status === "submitting";
    const inactive = !streaming && !submitting && empty;
    const [seen, setSeen] = React.useState(status);
    const [returns, setReturns] = React.useState(0);
    if (seen !== status) {
        setSeen(status);
        if (status === "idle")
            setReturns((n) => n + 1);
    }
    const label = streaming
        ? (labels?.stop ?? "Stop generating")
        : submitting
            ? (labels?.submitting ?? "Sending")
            : (labels?.send ?? "Send message");
    return (<button type={streaming ? "button" : type} aria-label={label} aria-keyshortcuts={streaming ? "Escape" : "Enter"} aria-disabled={submitting || inactive || undefined} disabled={disabled} data-slot="send-button" data-send-state={status} data-empty={inactive ? "" : undefined} onClick={(event) => {
            if (submitting || inactive) {
                event.preventDefault();
                return;
            }
            if (streaming) {
                event.preventDefault();
                onStop?.();
            }
            onClick?.(event);
        }} className={cn("chatcn-focus relative grid shrink-0 place-items-center select-none", "ease-(--chatcn-ease-standard) transition-[background-color,color,scale] duration-150", "active:scale-(--chatcn-press-scale-icon) active:duration-100", "bg-(color:--chatcn-primary) text-(color:--chatcn-primary-fg) hover:bg-(color:--chatcn-primary-hover)", "data-[empty]:bg-(color:--chatcn-fill-active) data-[empty]:text-(color:--chatcn-fg-faint) data-[empty]:hover:bg-(color:--chatcn-fill-active) data-[empty]:active:scale-100", "disabled:cursor-default disabled:opacity-50 aria-disabled:cursor-default data-[send-state=submitting]:cursor-progress", "after:absolute after:-inset-1.5 after:content-[''] pointer-fine:after:hidden", "forced-colors:border forced-colors:border-[ButtonText]", s.box, shape === "round" ? "rounded-full" : "rounded-(--chatcn-radius-md)", className)} {...props}>
      <span key={returns} aria-hidden="true" data-send-layer="arrow" className={cn(layer, streaming || submitting ? "-translate-y-1 scale-90 opacity-0 blur-[2px]" : shown, returns > 0 &&
            "starting:translate-y-1 starting:scale-90 starting:opacity-0 starting:blur-[2px]")}>
        <ArrowUpIcon strokeWidth={2} className={s.icon}/>
      </span>
      <span aria-hidden="true" className={cn(layer, submitting ? shown : "scale-75 opacity-0 blur-[2px]")}>
        {submitting ? <Spinner className={s.icon}/> : null}
      </span>
      <span aria-hidden="true" className={cn(layer, streaming ? shown : "scale-50 opacity-0 blur-[2px]")}>
        <span className={cn("rounded-[22%] bg-current", s.square)}/>
      </span>
    </button>);
}
function PromptInputSubmit(props: Omit<SendButtonProps, "status" | "empty" | "onStop">) {
    const { status, empty, stop, disabled, variant } = usePromptInput();
    return (<SendButton status={status} empty={empty} onStop={stop} disabled={disabled} size={variant === "hero" ? "lg" : "md"} {...props}/>);
}
const iconNode7: IconNode = [
    ["path", { "d": "M9 5.5a3 3 0 0 1 3-3 3 3 0 0 1 3 3V10a3 3 0 0 1-3 3 3 3 0 0 1-3-3z" }],
    ["path", { "d": "M18.5 10a6.5 6.5 0 0 1-13 0" }],
    ["path", { "d": "M12 16.5V21" }],
];
const MicIcon: Icon = createIcon("mic", iconNode7);
const iconNode8: IconNode = [
    ["path", { "d": "M5.49 17.46A8.5 8.5 0 1 0 6.54 5.49" }],
    ["path", { "d": "m8.21 8.65-2.94-.26a2 2 0 0 1-1.82-2.16l.26-2.94" }],
];
const RotateCcwIcon: Icon = createIcon("rotate-ccw", iconNode8);
const iconNode9: IconNode = [
    ["path", { "d": "m4 4 16 16" }],
    ["path", { "d": "M9 5.75V5.5a3 3 0 0 1 3-3 3 3 0 0 1 3 3V10a3 3 0 0 1-.06.58" }],
    ["path", { "d": "m9.87 12.11-.07-.07" }],
    ["path", { "d": "M18.5 10a6.5 6.5 0 0 1-.9 3.3" }],
    ["path", { "d": "M12.6 16.47A6.5 6.5 0 0 1 5.5 10" }],
    ["path", { "d": "M12 16.5V21" }],
];
const MicOffIcon: Icon = createIcon("mic-off", iconNode9);
const SizeContext = React.createContext<VoiceControlsSize>("md");
const ERROR_TITLES: Record<ChatcnMicrophoneError, string> = {
    "not-allowed": "Microphone blocked",
    "not-found": "No microphone",
    unsupported: "Microphone unavailable",
    unknown: "Microphone stopped",
};
const control = cn("chatcn-focus relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full select-none", "text-(color:--chatcn-fg-muted) hover:bg-(color:--chatcn-fill-hover) hover:text-(color:--chatcn-fg)", "ease-(--chatcn-ease-standard) transition-[background-color,color,box-shadow,scale] duration-150", "active:scale-(--chatcn-press-scale-icon) active:duration-100", "disabled:pointer-events-none disabled:opacity-50", "[&_svg]:pointer-events-none [&_svg]:shrink-0");
const box: Record<VoiceControlsSize, string> = {
    md: "h-9 min-w-9 [&_svg]:size-4 pointer-coarse:h-11 pointer-coarse:min-w-11",
    lg: "h-11 min-w-11 [&_svg]:size-5",
};
const REST = [0.4, 0.62, 0.46];
const WEIGHTS = [0.6, 1, 0.72];
function MicLevel({ level, silent }: {
    level: ChatcnLevel | undefined;
    silent?: boolean;
}) {
    const bars = React.useRef<(HTMLSpanElement | null)[]>([]);
    const levelRef = React.useRef(level);
    levelRef.current = level;
    const reduced = useChatcnPrefersReducedMotion();
    React.useEffect(() => {
        if (silent || reduced) {
            bars.current.forEach((el, i) => {
                if (el)
                    el.style.scale = `1 ${silent ? REST[i] : 0.5}`;
            });
            return;
        }
        let raf = 0;
        let last = 0;
        let env = 0;
        const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
            last = now;
            const value = readLevel(levelRef.current);
            env = approach(env, value, value > env ? 26 : 8, dt);
            bars.current.forEach((el, i) => {
                if (!el)
                    return;
                const weight = WEIGHTS[i] ?? 1;
                const jitter = 0.86 + 0.14 * Math.sin(now / 95 + i * 2.1);
                el.style.scale = `1 ${Math.max(REST[i] ?? 0.4, Math.min(1, env * weight * jitter * 1.7)).toFixed(3)}`;
            });
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [reduced, silent]);
    return (<span aria-hidden="true" data-slot="voice-controls-level" className="flex h-3 items-center gap-[2px]">
      {WEIGHTS.map((_, i) => (<span key={i} ref={(el) => {
                bars.current[i] = el;
            }} style={{ scale: `1 ${REST[i]}` }} className="h-full w-[2px] origin-center rounded-full bg-current"/>))}
    </span>);
}
function Menu(props: MenuPrimitive.Root.Props) {
    return <MenuPrimitive.Root {...props}/>;
}
function MenuTrigger(props: MenuPrimitive.Trigger.Props) {
    return <MenuPrimitive.Trigger data-slot="menu-trigger" {...props}/>;
}
const iconNode10: IconNode = [
    ["path", { "d": "m6 9.25 4.23 4.23a2.5 2.5 0 0 0 3.54 0L18 9.25" }],
];
const ChevronDownIcon: Icon = createIcon("chevron-down", iconNode10);
interface MenuContentProps extends MenuPrimitive.Popup.Props {
    side?: MenuPrimitive.Positioner.Props["side"];
    align?: MenuPrimitive.Positioner.Props["align"];
    sideOffset?: MenuPrimitive.Positioner.Props["sideOffset"];
    alignOffset?: MenuPrimitive.Positioner.Props["alignOffset"];
    container?: MenuPrimitive.Portal.Props["container"];
}
const popupSurface = cn("bg-(color:--chatcn-surface) text-(color:--chatcn-fg) shadow-(--chatcn-shadow-md) rounded-(--chatcn-radius-lg) outline-none", "max-h-(--available-height) max-w-(--available-width)", "forced-colors:outline-1 forced-colors:outline-solid");
const popupMotion = cn("ease-(--chatcn-ease-out) origin-(--transform-origin) transition-[opacity,scale,translate] duration-180", "data-[starting-style]:scale-96 data-[starting-style]:opacity-0", "data-[side=bottom]:data-[starting-style]:-translate-y-1 data-[side=top]:data-[starting-style]:translate-y-1", "data-[side=left]:data-[starting-style]:translate-x-1 data-[side=right]:data-[starting-style]:-translate-x-1", "data-[side=inline-end]:data-[starting-style]:-translate-x-1 data-[side=inline-start]:data-[starting-style]:translate-x-1", "data-[ending-style]:scale-98 data-[ending-style]:opacity-0 data-[ending-style]:duration-140", "data-[instant]:transition-none", "motion-reduce:translate-none! motion-reduce:scale-none!");
function MenuContent({ side = "bottom", align = "start", sideOffset = 6, alignOffset = 0, container, className, ...props }: MenuContentProps) {
    return (<MenuPrimitive.Portal container={container}>
      <MenuPrimitive.Positioner side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} className="z-50 outline-none">
        <MenuPrimitive.Popup data-slot="menu-content" className={cn(popupSurface, popupMotion, "chatcn-scroll min-w-[max(11rem,var(--anchor-width))] overflow-y-auto p-1", className)} {...props}/>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>);
}
function MenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
    return <MenuPrimitive.RadioGroup data-slot="menu-radio-group" {...props}/>;
}
function MenuLabel({ className, ...props }: MenuPrimitive.GroupLabel.Props) {
    return (<MenuPrimitive.GroupLabel data-slot="menu-label" className={cn("text-[0.75rem]/[1rem] text-(color:--chatcn-fg-subtle) flex h-7 items-center gap-1.5 px-2 font-medium select-none", "[&_svg]:size-3.5", className)} {...props}/>);
}
const item = cn("group/menu-item rounded-(--chatcn-radius-md) relative flex min-h-8 w-full cursor-default items-center gap-2 px-2 py-1.5", "text-[0.875rem]/[1.25rem] tracking-[-0.003em] text-(color:--chatcn-fg) text-start outline-none select-none", "data-[highlighted]:bg-(color:--chatcn-fill-hover) data-[popup-open]:bg-(color:--chatcn-fill)", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", "[&>svg]:text-(color:--chatcn-fg-subtle) data-[highlighted]:[&>svg]:text-(color:--chatcn-fg) [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", "pointer-coarse:min-h-11");
function IndicatorSlot({ children }: {
    children: React.ReactNode;
}) {
    return (<span aria-hidden="true" className="ms-auto grid size-4 shrink-0 place-items-center ps-1">
      {children}
    </span>);
}
const iconNode11: IconNode = [
    ["path", { "d": "m4.5 12.75 3.23 3.23a2.5 2.5 0 0 0 3.54 0l8.48-8.48" }],
];
const CheckIcon: Icon = createIcon("check", iconNode11);
function MenuRadioItem({ className, children, ...props }: MenuPrimitive.RadioItem.Props & {
    children?: React.ReactNode;
}) {
    return (<MenuPrimitive.RadioItem data-slot="menu-radio-item" className={cn(item, className)} {...props}>
      {children}
      <IndicatorSlot>
        <MenuPrimitive.RadioItemIndicator className="text-(color:--chatcn-fg) grid place-items-center">
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </IndicatorSlot>
    </MenuPrimitive.RadioItem>);
}
function DeviceMenuItems({ label, devices, value, onValueChange, }: {
    label: string;
    devices: ChatcnAudioDevice[];
    value?: string;
    onValueChange?: (id: string) => void;
}) {
    return (<MenuRadioGroup value={value ?? devices.find((d) => d.isDefault)?.id ?? devices[0]?.id} onValueChange={(next) => onValueChange?.(String(next))}>
      <MenuLabel>{label}</MenuLabel>
      {devices.map((device) => (<MenuRadioItem key={device.id} value={device.id} closeOnClick>
          <span className="min-w-0 flex-1 truncate">{device.label}</span>
          {device.isDefault ? (<span className="text-[0.75rem]/[1rem] text-(color:--chatcn-fg-subtle) shrink-0">Default</span>) : null}
        </MenuRadioItem>))}
    </MenuRadioGroup>);
}
const iconNode12: IconNode = [
    ["path", { "d": "M4.5 8.5h1.63a1.5 1.5 0 0 0 1.06-.44l1.68-1.68a1.25 1.25 0 0 1 2.13.89v9.46a1.25 1.25 0 0 1-2.13.89l-1.68-1.68a1.5 1.5 0 0 0-1.06-.44H4.5A1.5 1.5 0 0 1 3 14v-4a1.5 1.5 0 0 1 1.5-1.5" }],
    ["path", { "d": "M14.93 9.03a4 4 0 0 1 0 5.94" }],
    ["path", { "d": "M17.18 5.7a8 8 0 0 1 0 12.6" }],
];
const Volume2Icon: Icon = createIcon("volume-2", iconNode12);
interface VoiceControlButtonProps extends Omit<React.ComponentProps<"button">, "children"> {
    label: string;
    pressed?: boolean;
    tooltip?: React.ReactNode | false;
    children: React.ReactNode;
}
const pressedStyle = "bg-(color:--chatcn-fill) text-(color:--chatcn-fg) shadow-[inset_0_0_0_1px_var(--chatcn-border-strong)] hover:bg-(color:--chatcn-fill-hover)";
function VoiceControlButton({ label, pressed, tooltip, className, children, ...props }: VoiceControlButtonProps) {
    const size = React.useContext(SizeContext);
    const button = (<button type="button" aria-label={label} aria-pressed={pressed} data-slot="voice-control-button" data-pressed={pressed ? "" : undefined} className={cn(control, box[size], pressed && pressedStyle, className)} {...props}>
      {children}
    </button>);
    if (tooltip === false)
        return button;
    return <Tooltip content={tooltip ?? label}>{button}</Tooltip>;
}
const iconNode13: IconNode = [
    ["path", { "d": "M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3" }],
    ["path", { "d": "M7 11h2.5" }],
    ["path", { "d": "M12.5 11H17" }],
    ["path", { "d": "M7 15h6" }],
    ["path", { "d": "M16 15h1" }],
];
const CaptionsIcon: Icon = createIcon("captions", iconNode13);
const iconNode14: IconNode = [
    ["path", { "d": "M3 13.75v1.5a1.5 1.5 0 0 0 1.5 1.5h2.75a1.5 1.5 0 0 0 1.5-1.5V13.6a11 11 0 0 1 6.5 0v1.65a1.5 1.5 0 0 0 1.5 1.5h2.75a1.5 1.5 0 0 0 1.5-1.5v-1.5a13 13 0 0 0-18 0" }],
];
const PhoneOffIcon: Icon = createIcon("phone-off", iconNode14);
function Popover(props: PopoverPrimitive.Root.Props) {
    return <PopoverPrimitive.Root {...props}/>;
}
interface PopoverContentProps extends PopoverPrimitive.Popup.Props {
    side?: PopoverPrimitive.Positioner.Props["side"];
    align?: PopoverPrimitive.Positioner.Props["align"];
    sideOffset?: PopoverPrimitive.Positioner.Props["sideOffset"];
    alignOffset?: PopoverPrimitive.Positioner.Props["alignOffset"];
    anchor?: PopoverPrimitive.Positioner.Props["anchor"];
    container?: PopoverPrimitive.Portal.Props["container"];
}
function PopoverContent({ side = "bottom", align = "center", sideOffset = 6, alignOffset = 0, anchor, container, className, ...props }: PopoverContentProps) {
    return (<PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Positioner side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} anchor={anchor} className="z-50 outline-none">
        <PopoverPrimitive.Popup data-slot="popover-content" className={cn(popupSurface, popupMotion, "text-[0.875rem]/[1.25rem] tracking-[-0.003em] chatcn-scroll overflow-auto p-1", className)} {...props}/>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>);
}
function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
    return (<PopoverPrimitive.Title data-slot="popover-title" className={cn("text-[0.875rem]/[1.25rem] tracking-[-0.003em] text-(color:--chatcn-fg) font-medium", className)} {...props}/>);
}
function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
    return (<PopoverPrimitive.Description data-slot="popover-description" className={cn("text-[0.8125rem]/[1.25rem] text-(color:--chatcn-fg-muted) text-pretty", className)} {...props}/>);
}
const microphoneErrorMessages: Record<ChatcnMicrophoneError, string> = {
    "not-allowed": "Allow microphone access from the site settings next to the address bar, then try again.",
    "not-found": "Connect a microphone or close other apps using it, then try again.",
    unsupported: "This page cannot use a microphone. Open it over HTTPS in a current browser.",
    unknown: "The microphone stopped unexpectedly. Try again.",
};
function PopoverClose(props: PopoverPrimitive.Close.Props) {
    return <PopoverPrimitive.Close data-slot="popover-close" {...props}/>;
}
function VoiceControls({ muted = false, onMutedChange, onModeChange, captions = false, onCaptionsChange, microphones, microphone, onMicrophoneChange, speakers, speaker, onSpeakerChange, inputLevel, micError, onRetryMicrophone, status = "active", onEnd, endLabel, disabled = false, size = "md", className, children, ...props }: VoiceControlsProps) {
    const micRef = React.useRef<HTMLButtonElement>(null);
    const [hintOpen, setHintOpen] = React.useState(false);
    React.useEffect(() => {
        setHintOpen(micError !== undefined);
    }, [micError]);
    const ended = status === "ended";
    const off = disabled || ended;
    const errored = micError !== undefined;
    const lg = size === "lg";
    return (<SizeContext.Provider value={size}>
      <div role="group" aria-label="Call controls" aria-disabled={off || undefined} data-slot="voice-controls" data-voice-status={status} data-size={size} className={cn("bg-white/95 dark:bg-[#241224] border border-[#EFE0EF] dark:border-[rgba(239,224,239,0.2)] shadow-[0_10px_30px_-4px_rgba(108,48,110,0.12),0_4px_12px_-2px_rgba(0,0,0,0.05)] inline-flex max-w-full items-center gap-2.5 p-1.5 rounded-full backdrop-blur-md", className)} {...props}>
        {/* 1. Clean 2D Microphone Button */}
        <Tooltip content={errored ? ERROR_TITLES[micError] : muted ? "Unmute Microphone" : "Mute Microphone"}>
          <button
            ref={micRef}
            type="button"
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={muted}
            disabled={off}
            data-slot="voice-controls-mute"
            data-muted={muted ? "" : undefined}
            onClick={() => {
              if (errored) {
                setHintOpen(true);
                return;
              }
              onMutedChange?.(!muted);
            }}
            className={cn(
              "size-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs border",
              muted || errored
                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900"
                : "bg-[#FAF6FA] text-[#6C306E] border-[#E5D5E5] hover:bg-[#F3E4F3] hover:border-[#6C306E] hover:text-[#531E55] dark:bg-[#6C306E]/25 dark:text-[#F5EDF5] dark:border-[#EFE0EF]/30 dark:hover:bg-[#6C306E]/45"
            )}
          >
            {muted || errored ? (
              <svg className="size-5 shrink-0 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="2" y1="2" x2="22" y2="22" />
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                <path d="M5 10v2a7 7 0 0 0 12 5" />
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            ) : (
              <svg className="size-5 shrink-0 text-[#6C306E] dark:text-[#F5EDF5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            )}
          </button>
        </Tooltip>

        {/* 2. Clean 2D Keyboard Button (Switch to text mode) */}
        <Tooltip content="Type a message">
          <button
            type="button"
            aria-label="Switch to keyboard"
            disabled={off}
            onClick={() => onModeChange?.("text")}
            data-slot="voice-controls-keyboard"
            className="size-10 rounded-full flex items-center justify-center bg-[#FAF6FA] text-[#6C306E] border border-[#E5D5E5] hover:bg-[#F3E4F3] hover:border-[#6C306E] hover:text-[#531E55] dark:bg-[#6C306E]/25 dark:text-[#F5EDF5] dark:border-[#EFE0EF]/30 dark:hover:bg-[#6C306E]/45 transition-all duration-200 cursor-pointer shadow-xs"
          >
            <svg className="size-5 shrink-0 text-[#6C306E] dark:text-[#F5EDF5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="3" />
              <line x1="6" y1="9" x2="6.01" y2="9" strokeWidth="2.5" />
              <line x1="10" y1="9" x2="10.01" y2="9" strokeWidth="2.5" />
              <line x1="14" y1="9" x2="14.01" y2="9" strokeWidth="2.5" />
              <line x1="18" y1="9" x2="18.01" y2="9" strokeWidth="2.5" />
              <line x1="6" y1="13" x2="6.01" y2="13" strokeWidth="2.5" />
              <line x1="10" y1="13" x2="10.01" y2="13" strokeWidth="2.5" />
              <line x1="14" y1="13" x2="14.01" y2="13" strokeWidth="2.5" />
              <line x1="18" y1="13" x2="18.01" y2="13" strokeWidth="2.5" />
              <line x1="8" y1="16" x2="16" y2="16" />
            </svg>
          </button>
        </Tooltip>

        {children}

        {/* 3. Red End Call Button */}
        {!ended && onEnd ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onEnd}
            data-slot="voice-controls-end"
            className="h-10 px-4 rounded-full flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold text-sm shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <svg className="size-4 shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.12-8.69 2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.29 9.35" />
              <line x1="22" y1="2" x2="2" y2="22" />
            </svg>
            <span>{endLabel ?? (status === "connecting" ? "Cancel" : "End")}</span>
          </button>
        ) : null}

        <Popover open={hintOpen && errored} onOpenChange={setHintOpen}>
          <PopoverContent anchor={micRef} side="top" align="start" sideOffset={10} initialFocus={false} finalFocus={false} role="alert" data-slot="voice-controls-mic-error" className="flex w-72 flex-col gap-1 p-3">
            {micError ? (<>
                <PopoverTitle className="flex items-center gap-1.5">
                  <MicOffIcon aria-hidden="true" className="text-(color:--chatcn-red) size-4"/>
                  {ERROR_TITLES[micError]}
                </PopoverTitle>
                <PopoverDescription>{microphoneErrorMessages[micError]}</PopoverDescription>
                <div className="mt-2 flex justify-end gap-1.5">
                  <PopoverClose render={<Button size="sm" variant="ghost"/>}>Dismiss</PopoverClose>
                  {onRetryMicrophone && micError !== "unsupported" ? (<Button size="sm" variant="solid" onClick={() => {
                    setHintOpen(false);
                    onRetryMicrophone();
                }}>
                      Try again
                    </Button>) : null}
                </div>
              </>) : null}
          </PopoverContent>
        </Popover>
      </div>
    </SizeContext.Provider>);
}
export function VoiceSession({ state, segments, inputLevel, outputLevel, visual = "orb", mode: modeProp, defaultMode = "voice", onModeChange, onSendText, onQuickAdd, muted = false, onMutedChange, captions: captionsProp, defaultCaptions = true, onCaptionsChange, onStart, onEnd, onReconnect, onInterrupt, startedAt, endedAt, title = "Emma (AI Beauty Advisor)", userLabel = "You", errorMessage, controls, placeholder = "Type a message...", className, onClose, language = "en", onLanguageChange, ...props }: VoiceSessionProps) {
    const [mode, setMode] = useControllable(modeProp, defaultMode, onModeChange);
    const [captions, setCaptions] = useControllable(captionsProp, defaultCaptions, onCaptionsChange);
    const [draft, setDraft] = React.useState("");
    const elapsed = useElapsed(startedAt, endedAt);
    const inCall = !["idle", "ended", "error"].includes(state);
    const textMode = mode === "text";
    const showTranscript = textMode || captions;
    const label = LABELS[state];
    const live = state === "listening" || state === "speaking" || state === "muted";
    const canInterrupt = state === "speaking" && onInterrupt !== undefined;
    const [announced, setAnnounced] = React.useState("");
    React.useEffect(() => setAnnounced(LABELS[state]), [state]);
    const textareaWrap = React.useRef<HTMLDivElement>(null);
    const switchMode = (next: VoiceSessionMode) => {
        setMode(next);
        if (next === "text") {
            requestAnimationFrame(() => textareaWrap.current?.querySelector("textarea")?.focus({ preventScroll: true }));
        }
    };
    const statusLine = elapsed !== undefined && state !== "idle" && state !== "connecting"
        ? `${label} · ${formatElapsed(elapsed)}`
        : label;
    const presenceLevel = state === "speaking" ? outputLevel : inputLevel;
    const presence = visual === "orb" ? (<VoiceOrbComponent size={180} state={orbState(state)} inputLevel={inputLevel} outputLevel={outputLevel} label={`${title}: ${label.toLowerCase()}`}/>) : (<AudioVisualizer variant={visual} state={visualizerState(state)} level={presenceLevel} className="h-28 w-64"/>);
    return (<div data-slot="voice-session" data-mode={mode} data-session-state={state} className={cn("bg-(color:--chatcn-card) text-(color:--chatcn-fg) flex h-full min-h-0 flex-col overflow-hidden", className)} {...props}>
      <span aria-live="polite" className="sr-only">
        {announced}
      </span>

      <header className="relative flex h-14 shrink-0 items-center gap-3 ps-4 pe-3 border-b border-[#EFE0EF]/80">
        <div aria-hidden="true" className={cn("absolute start-4 top-1/2 grid size-7 -translate-y-1/2 place-items-center", "ease-(--chatcn-ease-out) transition-[opacity,scale] duration-200 motion-reduce:transition-none", textMode ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0")}>
          {textMode ? (<VoiceOrbComponent size={28} state={orbState(state)} inputLevel={inputLevel} outputLevel={outputLevel} label=""/>) : null}
        </div>
        <div className={cn("flex min-w-0 flex-1 flex-col", "ease-(--chatcn-ease-out) transition-[translate] duration-200 motion-reduce:transition-none", textMode ? "translate-x-10 rtl:-translate-x-10" : "translate-x-0")}>
          <span className={cn("text-[0.875rem]/[1.25rem] tracking-[-0.003em] truncate font-bold text-[#241224]", textMode && "pe-10")}>
            {title}
          </span>
          <span data-slot="voice-session-status" className={cn("text-[0.75rem]/[1rem] truncate tabular-nums", textMode && "pe-10", state === "error" ? "text-(color:--chatcn-red)" : "text-(color:--chatcn-fg-subtle)")}>
            {statusLine}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onLanguageChange && (
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg inline-flex h-8 p-0.5 border border-gray-200/80 dark:border-zinc-700 shadow-xs">
              <button
                type="button"
                onClick={() => onLanguageChange("en")}
                className={cn(
                  "px-2 rounded-md font-bold text-xs transition-all flex items-center gap-1 cursor-pointer select-none",
                  language === "en"
                    ? "bg-white text-gray-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400"
                )}
                title="Speak English / Banglish"
              >
                <span>🇬🇧</span>
                <span className="hidden sm:inline">EN</span>
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange("bn")}
                className={cn(
                  "px-2 rounded-md font-bold text-xs transition-all flex items-center gap-1 cursor-pointer select-none",
                  language === "bn"
                    ? "bg-white text-gray-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400"
                )}
                title="বাংলায় কথা বলুন"
              >
                <span>🇧🇩</span>
                <span>বাংলা</span>
              </button>
            </div>
          )}
          <ModeSwitch mode={mode} onChange={switchMode}/>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close voice call"
              className="chatcn-close-btn size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 hover:rotate-90 hover:scale-110 active:scale-95 cursor-pointer"
              title="Close"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : null}
        </div>
      </header>

      <div data-slot="voice-session-stage" className={cn("ease-(--chatcn-ease-out) grid shrink-0 transition-[grid-template-rows,opacity] duration-280 motion-reduce:transition-none", textMode ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100", !textMode && !showTranscript && "flex-1")} inert={textMode || undefined}>
        <div className="flex min-h-0 flex-col items-center justify-center overflow-hidden">
          <div className="relative flex flex-col items-center gap-2 pt-3 pb-3">
            {/* Ambient glowing luxury aura based on state */}
            <div
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 left-1/2 pointer-events-none rounded-full blur-3xl transition-all duration-700 ease-out",
                state === "speaking" && "size-64 bg-gradient-to-tr from-[#E08CE4]/40 via-[#6C306E]/30 to-[#f472b6]/25 animate-[orbAuraBreathe_3.2s_ease-in-out_infinite]",
                state === "listening" && "size-60 bg-gradient-to-tr from-emerald-400/35 via-teal-500/25 to-cyan-400/20 animate-[orbPulseWave_2.4s_ease-in-out_infinite]",
                state === "thinking" && "size-60 bg-gradient-to-tr from-amber-300/35 via-purple-400/25 to-rose-300/20 animate-[orbSpinGlow_6s_linear_infinite]",
                (state === "idle" || state === "connecting" || state === "reconnecting") && "size-52 bg-gradient-to-tr from-purple-300/20 via-pink-300/15 to-transparent animate-[orbAuraBreathe_4s_ease-in-out_infinite]",
                state === "muted" && "size-48 bg-slate-300/20 dark:bg-slate-700/20",
                showTranscript ? "opacity-50 scale-75" : "opacity-100 scale-100"
              )}
            />

            <button type="button" disabled={!canInterrupt} onClick={onInterrupt} aria-label={canInterrupt ? `Interrupt ${title}` : undefined} tabIndex={canInterrupt ? 0 : -1} className={cn("chatcn-focus relative z-10 grid place-items-center rounded-full outline-offset-4 transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]", canInterrupt ? "cursor-pointer" : "cursor-default")}>
              <span className={cn("grid place-items-center", "ease-(--chatcn-ease-out) transition-[scale] duration-280 motion-reduce:transition-none", showTranscript ? "-my-6 scale-[0.72]" : "scale-100")}>
                {presence}
              </span>
            </button>
            <div className="relative z-10 flex min-h-9 flex-col items-center gap-1.5 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] shadow-xs transition-all duration-300">
                <span className="relative flex size-2.5">
                  {live ? (
                    <span className={cn(
                      "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                      state === "speaking" ? "bg-[#E08CE4]" : state === "listening" ? "bg-emerald-400" : "bg-amber-400"
                    )} />
                  ) : null}
                  <span className={cn(
                    "relative inline-flex size-2.5 rounded-full transition-colors duration-300",
                    state === "speaking" ? "bg-[#6C306E]" :
                    state === "listening" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" :
                    state === "thinking" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" :
                    state === "muted" ? "bg-slate-400" :
                    state === "error" ? "bg-red-500" : "bg-emerald-400"
                  )} />
                </span>
                <span key={state} className={cn("text-[0.875rem]/[1.25rem] tracking-[-0.003em] font-semibold animate-[textStatusFadeIn_0.25s_ease-out]", state === "error" ? "text-(color:--chatcn-fg)" : "text-(color:--chatcn-fg-muted)")}>
                  {state === "thinking" ? (<ShimmerText>Consulting catalog & advice...</ShimmerText>) : state === "ended" && elapsed !== undefined ? (`Call ended · ${formatElapsed(elapsed).replace(" ", NBSP)}`) : state === "connecting" || state === "reconnecting" ? (`${label}...`) : (label)}
                </span>
              </div>
              <span className="text-[0.75rem]/[1rem] text-(color:--chatcn-fg-subtle) max-w-72 text-pretty transition-opacity duration-300">
                {state === "error"
            ? (errorMessage ?? "Check your network, then reconnect.")
            : canInterrupt
                ? "Tap the orb or speak to interrupt"
                : state === "muted"
                    ? "Unmute to talk, or switch to text"
                    : state === "idle"
                        ? "Talk or type. Switch any time."
                        : " "}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showTranscript ? (<Transcript showTimestamps={false} segments={segments} onQuickAdd={onQuickAdd} userLabel={userLabel} assistantLabel={title} className={cn("border-(color:--chatcn-border) min-h-0 flex-1", !textMode && "border-t", "ease-(--chatcn-ease-out-soft) transition-opacity duration-150 starting:opacity-0")}/>) : null}

      <footer className="border-(color:--chatcn-border) shrink-0 border-t px-3 py-3">
        {textMode ? (<div ref={textareaWrap}>
            <PromptInput variant="minimal" value={draft} onValueChange={setDraft} disabled={!inCall && state !== "idle"} onSubmit={({ text }) => {
                onSendText?.(text);
                setDraft("");
            }}>
              <PromptInputTextarea placeholder={placeholder} aria-label="Message"/>
              <PromptInputButton tooltip="Switch to voice" onClick={() => switchMode("voice")}>
                <AudioLinesIcon />
              </PromptInputButton>
              <PromptInputSubmit />
            </PromptInput>
          </div>) : state === "idle" || state === "ended" ? (<div className="flex justify-center">
            <Button variant="solid" size="lg" className="chatcn-primary-action-btn rounded-full ps-3.5 pe-4 bg-[#6C306E] text-white hover:bg-[#562258]" onClick={onStart}>
              <MicIcon />
              {state === "ended" ? "Start a new call" : "Start consultation"}
            </Button>
          </div>) : state === "error" ? (<div className="flex justify-center gap-2">
            <Button size="lg" variant="outline" className="rounded-full" onClick={onEnd}>
              Close
            </Button>
            <Button size="lg" variant="solid" className="chatcn-primary-action-btn rounded-full ps-3.5 pe-4 bg-[#6C306E] text-white" onClick={onReconnect}>
              <RotateCcwIcon />
              Reconnect
            </Button>
          </div>) : (<div className="flex justify-center">
            <VoiceControls {...controls} muted={muted} onMutedChange={onMutedChange} onModeChange={switchMode} captions={captions} onCaptionsChange={setCaptions} inputLevel={live && !muted ? inputLevel : undefined} status={state === "connecting" || state === "reconnecting" ? "connecting" : "active"} onEnd={onEnd}/>
          </div>)}
      </footer>
    </div>);
}
export default VoiceSession;
