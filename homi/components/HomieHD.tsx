import { Pixel } from './Pixel';
import { SponsorLogo, type SponsorKey } from './SponsorLogo';
import {
  DEFAULT_PALETTE,
  HOMIE_HD_DEFS,
  HOMIE_HD_SPRITES,
  homieDeskHD,
} from './sprites';

interface HomieHDProps {
  defIdx: number;
  scale?: number;
  palette?: Record<string, string>;
  sponsorKey?: SponsorKey;
  className?: string;
}

// Standing HD homie — 16w x 24h, with sponsor logo composited on the chest.
export function HomieHD({
  defIdx,
  scale = 2,
  palette = DEFAULT_PALETTE,
  sponsorKey,
  className,
}: HomieHDProps) {
  const def = HOMIE_HD_DEFS[defIdx % HOMIE_HD_DEFS.length];
  const sponsor = (sponsorKey ?? def.sponsor) as SponsorKey;
  const sprite = HOMIE_HD_SPRITES[defIdx % HOMIE_HD_SPRITES.length];
  const logoSize = 11 * scale;
  const logoX = (16 * scale - logoSize) / 2;
  const logoY = 13 * scale;
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: 16 * scale,
        height: 24 * scale,
        display: 'inline-block',
      }}
    >
      <Pixel sprite={sprite} scale={scale} palette={palette} />
      {sponsor && (
        <div style={{ position: 'absolute', left: logoX, top: logoY, pointerEvents: 'none' }}>
          <SponsorLogo keyName={sponsor} size={logoSize} pixelated={true} />
        </div>
      )}
    </div>
  );
}

interface HomieDeskHDProps extends HomieHDProps {
  mode?: 'laptop' | 'phone';
}

// HD homie sitting at a desk — 24w x 26h.
export function HomieDeskHD({
  defIdx,
  mode = 'laptop',
  scale = 1,
  palette = DEFAULT_PALETTE,
  sponsorKey,
  className,
}: HomieDeskHDProps) {
  const def = HOMIE_HD_DEFS[defIdx % HOMIE_HD_DEFS.length];
  const sponsor = (sponsorKey ?? def.sponsor) as SponsorKey;
  const sprite = homieDeskHD(def.hood, def.hoodie, mode, def.skin);
  const logoSize = 12 * scale;
  const logoX = (24 * scale - logoSize) / 2;
  const logoY = 14 * scale;
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: 24 * scale,
        height: 26 * scale,
        display: 'inline-block',
      }}
    >
      <Pixel sprite={sprite} scale={scale} palette={palette} />
      {sponsor && (
        <div style={{ position: 'absolute', left: logoX, top: logoY, pointerEvents: 'none' }}>
          <SponsorLogo keyName={sponsor} size={logoSize} pixelated={true} />
        </div>
      )}
    </div>
  );
}
