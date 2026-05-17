import { useId, type CSSProperties } from 'react';

interface LogoProps {
  size?: number;
}

function LogoHalo({ size = 64 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#1a1326" />
      <circle cx="32" cy="26" r="16" fill="none" stroke="#ffd966" strokeWidth="6" />
      <circle cx="32" cy="26" r="6" fill="#ffd966" />
      <text x="32" y="58" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="11" fontWeight="700" fill="#ffd966">HALO</text>
    </svg>
  );
}

function LogoNexus({ size = 64 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#0e1024" />
      <line x1="16" y1="18" x2="48" y2="18" stroke="#5dc8e3" strokeWidth="2.5" />
      <line x1="16" y1="34" x2="48" y2="34" stroke="#5dc8e3" strokeWidth="2.5" />
      <line x1="16" y1="18" x2="16" y2="34" stroke="#5dc8e3" strokeWidth="2.5" />
      <line x1="48" y1="18" x2="48" y2="34" stroke="#5dc8e3" strokeWidth="2.5" />
      <line x1="16" y1="18" x2="48" y2="34" stroke="#5dc8e3" strokeWidth="2.5" />
      <line x1="48" y1="18" x2="16" y2="34" stroke="#5dc8e3" strokeWidth="2.5" />
      <circle cx="16" cy="18" r="4" fill="#fff" />
      <circle cx="48" cy="18" r="4" fill="#fff" />
      <circle cx="16" cy="34" r="4" fill="#fff" />
      <circle cx="48" cy="34" r="4" fill="#fff" />
      <text x="32" y="56" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="9" fontWeight="700" fill="#fff">NEXUS</text>
    </svg>
  );
}

function LogoVolt({ size = 64 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#ffd966" />
      <polygon points="36,6 18,32 28,32 22,46 46,22 36,22 42,6" fill="#1a1326" />
      <text x="32" y="60" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="10" fontWeight="700" fill="#1a1326">VOLT</text>
    </svg>
  );
}

function LogoForge({ size = 64 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#c14a4a" />
      <rect x="14" y="12" width="36" height="10" fill="#1a1326" />
      <rect x="28" y="22" width="8" height="20" fill="#1a1326" />
      <rect x="14" y="12" width="36" height="3" fill="#fff" opacity="0.4" />
      <text x="32" y="58" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="9" fontWeight="700" fill="#fff">FORGE</text>
    </svg>
  );
}

function LogoAtlas({ size = 64 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#2e7d32" />
      <circle cx="32" cy="24" r="14" fill="#0e1024" />
      <ellipse cx="32" cy="24" rx="14" ry="5" fill="none" stroke="#6cc24a" strokeWidth="2" />
      <ellipse cx="32" cy="24" rx="5" ry="14" fill="none" stroke="#6cc24a" strokeWidth="2" />
      <line x1="18" y1="24" x2="46" y2="24" stroke="#6cc24a" strokeWidth="2" />
      <text x="32" y="56" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="9" fontWeight="700" fill="#fff">ATLAS</text>
    </svg>
  );
}

function LogoComet({ size = 64 }: LogoProps) {
  // useId keeps the gradient id stable across server + client renders,
  // avoiding hydration mismatch warnings under Next App Router.
  const gradId = `cometGrad-${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#1a1326" />
      <defs>
        <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ff8fb1" />
          <stop offset="100%" stopColor="#8b5cb8" />
        </linearGradient>
      </defs>
      <polygon points="8,38 22,24 50,8 36,30 28,28 22,36" fill={`url(#${gradId})`} />
      <circle cx="48" cy="10" r="6" fill="#fff" />
      <text x="32" y="58" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="9" fontWeight="700" fill="#fff">COMET</text>
    </svg>
  );
}

function LogoRivet({ size = 64 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#fff1d1" />
      <circle cx="32" cy="26" r="14" fill="#1a1326" />
      <circle cx="32" cy="26" r="8" fill="#fff1d1" />
      <circle cx="32" cy="26" r="4" fill="#1a1326" />
      <text x="32" y="58" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="9" fontWeight="700" fill="#1a1326">RIVET</text>
    </svg>
  );
}

function LogoPixel({ size = 64 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#0e1024" />
      <rect x="12" y="6" width="12" height="12" fill="#ff8fb1" />
      <rect x="26" y="6" width="12" height="12" fill="#5dc8e3" />
      <rect x="40" y="6" width="12" height="12" fill="#ffd966" />
      <rect x="12" y="20" width="12" height="12" fill="#5dc8e3" />
      <rect x="26" y="20" width="12" height="12" fill="#fff" />
      <rect x="40" y="20" width="12" height="12" fill="#ff8fb1" />
      <rect x="12" y="34" width="12" height="12" fill="#ffd966" />
      <rect x="26" y="34" width="12" height="12" fill="#ff8fb1" />
      <rect x="40" y="34" width="12" height="12" fill="#5dc8e3" />
      <text x="32" y="58" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="8" fontWeight="700" fill="#fff">PIXEL</text>
    </svg>
  );
}

export type SponsorKey = 'halo' | 'nexus' | 'volt' | 'forge' | 'atlas' | 'comet' | 'rivet' | 'pixel';

interface SponsorEntry {
  Component: (props: LogoProps) => React.JSX.Element;
  name: string;
}

export const SPONSORS: Record<SponsorKey, SponsorEntry> = {
  halo: { Component: LogoHalo, name: 'Halo' },
  nexus: { Component: LogoNexus, name: 'Nexus' },
  volt: { Component: LogoVolt, name: 'Volt' },
  forge: { Component: LogoForge, name: 'Forge' },
  atlas: { Component: LogoAtlas, name: 'Atlas' },
  comet: { Component: LogoComet, name: 'Comet' },
  rivet: { Component: LogoRivet, name: 'Rivet' },
  pixel: { Component: LogoPixel, name: 'Pixel' },
};

export const SPONSOR_KEYS: SponsorKey[] = Object.keys(SPONSORS) as SponsorKey[];

interface SponsorLogoProps {
  keyName: SponsorKey;
  size?: number;
  pixelated?: boolean;
  style?: CSSProperties;
}

export function SponsorLogo({ keyName, size = 24, pixelated = true, style }: SponsorLogoProps) {
  const entry = SPONSORS[keyName];
  if (!entry) return null;
  const Comp = entry.Component;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        imageRendering: pixelated ? 'pixelated' : 'auto',
        lineHeight: 0,
        ...style,
      }}
    >
      <Comp size={size} />
    </div>
  );
}
