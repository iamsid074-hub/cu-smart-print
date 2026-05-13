import React from 'react';

/**
 * High-Fidelity iOS-style Icons
 * Built with pure SVG and CSS for maximum clarity and premium aesthetic.
 */

const SQUIRCLE_PATH = "M 0,25 C 0,5 5,0 25,0 H 75 C 95,0 100,5 100,25 V 75 C 100,95 95,100 75,100 H 25 C 5,100 0,95 0,75 Z";

const GlossOverlay = () => (
  <path
    d="M 5,25 C 5,10 10,5 25,5 H 75 C 90,5 95,10 95,25 V 45 C 50,55 5,45 5,25 Z"
    fill="white"
    fillOpacity="0.12"
  />
);

export const IosHomeIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <linearGradient id="homeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00C6FF" />
        <stop offset="100%" stopColor="#007AFF" />
      </linearGradient>
    </defs>
    <path d={SQUIRCLE_PATH} fill="url(#homeGrad)" />
    <path
      d="M 30,45 L 50,28 L 70,45 V 72 H 30 Z M 44,72 V 58 H 56 V 72"
      fill="none"
      stroke="white"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M 30,45 L 50,28 L 70,45 V 72 H 30 Z" fill="white" fillOpacity="0.1" />
    <GlossOverlay />
  </svg>
);

export const IosCombosIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <linearGradient id="combosGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFCC00" />
        <stop offset="100%" stopColor="#FF9500" />
      </linearGradient>
    </defs>
    <path d={SQUIRCLE_PATH} fill="url(#combosGrad)" />
    <g transform="translate(25, 25) scale(0.5)">
      <path
        d="M 15,10 V 50 M 35,10 V 50 M 55,10 V 50 M 15,50 C 15,80 55,80 55,50 M 35,80 V 100"
        fill="none"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 85,10 C 65,10 65,60 85,100 V 10"
        fill="white"
        fillOpacity="0.8"
        stroke="white"
        strokeWidth="4"
      />
    </g>
    <GlossOverlay />
  </svg>
);

export const IosProfileIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d={SQUIRCLE_PATH} fill="white" />
    <circle cx="50" cy="40" r="12" fill="#007AFF" />
    <path d="M 25,75 C 25,60 35,55 50,55 C 65,55 75,60 75,75" fill="#007AFF" />
    <path
      d={SQUIRCLE_PATH}
      fill="none"
      stroke="rgba(0,0,0,0.05)"
      strokeWidth="1"
    />
    <GlossOverlay />
  </svg>
);

export const IosSettingsIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <linearGradient id="settingsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E5E5EA" />
        <stop offset="100%" stopColor="#8E8E93" />
      </linearGradient>
    </defs>
    <path d={SQUIRCLE_PATH} fill="url(#settingsGrad)" />
    <circle cx="50" cy="50" r="18" fill="none" stroke="white" strokeWidth="6" strokeDasharray="10 4" />
    <circle cx="50" cy="50" r="8" fill="white" />
    <GlossOverlay />
  </svg>
);
