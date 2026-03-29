export function redactPii(text: string): { redactedText: string; count: number } {
  let count = 0;
  
  // Basic email redaction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  let redactedText = text.replace(emailRegex, () => {
    count++;
    return '[EMAIL_REDACTED]';
  });

  // Basic phone number redaction (simplified)
  const phoneRegex = /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  redactedText = redactedText.replace(phoneRegex, () => {
    count++;
    return '[PHONE_REDACTED]';
  });

  // Optional: Add more regex for SSN or Credit Cards if needed in the future
  
  return { redactedText, count };
}
