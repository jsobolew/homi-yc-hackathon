import { tool } from 'ai';
import { z } from 'zod';
import Supermemory from 'supermemory';

export const SUPERMEMORY_CONTAINER_TAG = 'homi:demo';

const sm = new Supermemory({ apiKey: process.env.SUPERMEMORY_API_KEY! });

export const supermemoryWrite = tool({
  description:
    'Persist a deal outcome to long-term memory. Use a stable deal key so future negotiations can reference this exact outcome.',
  inputSchema: z.object({
    key: z
      .string()
      .describe('Stable deal identifier, e.g. deal.1180-castro.hvac.2026-05-17'),
    value: z
      .string()
      .describe(
        'One-line summary of the deal: vendor, price, response time, savings vs market.',
      ),
  }),
  execute: async ({ key, value }) => {
    const r = await sm.documents.add({
      content: `${key}: ${value}`,
      containerTag: SUPERMEMORY_CONTAINER_TAG,
      metadata: { key },
    });
    return { ok: true, id: r.id };
  },
});

export const supermemorySearch = tool({
  description:
    'Semantic search over prior deals. Use to find precedents — vendor history, prices paid, response times.',
  inputSchema: z.object({
    query: z.string().describe('What you want to recall. Natural language.'),
  }),
  execute: async ({ query }) => {
    const r = await sm.search.memories({
      q: query,
      containerTag: SUPERMEMORY_CONTAINER_TAG,
      threshold: 0.5,
      limit: 5,
      searchMode: 'hybrid',
    });
    return {
      total: r.total,
      results: r.results.map((x) => ({
        memory: x.memory ?? (x as { chunk?: string }).chunk ?? '',
        key: (x.metadata as { key?: string } | null)?.key,
        similarity: x.similarity,
      })),
    };
  },
});
