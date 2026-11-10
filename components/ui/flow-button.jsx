'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FlowButton({ 
  text = "Sign In", 
  href, 
  onClick, 
  className = "" 
}) {
  const content = (
    <>
      {/* Left arrow (arr-2) */}
      <ArrowRight 
        className="absolute w-3.5 h-3.5 left-[-25%] stroke-[#6C306E] fill-none z-[9] group-hover/flow:left-4 group-hover/flow:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-2.5 group-hover/flow:translate-x-2.5 transition-all duration-[800ms] ease-out leading-none select-none">
        {text}
      </span>

      {/* Expanding Brand Circle */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] rounded-full opacity-0 group-hover/flow:w-[380px] group-hover/flow:h-[380px] group-hover/flow:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-none" />

      {/* Right arrow (arr-1) */}
      <ArrowRight 
        className="absolute w-3.5 h-3.5 right-4 stroke-[#6C306E] fill-none z-[9] group-hover/flow:right-[-25%] group-hover/flow:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />
    </>
  );

  const baseClasses = `group/flow relative inline-flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[#6C306E]/40 bg-transparent px-7 h-10 text-xs font-bold text-[#6C306E] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[12px] hover:shadow-[0_8px_24px_rgba(108,48,110,0.35)] active:scale-[0.95] select-none ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseClasses}>
      {content}
    </button>
  );
}

export default FlowButton;
