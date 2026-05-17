import type { CSSProperties } from 'react';

export type SponsorKey =
  | 'browserUse'
  | 'agentPhone'
  | 'agentMail'
  | 'moss'
  | 'stripe'
  | 'sponge'
  | 'supermemory'
  | 'gemini';

interface SponsorMeta {
  name: string;
  src: string;
  bg: string;
  pad: number;
}

export const SPONSORS: Record<SponsorKey, SponsorMeta> = {
  browserUse: { name: 'Browser Use', src: '/sponsors/browseruse.svg', bg: '#1a1326', pad: 0.12 },
  agentPhone: { name: 'AgentPhone', src: '/sponsors/agentphone.png', bg: '#ffffff', pad: 0.08 },
  agentMail: { name: 'AgentMail', src: '/sponsors/agentmail.png', bg: '#ffffff', pad: 0.06 },
  moss: { name: 'Moss', src: '/sponsors/moss.png', bg: '#ffffff', pad: 0.04 },
  stripe: { name: 'Stripe', src: '/sponsors/stripe.png', bg: '#635bff', pad: 0.04 },
  sponge: { name: 'Sponge', src: '/sponsors/sponge.png', bg: '#ffffff', pad: 0.04 },
  supermemory: { name: 'Supermemory', src: '/sponsors/supermemory.svg', bg: '#ffffff', pad: 0.1 },
  gemini: { name: 'Gemini', src: '/sponsors/gemini.svg', bg: '#0e1024', pad: 0.12 },
};

export const SPONSOR_KEYS: SponsorKey[] = Object.keys(SPONSORS) as SponsorKey[];

interface SponsorLogoProps {
  keyName: SponsorKey;
  size?: number;
  pixelated?: boolean;
  showLabel?: boolean;
  style?: CSSProperties;
}

export function SponsorLogo({ keyName, size = 24, pixelated = false, showLabel: _showLabel, style }: SponsorLogoProps) {
  const meta = SPONSORS[keyName];
  if (!meta) return null;
  const padPx = Math.max(1, Math.round(size * meta.pad));
  return (
    <div
      style={{
        width: size,
        height: size,
        background: meta.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: padPx,
        boxSizing: 'border-box',
        overflow: 'hidden',
        lineHeight: 0,
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={meta.src}
        alt={meta.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          imageRendering: pixelated ? 'pixelated' : 'auto',
          display: 'block',
        }}
      />
    </div>
  );
}
