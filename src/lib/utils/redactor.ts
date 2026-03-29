export function redactPII(text: string): string {
  return redactPIIWithFlag(text).text;
}

export function redactPIIWithFlag(text: string): { text: string; wasRedacted: boolean } {
  let redacted = text;
  let wasRedacted = false;

  // 1. Emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
  if (emailRegex.test(redacted)) wasRedacted = true;
  redacted = redacted.replace(emailRegex, '[REDACTED EMAIL]');

  // 2. Phone Numbers
  const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
  if (phoneRegex.test(redacted)) wasRedacted = true;
  redacted = redacted.replace(phoneRegex, '[REDACTED PHONE]');

  // 3. Social Security Numbers (US) & Credit Cards
  const ssnRegex = /\b\d{3}[-.\s]\d{2}[-.\s]\d{4}\b/g;
  if (ssnRegex.test(redacted)) wasRedacted = true;
  redacted = redacted.replace(ssnRegex, '[REDACTED SSN]');

  // Credit Card (Basic 16 digit check)
  const ccRegex = /\b(?:\d[\s-]?){15,16}\b/g;
  if (ccRegex.test(redacted)) wasRedacted = true;
  redacted = redacted.replace(ccRegex, '[REDACTED CREDIT CARD]');

  // 4. Basic Name Heuristics
  const nameIntroductionRegex = /\b(My name is|I am|I'm|Name:)\s+([A-Z][a-z]+(\s[A-Z][a-z]+)?)\b/gi;
  
  redacted = redacted.replace(nameIntroductionRegex, (match, prefix, name) => {
    const lowerName = name.toLowerCase();
    const safeWords = ["sorry", "glad", "happy", "mad", "sad", "here", "there"];
    if (safeWords.some((w: string) => lowerName.includes(w))) {
      return match;
    }
    wasRedacted = true;
    return `${prefix} [REDACTED NAME]`;
  });

  return { text: redacted, wasRedacted };
}
