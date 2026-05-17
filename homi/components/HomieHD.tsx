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
  sponsorSecondaryKey?: SponsorKey;
  className?: string;
}

export function HomieHD({
  defIdx,
  scale = 2,
  palette = DEFAULT_PALETTE,
  sponsorKey,
  sponsorSecondaryKey,
  className,
}: HomieHDProps) {
  const def = HOMIE_HD_DEFS[defIdx % HOMIE_HD_DEFS.length];
  const sponsor = (sponsorKey ?? def.sponsor) as SponsorKey;
  const secondary = (sponsorSecondaryKey ?? def.sponsorSecondary) as SponsorKey | undefined;
  const sprite = HOMIE_HD_SPRITES[defIdx % HOMIE_HD_SPRITES.length];
  const logoSize = 11 * scale;
  const logoX = (16 * scale - logoSize) / 2;
  const logoY = 13 * scale;
  const secSize = 6 * scale;
  const secX = logoX + logoSize - secSize / 2;
  const secY = logoY + logoSize - secSize / 2;
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
        <div
          style={{
            position: 'absolute',
            left: logoX,
            top: logoY,
            width: logoSize,
            height: logoSize,
            lineHeight: 0,
            pointerEvents: 'none',
          }}
        >
          <SponsorLogo keyName={sponsor} size={logoSize} pixelated={true} showLabel={false} />
        </div>
      )}
      {secondary && (
        <div
          style={{
            position: 'absolute',
            left: secX,
            top: secY,
            width: secSize,
            height: secSize,
            lineHeight: 0,
            pointerEvents: 'none',
            boxShadow: '0 0 0 1px #fff, 0 0 0 2px #1a1326',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <SponsorLogo keyName={secondary} size={secSize} pixelated={true} showLabel={false} />
        </div>
      )}
    </div>
  );
}

interface HomieDeskHDProps extends HomieHDProps {
  mode?: 'laptop' | 'phone';
}

export function HomieDeskHD({
  defIdx,
  mode = 'laptop',
  scale = 1,
  palette = DEFAULT_PALETTE,
  sponsorKey,
  sponsorSecondaryKey,
  className,
}: HomieDeskHDProps) {
  const def = HOMIE_HD_DEFS[defIdx % HOMIE_HD_DEFS.length];
  const sponsor = (sponsorKey ?? def.sponsor) as SponsorKey;
  const secondary = (sponsorSecondaryKey ?? def.sponsorSecondary) as SponsorKey | undefined;
  const sprite = homieDeskHD(def.hood, def.hoodie, mode, def.skin);
  const logoSize = 12 * scale;
  const logoX = (24 * scale - logoSize) / 2;
  const logoY = 14 * scale;
  const secSize = 7 * scale;
  const secX = logoX + logoSize - secSize / 2;
  const secY = logoY + logoSize - secSize / 2;
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
        <div
          style={{
            position: 'absolute',
            left: logoX,
            top: logoY,
            width: logoSize,
            height: logoSize,
            lineHeight: 0,
            pointerEvents: 'none',
          }}
        >
          <SponsorLogo keyName={sponsor} size={logoSize} pixelated={true} showLabel={false} />
        </div>
      )}
      {secondary && (
        <div
          style={{
            position: 'absolute',
            left: secX,
            top: secY,
            width: secSize,
            height: secSize,
            lineHeight: 0,
            pointerEvents: 'none',
            boxShadow: '0 0 0 1px #fff, 0 0 0 2px #1a1326',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <SponsorLogo keyName={secondary} size={secSize} pixelated={true} showLabel={false} />
        </div>
      )}
    </div>
  );
}
