'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FlowButton({ 
  text = "Sign In", 
  badge,
  icon: Icon,
  href, 
  onClick, 
  className = "",
  target,
  rel,
  type = "button",
  activeState = false,
  ...props
}) {
  const [isTouched, setIsTouched] = useState(false);
  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
  const linkTarget = target || (isExternal ? "_blank" : undefined);
  const linkRel = rel || (isExternal ? "noopener noreferrer" : undefined);

  const isActive = isTouched || activeState;

  const content = (
    <>
      {/* Left arrow (arr-2) */}
      <ArrowRight 
        className={`absolute w-3.5 h-3.5 stroke-[#6C306E] fill-none z-[9] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isActive 
            ? 'left-3 sm:left-3.5 stroke-white' 
            : 'left-[-25%] group-hover/flow:left-3 sm:group-hover/flow:left-3.5 group-hover/flow:stroke-white group-active/flow:left-3 sm:group-active/flow:left-3.5 group-active/flow:stroke-white'
        }`} 
      />

      {/* Text & Content */}
      <span className={`relative z-[1] transition-all duration-[800ms] ease-out leading-none select-none inline-flex items-center gap-1.5 ${
        isActive 
          ? 'translate-x-3 sm:translate-x-3.5' 
          : '-translate-x-2 sm:-translate-x-2.5 group-hover/flow:translate-x-3 sm:group-hover/flow:translate-x-3.5 group-active/flow:translate-x-3 sm:group-active/flow:translate-x-3.5'
      }`}>
        {Icon && <Icon size={14} className="shrink-0 transition-colors" />}
        <span>{text}</span>
        {badge !== undefined && badge !== null && (
          <span className="text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center leading-none bg-[#6C306E] text-white group-hover/flow:bg-white group-hover/flow:text-[#3A0C38] transition-colors duration-300 shadow-2xs shrink-0 select-none">
            {badge}
          </span>
        )}
      </span>

      {/* Expanding Brand Circle */}
      <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] pointer-events-none transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${
        isActive 
          ? 'w-[380px] h-[380px] opacity-100' 
          : 'w-4 h-4 opacity-0 group-hover/flow:w-[380px] group-hover/flow:h-[380px] group-hover/flow:opacity-100 group-active/flow:w-[380px] group-active/flow:h-[380px] group-active/flow:opacity-100'
      }`} />

      {/* Right arrow (arr-1) */}
      <ArrowRight 
        className={`absolute w-3.5 h-3.5 stroke-[#6C306E] fill-none z-[9] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isActive 
            ? 'right-[-25%] stroke-white' 
            : 'right-3 sm:right-3.5 group-hover/flow:right-[-25%] group-hover/flow:stroke-white group-active/flow:right-[-25%] group-active/flow:stroke-white mobile-arrow-nudge'
        }`} 
      />
    </>
  );

  const baseClasses = `group/flow relative inline-flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[#6C306E]/40 bg-transparent px-7 h-11 text-xs font-bold text-[#6C306E] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[12px] hover:shadow-[0_8px_24px_rgba(108,48,110,0.35)] active:border-transparent active:text-white active:rounded-[12px] active:shadow-[0_8px_24px_rgba(108,48,110,0.35)] active:scale-[0.95] select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${
    isActive ? 'border-transparent text-white rounded-[12px] shadow-[0_8px_24px_rgba(108,48,110,0.35)] scale-[0.98]' : ''
  } ${className}`;

  const touchHandlers = {
    onTouchStart: () => setIsTouched(true),
    onTouchEnd: () => {
      setTimeout(() => setIsTouched(false), 550);
    },
    onTouchCancel: () => setIsTouched(false)
  };

  if (href) {
    return (
      <Link href={href} target={linkTarget} rel={linkRel} className={baseClasses} onClick={onClick} {...touchHandlers} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={baseClasses} {...touchHandlers} {...props}>
      {content}
    </button>
  );
}

export default FlowButton;
