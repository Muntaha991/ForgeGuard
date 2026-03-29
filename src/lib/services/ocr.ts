import Tesseract from 'tesseract.js';

export async function performOCR(imageSource: string | File | Buffer): Promise<string> {
  try {
    const result = await Tesseract.recognize(imageSource, 'eng');
    return result.data.text;
  } catch (error) {
    console.error("OCR Failed:", error);
    throw new Error("Failed to extract text from the image.");
  }
}
