import { useId, type CSSProperties } from 'react';

interface LogoProps {
  size?: number;
  showLabel?: boolean;
}

function maybeLabel({ showLabel = true }: LogoProps, text: string, fill: string, fontSize = 9) {
  if (!showLabel) return null;
  return (
    <text
      x="32"
      y="58"
      textAnchor="middle"
      fontFamily="'Press Start 2P', monospace"
      fontSize={fontSize}
      fontWeight="700"
      fill={fill}
    >
      {text}
    </text>
  );
}

function LogoBrowserUse(props: LogoProps) {
  const { size = 64 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#f3efe6" />
      <rect x="8" y="10" width="48" height="34" fill="#fff" stroke="#1a1326" strokeWidth="2" />
      <rect x="8" y="10" width="48" height="8" fill="#1a1326" />
      <rect x="11" y="12" width="3" height="3" fill="#ff5f57" />
      <rect x="16" y="12" width="3" height="3" fill="#ffbd2e" />
      <rect x="21" y="12" width="3" height="3" fill="#28c840" />
      <rect x="12" y="22" width="40" height="3" fill="#c8c2b3" />
      <polygon points="26,28 26,40 30,37 33,42 35,40 32,35 37,35" fill="#1a1326" />
      {maybeLabel(props, 'BROWSER USE', '#1a1326', 7)}
    </svg>
  );
}

function LogoAgentPhone(props: LogoProps) {
  const { size = 64 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#2a1854" />
      <rect x="14" y="12" width="6" height="14" fill="#ff8fb1" />
      <rect x="20" y="12" width="14" height="4" fill="#ff8fb1" />
      <rect x="14" y="26" width="14" height="4" fill="#ff8fb1" />
      <rect x="22" y="30" width="22" height="4" transform="rotate(35 22 30)" fill="#ff8fb1" />
      <rect x="38" y="38" width="6" height="14" fill="#ff8fb1" />
      <rect x="30" y="38" width="14" height="4" fill="#ff8fb1" />
      <rect x="38" y="48" width="14" height="4" fill="#ff8fb1" />
      <rect x="46" y="14" width="3" height="3" fill="#5dc8e3" />
      <rect x="50" y="18" width="3" height="3" fill="#5dc8e3" />
      <rect x="54" y="22" width="3" height="3" fill="#5dc8e3" />
      {maybeLabel(props, 'AGENTPHONE', '#fff', 7)}
    </svg>
  );
}

function LogoAgentMail(props: LogoProps) {
  const { size = 64 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#0e1024" />
      <rect x="10" y="14" width="44" height="28" fill="#fff1d1" stroke="#1a1326" strokeWidth="2" />
      <polygon points="10,14 32,32 54,14" fill="none" stroke="#1a1326" strokeWidth="2" />
      <polygon points="10,42 26,28 38,28 54,42" fill="none" stroke="#1a1326" strokeWidth="1" opacity="0.5" />
      <rect x="38" y="20" width="14" height="10" fill="#5dc8e3" stroke="#1a1326" strokeWidth="1.5" />
      <rect x="40" y="22" width="2" height="2" fill="#1a1326" />
      <rect x="44" y="22" width="2" height="2" fill="#1a1326" />
      <rect x="48" y="22" width="2" height="2" fill="#1a1326" />
      <polygon points="40,30 38,34 44,30" fill="#5dc8e3" stroke="#1a1326" strokeWidth="1" />
      {maybeLabel(props, 'AGENTMAIL', '#fff1d1', 7)}
    </svg>
  );
}

function LogoMoss(props: LogoProps) {
  const { size = 64 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#1f3a1f" />
      <rect x="8" y="12" width="4" height="28" fill="#6cc24a" />
      <rect x="22" y="12" width="4" height="28" fill="#6cc24a" />
      <rect x="12" y="16" width="4" height="4" fill="#6cc24a" />
      <rect x="14" y="20" width="4" height="4" fill="#6cc24a" />
      <rect x="16" y="24" width="4" height="4" fill="#6cc24a" />
      <rect x="14" y="20" width="2" height="2" fill="#a8e88a" />
      <circle cx="44" cy="24" r="10" fill="none" stroke="#a8e88a" strokeWidth="3" />
      <rect x="50" y="30" width="3" height="9" fill="#a8e88a" transform="rotate(45 50 30)" />
      {maybeLabel(props, 'MOSS', '#a8e88a', 10)}
    </svg>
  );
}

function LogoStripe(props: LogoProps) {
  const { size = 64 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#635bff" />
      <rect x="10" y="14" width="44" height="6" fill="#fff" />
      <rect x="14" y="22" width="40" height="6" fill="#fff" opacity="0.85" />
      <rect x="10" y="30" width="38" height="6" fill="#fff" opacity="0.7" />
      <rect x="18" y="38" width="36" height="6" fill="#fff" opacity="0.55" />
      {maybeLabel(props, 'STRIPE', '#fff', 10)}
    </svg>
  );
}

