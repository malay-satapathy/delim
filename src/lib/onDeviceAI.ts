/**
 * Chrome Built-in Prompt API Bridge (Gemini Nano on-device)
 * Runs 100% locally on the user's hardware with zero network calls and zero telemetry.
 */

export interface OnDeviceAIResult {
  transformedText?: string;
  presetId?: string;
  description: string;
}

/**
 * Checks if Chrome Built-in Prompt API is supported and ready in the user's browser.
 */
export async function isOnDeviceAIAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const ai = (window as unknown as { ai?: { languageModel?: { capabilities: () => Promise<{ available: string }> } } }).ai;
    if (ai?.languageModel) {
      const caps = await ai.languageModel.capabilities();
      return caps.available === 'readily';
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Query native Chrome Gemini Nano on-device model as a fallback for unstructured queries.
 */
export async function queryOnDeviceAIFallback(
  prompt: string,
  inputText: string
): Promise<OnDeviceAIResult | null> {
  if (typeof window === 'undefined') return null;

  try {
    const ai = (window as unknown as {
      ai?: {
        languageModel?: {
          create: (options?: { systemPrompt?: string }) => Promise<{
            prompt: (input: string) => Promise<string>;
            destroy: () => void;
          }>;
        };
      };
    }).ai;

    if (!ai?.languageModel) return null;

    const session = await ai.languageModel.create({
      systemPrompt:
        'You are an in-browser data formatter for a list manipulation tool. The user wants to transform a dataset or format it. Respond in strict JSON format: {"description": "...", "transformedText": "...", "presetId": "..."}. Do not include markdown codeblocks or extra text.',
    });

    const query = `User instruction: "${prompt}"\nDataset sample:\n${inputText.slice(0, 1500)}`;
    const response = await session.prompt(query);
    session.destroy();

    const cleaned = response.trim().replace(/^```json\s*|\s*```$/g, '');
    const parsed = JSON.parse(cleaned);
    return {
      description: parsed.description || 'AI transformation applied',
      transformedText: parsed.transformedText,
      presetId: parsed.presetId,
    };
  } catch {
    return null;
  }
}
