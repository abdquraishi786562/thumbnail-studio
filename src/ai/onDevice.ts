/**
 * Chrome's built-in AI (Gemini Nano through the Prompt API): free, private and on this computer.
 * Only some browsers and languages support it; everything here fails soft and the
 * built-in copywriter is used instead.
 */
import type { Copy } from './copy';
import type { ConcreteStyle } from './styles';

type Availability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface LanguageModelSession {
  prompt(input: string, options?: { responseConstraint?: unknown; signal?: AbortSignal }): Promise<string>;
  destroy(): void;
}

interface LanguageModelStatic {
  availability(options?: unknown): Promise<Availability>;
  create(options?: {
    initialPrompts?: { role: 'system' | 'user' | 'assistant'; content: string }[];
    expectedInputs?: { type: 'text'; languages: string[] }[];
    expectedOutputs?: { type: 'text'; languages: string[] }[];
    monitor?: (m: EventTarget) => void;
    signal?: AbortSignal;
  }): Promise<LanguageModelSession>;
}

function api(): LanguageModelStatic | undefined {
  return (globalThis as unknown as { LanguageModel?: LanguageModelStatic }).LanguageModel;
}

/** Languages the on-device model is documented to handle well. */
const SUPPORTED = ['en', 'es', 'ja'];

export type OnDeviceStatus = Availability | 'unsupported-language';

export async function onDeviceStatus(lang: string): Promise<OnDeviceStatus> {
  const lm = api();
  if (!lm) return 'unavailable';
  if (!SUPPORTED.includes(lang)) return 'unsupported-language';
  try {
    return await lm.availability({ expectedInputs: [{ type: 'text', languages: [lang] }], expectedOutputs: [{ type: 'text', languages: [lang] }] });
  } catch {
    return 'unavailable';
  }
}

/** Start the one-time model download (must be called from a click). */
export async function downloadOnDevice(lang: string, onProgress: (fraction: number) => void): Promise<boolean> {
  const lm = api();
  if (!lm) return false;
  try {
    const s = await lm.create({
      expectedInputs: [{ type: 'text', languages: [lang] }],
      expectedOutputs: [{ type: 'text', languages: [lang] }],
      monitor: (m) => m.addEventListener('downloadprogress', (e) => onProgress((e as unknown as { loaded: number }).loaded))
    });
    s.destroy();
    return true;
  } catch {
    return false;
  }
}

const SCHEMA = {
  type: 'object',
  properties: {
    variants: {
      type: 'array',
      minItems: 3,
      maxItems: 4,
      items: {
        type: 'object',
        properties: {
          headline: { type: 'string', maxLength: 32 },
          sub: { type: 'string', maxLength: 60 },
          badge: { type: 'string', maxLength: 14 }
        },
        required: ['headline', 'sub', 'badge']
      }
    }
  },
  required: ['variants']
};

/** Ask the on-device model for thumbnail wording. Returns null when it is not available. */
export async function onDeviceCopy(idea: string, style: ConcreteStyle, lang: string, signal?: AbortSignal): Promise<Copy[] | null> {
  if ((await onDeviceStatus(lang)) !== 'available') return null;
  const lm = api()!;
  let session: LanguageModelSession | undefined;
  try {
    session = await lm.create({
      signal,
      expectedInputs: [{ type: 'text', languages: [lang] }],
      expectedOutputs: [{ type: 'text', languages: [lang] }],
      initialPrompts: [
        {
          role: 'system',
          content:
            'You write text for YouTube thumbnails. Headlines are 2 to 5 words, punchy and easy to read on a phone. ' +
            'The subtitle adds context in under 8 words. The badge is one short word. Do not invent facts, prices or numbers that are not in the idea. ' +
            'Write in the same language as the idea.'
        }
      ]
    });
    const raw = await session.prompt(`Video idea: ${idea}\nStyle: ${style}\nGive 3 or 4 different options.`, { responseConstraint: SCHEMA, signal });
    const parsed = JSON.parse(raw) as { variants?: { headline?: string; sub?: string; badge?: string }[] };
    const number = idea.match(/\d+/)?.[0] ?? null;
    const out = (parsed.variants ?? [])
      .filter((v) => v.headline && v.headline.trim())
      .map((v) => ({ headline: v.headline!.trim().toUpperCase(), sub: (v.sub ?? '').trim(), badge: v.badge?.trim().toUpperCase() || null, number }));
    return out.length ? out : null;
  } catch {
    return null;
  } finally {
    session?.destroy();
  }
}
