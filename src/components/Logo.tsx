import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  light?: boolean;
}

export default function Logo({ className = "h-12 w-auto", showText = true, light = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG Icon of the logo matching the uploaded image */}
      <svg
        id="pearls-butik-logo-svg"
        viewBox="0 0 500 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto drop-shadow-[0_2px_8px_rgba(212,175,55,0.15)]"
      >
        {/* Golden outer circle with a small gap on the right */}
        <path
          d="M 230 40 A 175 175 0 1 0 380 270"
          stroke="url(#goldGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 385 240 A 175 175 0 0 0 355 100"
          stroke="url(#goldGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="4 4"
          fill="none"
        />

        {/* Elegant glowing star at top right */}
        <g transform="translate(370, 75)">
          <path
            d="M 0 -22 Q 0 0 22 0 Q 0 0 0 22 Q 0 0 -22 0 Q 0 0 0 -22 Z"
            fill="url(#goldGradient)"
          />
          <circle r="3" fill="#FFF" />
        </g>

        {/* Floating star decoration */}
        <g transform="translate(415, 150) scale(0.6)">
          <path
            d="M 0 -15 Q 0 0 15 0 Q 0 0 0 15 Q 0 0 -15 0 Q 0 0 0 -15 Z"
            fill="url(#goldGradient)"
          />
        </g>

        {/* Mannequin / Dress Silhouette on the Left */}
        {/* Dress bodice and stand */}
        <g id="mannequin" transform="translate(130, 80)">
          {/* Wooden/Gold Neck finial */}
          <ellipse cx="40" cy="10" rx="4" ry="6" fill="url(#goldGradient)" />
          <path d="M 36 15 H 44 V 25 H 36 Z" fill="url(#goldGradient)" />
          
          {/* Mannequin shoulders support */}
          <path d="M 18 35 C 25 31, 55 31, 62 35 L 56 60 H 24 Z" fill="#222" opacity="0.3" />

          {/* Flowing Pink Dress */}
          {/* Strapless neckline bodice */}
          <path
            d="M 20 38 C 25 33, 40 37, 40 37 C 40 37, 55 33, 60 38 C 64 50, 60 75, 55 90 C 50 102, 30 102, 25 90 C 20 75, 16 50, 20 38 Z"
            fill="url(#pinkGradient)"
          />
          {/* Waist belt in gold */}
          <path d="M 24 88 C 30 90, 50 90, 56 88 L 55 92 C 50 94, 30 94, 25 92 Z" fill="url(#goldGradient)" />

          {/* Flowing skirt sweeping around the circle */}
          <path
            d="M 25 91 
               C 22 130, 28 175, 45 210 
               C 65 245, 100 270, 160 280 
               C 240 292, 300 240, 310 215 
               C 290 235, 220 272, 155 260 
               C 105 250, 75 220, 56 185 
               C 42 155, 33 125, 35 91 Z"
            fill="url(#pinkGradient)"
          />

          {/* Highlight fold lines on the dress */}
          <path
            d="M 40 37 C 38 60, 35 80, 40 88"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M 32 91 C 30 130, 38 180, 65 215 C 90 245, 130 262, 175 268"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M 44 91 C 45 125, 55 165, 85 195 C 115 225, 165 240, 220 248"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* Elegant letters "P.R." inside the circle */}
        <text
          x="285"
          y="200"
          fontFamily="Cinzel, Playfair Display, 'Didot', 'Georgia', serif"
          fontWeight="500"
          fontSize="95"
          letterSpacing="2"
          fill="url(#goldGradient)"
          textAnchor="middle"
        >
          P.R.
        </text>

        {/* Owner's last name "INGOLE" beneath P.R. */}
        <text
          x="285"
          y="245"
          fontFamily="Inter, Montserrat, sans-serif"
          fontWeight="400"
          fontSize="30"
          letterSpacing="8"
          fill={light ? "#222" : "#FFF"}
          textAnchor="middle"
        >
          INGOLE
        </text>

        {/* Small gold line separator */}
        <line x1="210" y1="265" x2="360" y2="265" stroke="url(#goldGradient)" strokeWidth="1.5" />
        <path d="M 285 262 L 288 265 L 285 268 L 282 265 Z" fill="url(#goldGradient)" />

        {/* Rose pink floral vines flowing on bottom right of the circle */}
        <g transform="translate(320, 210)">
          {/* Main stem */}
          <path
            d="M 10 30 Q 40 45, 75 20 T 115 -10 Q 110 10, 115 40"
            stroke="url(#pinkGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Leaf 1 */}
          <path
            d="M 45 35 C 55 25, 75 35, 70 45 C 60 55, 45 45, 45 35 Z"
            fill="url(#pinkGradient)"
          />
          {/* Leaf 2 */}
          <path
            d="M 75 20 C 85 5, 105 10, 100 25 C 90 35, 75 30, 75 20 Z"
            fill="url(#pinkGradient)"
          />
          {/* Leaf 3 */}
          <path
            d="M 115 -10 C 130 -15, 135 5, 120 15 C 110 20, 105 0, 115 -10 Z"
            fill="url(#pinkGradient)"
          />
          {/* Leaf 4 (smaller) */}
          <path
            d="M 20 25 C 15 10, 30 5, 35 15 C 35 25, 25 30, 20 25 Z"
            fill="url(#pinkGradient)"
          />
          {/* Leaf 5 (sweeping scroll leaf) */}
          <path
            d="M 112 25 C 122 35, 135 25, 130 15 C 120 10, 108 15, 112 25 Z"
            fill="url(#pinkGradient)"
          />
        </g>

        {/* Bottom Tagline: "STYLE THAT SPEAKS, ELEGANCE THAT STAYS" */}
        <text
          x="250"
          y="370"
          fontFamily="Inter, Montserrat, sans-serif"
          fontWeight="500"
          fontSize="12.5"
          letterSpacing="4"
          fill="url(#goldGradient)"
          textAnchor="middle"
        >
          STYLE THAT SPEAKS, ELEGANCE THAT STAYS.
        </text>

        {/* Small gold bottom ornament */}
        <g transform="translate(250, 395)">
          <line x1="-60" y1="0" x2="-10" y2="0" stroke="url(#goldGradient)" strokeWidth="1" />
          <line x1="10" y1="0" x2="60" y2="0" stroke="url(#goldGradient)" strokeWidth="1" />
          <path d="M 0 -5 L 5 0 L 0 5 L -5 0 Z" fill="url(#goldGradient)" />
          <circle cx="-35" cy="0" r="2" fill="url(#goldGradient)" />
          <circle cx="35" cy="0" r="2" fill="url(#goldGradient)" />
        </g>

        {/* Definition of gradients */}
        <defs>
          {/* Luxurious Metallic Gold Gradient */}
          <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5D061" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#AA7C11" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>

          {/* Gorgeous Velvet Rose Pink Gradient redefined to Champagne Gold */}
          <linearGradient id="pinkGradient" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#FDFBF7" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8A6B0E" />
          </linearGradient>
        </defs>
      </svg>

      {/* Brand Text for layout */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif text-xl tracking-widest font-bold ${light ? "text-[#111111]" : "text-white"}`}>
            PEARLS<span className="text-[#D4AF37]"> BUTIK</span>
          </span>
          <span className="text-[9px] tracking-[0.22em] text-[#D4AF37] uppercase font-mono">
            Elegance Stitched
          </span>
        </div>
      )}
    </div>
  );
}
