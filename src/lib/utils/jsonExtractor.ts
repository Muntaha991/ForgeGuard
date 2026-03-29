export function extractJson(raw: string): any {
  const trimmed = raw.trim();

  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Continue to fallback methods
  }

  // Handle markdown blocks
  const fencePattern = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = trimmed.match(fencePattern);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      // Continue to fallback
    }
  }

  // Final fallback to just find the first { and last }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.substring(firstBrace, lastBrace + 1));
    } catch (e) {
      // give up
    }
  }

  throw new Error("Failed to extract JSON from string");
}
