// Shared DispatchContext builder for smoke scripts. Centralizes the fields
// so smoke runs match what the orchestrator produces.

import type { DispatchContext } from '../lib/types';

export function buildSmokeCtx(
  overrides: Partial<DispatchContext> = {},
): DispatchContext {
  return {
    dispatchId: overrides.dispatchId ?? `smoke-${Date.now()}`,
    issueId: overrides.issueId ?? 'ISS-1180-CASTRO-HVAC',
    propertyId: overrides.propertyId ?? '1180-castro',
    propertyAddress: overrides.propertyAddress ?? '1180 Castro St',
    vendorTrade: overrides.vendorTrade ?? 'hvac',
    issueLabel: overrides.issueLabel ?? 'Heating out',
    outcome: overrides.outcome ?? {
      vendorName: "Ricky's Heating & Air",
      vendorPhone: '+14155550411',
      priceCents: 64_000,
      etaText: 'today 3:40pm',
      savingsCents: 8_000,
    },
  };
}
