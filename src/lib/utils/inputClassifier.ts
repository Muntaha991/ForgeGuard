export function classifyInputType(text: string): "URL" | "Email" | "Text" {
  if (text.startsWith('http://') || text.startsWith('https://')) {
    return 'URL';
  }
  
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    return 'Email';
  }

  // Default to Text/Message
  return 'Text';
}