function LogoSponge(props: LogoProps) {
  const { size = 64 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#fff1d1" />
      <rect x="10" y="12" width="44" height="30" fill="#ffd966" stroke="#1a1326" strokeWidth="2" />
      <rect x="14" y="16" width="4" height="4" fill="#1a1326" />
      <rect x="22" y="20" width="4" height="4" fill="#1a1326" />
      <rect x="32" y="14" width="4" height="4" fill="#1a1326" />
      <rect x="42" y="18" width="4" height="4" fill="#1a1326" />
      <rect x="16" y="28" width="4" height="4" fill="#1a1326" />
      <rect x="26" y="32" width="4" height="4" fill="#1a1326" />
      <rect x="36" y="28" width="4" height="4" fill="#1a1326" />
      <rect x="44" y="34" width="4" height="4" fill="#1a1326" />
      <circle cx="50" cy="10" r="3" fill="#5dc8e3" stroke="#1a1326" strokeWidth="1" />
      <circle cx="56" cy="14" r="2" fill="#5dc8e3" stroke="#1a1326" strokeWidth="1" />
      {maybeLabel(props, 'SPONGE', '#1a1326', 10)}
    </svg>
  );
}

function LogoSupermemory(props: LogoProps) {
  const { size = 64 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#1a1326" />
      <rect x="14" y="10" width="36" height="8" fill="#ff8fb1" stroke="#fff" strokeWidth="1" />
      <rect x="18" y="14" width="2" height="2" fill="#fff" />
      <rect x="22" y="14" width="2" height="2" fill="#fff" />
      <rect x="12" y="20" width="40" height="8" fill="#8b5cb8" stroke="#fff" strokeWidth="1" />
      <rect x="16" y="24" width="2" height="2" fill="#fff" />
      <rect x="20" y="24" width="2" height="2" fill="#fff" />
      <rect x="24" y="24" width="2" height="2" fill="#fff" />
      <rect x="10" y="30" width="44" height="8" fill="#5dc8e3" stroke="#fff" strokeWidth="1" />
      <rect x="14" y="34" width="2" height="2" fill="#fff" />
      <rect x="18" y="34" width="2" height="2" fill="#fff" />
      <rect x="22" y="34" width="2" height="2" fill="#fff" />
      <rect x="26" y="34" width="2" height="2" fill="#fff" />
      {maybeLabel(props, 'SUPERMEMORY', '#fff', 7)}
    </svg>
  );
}

function LogoGemini(props: LogoProps) {
  const { size = 64 } = props;
  const gradId = `geminiGrad-${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="64" height="64" fill="#0e1024" />
      <defs>
        <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#4285f4" />
          <stop offset="50%" stopColor="#9b72f0" />
          <stop offset="100%" stopColor="#ff8fb1" />
        </linearGradient>
      </defs>
      <polygon points="32,6 38,24 56,26 38,30 32,46 26,30 8,26 26,24" fill={`url(#${gradId})`} />
      {maybeLabel(props, 'GEMINI', '#fff', 9)}
    </svg>
  );
}

export type SponsorKey =
  | 'browserUse'
  | 'agentPhone'
  | 'agentMail'
  | 'moss'
  | 'stripe'
  | 'sponge'
  | 'supermemory'
  | 'gemini';

interface SponsorEntry {
  Component: (props: LogoProps) => React.JSX.Element;
  name: string;
}

export const SPONSORS: Record<SponsorKey, SponsorEntry> = {
  browserUse: { Component: LogoBrowserUse, name: 'Browser Use' },
  agentPhone: { Component: LogoAgentPhone, name: 'AgentPhone' },
  agentMail: { Component: LogoAgentMail, name: 'AgentMail' },
  moss: { Component: LogoMoss, name: 'Moss' },
  stripe: { Component: LogoStripe, name: 'Stripe' },
  sponge: { Component: LogoSponge, name: 'Sponge' },
  supermemory: { Component: LogoSupermemory, name: 'Supermemory' },
  gemini: { Component: LogoGemini, name: 'Gemini' },
};

export const SPONSOR_KEYS: SponsorKey[] = Object.keys(SPONSORS) as SponsorKey[];

interface SponsorLogoProps {
  keyName: SponsorKey;
  size?: number;
  pixelated?: boolean;
  showLabel?: boolean;
  style?: CSSProperties;
}

export function SponsorLogo({ keyName, size = 24, pixelated = true, showLabel = true, style }: SponsorLogoProps) {
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
      <Comp size={size} showLabel={showLabel} />
    </div>
  );
}
