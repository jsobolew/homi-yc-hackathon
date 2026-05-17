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
  patchPad?: number;
  capPad?: number;
  patchBg?: string;
  capBg?: string;
}

export const SPONSORS: Record<SponsorKey, SponsorMeta> = {
  browserUse: { name: 'Browser Use', src: '/sponsors/browseruse.svg', bg: '#1a1326', pad: 0.12, patchPad: 0.16, capPad: 0.18, patchBg: '#1a1326', capBg: '#1a1326' },
  agentPhone: { name: 'AgentPhone', src: '/sponsors/agentphone.png', bg: '#ffffff', pad: 0.08, patchPad: 0.12, capPad: 0.16, patchBg: '#f4f0e8', capBg: '#f4f0e8' },
  agentMail: { name: 'AgentMail', src: '/sponsors/agentmail.png', bg: '#ffffff', pad: 0.06, patchPad: 0.1, capPad: 0.14, patchBg: '#f2efe7', capBg: '#f2efe7' },
  moss: { name: 'Moss', src: '/sponsors/moss.png', bg: '#ffffff', pad: 0.04, patchPad: 0.08, capPad: 0.14, patchBg: '#f2efe7', capBg: '#f2efe7' },
  stripe: { name: 'Stripe', src: '/sponsors/stripe.png', bg: '#635bff', pad: 0.04, patchPad: 0.06, capPad: 0.1, patchBg: '#635bff', capBg: '#635bff' },
  sponge: { name: 'Sponge', src: '/sponsors/sponge.png', bg: '#ffffff', pad: 0.04, patchPad: 0.08, capPad: 0.12, patchBg: '#f2efe7', capBg: '#f2efe7' },
  supermemory: { name: 'Supermemory', src: '/sponsors/supermemory.svg', bg: '#ffffff', pad: 0.1, patchPad: 0.16, capPad: 0.18, patchBg: '#f2efe7', capBg: '#f2efe7' },
  gemini: { name: 'Gemini', src: '/sponsors/gemini.svg', bg: '#0e1024', pad: 0.12, patchPad: 0.16, capPad: 0.18, patchBg: '#0e1024', capBg: '#0e1024' },
};

export const SPONSOR_KEYS: SponsorKey[] = Object.keys(SPONSORS) as SponsorKey[];

interface SponsorLogoProps {
  keyName: SponsorKey;
  size?: number;
  pixelated?: boolean;
  variant?: 'panel' | 'patch' | 'capBadge';
  style?: CSSProperties;
}

export function SponsorLogo({
  keyName,
  size = 24,
  pixelated = false,
  variant = 'panel',
  style,
}: SponsorLogoProps) {
  const meta = SPONSORS[keyName];
  if (!meta) return null;
  const paddingRatio =
    variant === 'patch'
      ? meta.patchPad ?? meta.pad
      : variant === 'capBadge'
        ? meta.capPad ?? meta.pad
        : meta.pad;
  const bg =
    variant === 'patch'
      ? meta.patchBg ?? meta.bg
      : variant === 'capBadge'
        ? meta.capBg ?? meta.bg
        : meta.bg;
  const padPx = Math.max(1, Math.round(size * paddingRatio));
  const borderRadius = variant === 'panel' ? 0 : Math.max(1, Math.round(size * 0.12));
  return (
    <div
      style={{
        width: size,
        height: size,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: padPx,
        boxSizing: 'border-box',
        overflow: 'hidden',
        lineHeight: 0,
        borderRadius,
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
