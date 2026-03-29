'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Plus, ShieldAlert, FileText, File as FileIcon, X } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { redactPIIWithFlag } from '@/lib/utils/redactor';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AnalysisPayload = {
  type: 'text' | 'url' | 'image' | 'pdf';
  content: string;
  contentStr?: string; // OCR text
  wasRedacted?: boolean;
};

interface ChatInputProps {
  onSend: (payload: AnalysisPayload) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ url: string, type: 'image' | 'pdf', name: string } | null>(null);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      // Max height to prevent infinite stretching, e.g., 200px
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    handleInput(); // Resize on mount or when text changes
  }, [inputText]);

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) return alert("File too large. Please select under 5MB.");
    
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    
    if (!isImage && !isPdf) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        url: reader.result as string,
        type: isImage ? 'image' : 'pdf',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/') || item.type === 'application/pdf') {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const isUrl = (text: string) => {
    try {
      new URL(text); return true;
    } catch { return false; }
  };

  const handleSend = async () => {
    if (isLoading || isOcrRunning) return;
    if (!inputText.trim() && !selectedFile) return;

    const { text: sanitizedText, wasRedacted } = redactPIIWithFlag(inputText.trim());

    if (selectedFile) {
      if (selectedFile.type === 'image') {
        setIsOcrRunning(true);
        try {
          const result = await Tesseract.recognize(selectedFile.url, 'eng');
          const { text: ocrText, wasRedacted: ocrRedacted } = redactPIIWithFlag(result.data.text);
          onSend({ type: 'image', content: selectedFile.url, contentStr: ocrText, wasRedacted: wasRedacted || ocrRedacted });
        } catch (e) {
          console.error("OCR failed:", e);
          onSend({ type: 'image', content: selectedFile.url, wasRedacted });
        } finally {
          setIsOcrRunning(false);
        }
      } else {
        onSend({ type: 'pdf', content: selectedFile.url, wasRedacted });
      }
    } else if (isUrl(sanitizedText)) {
      onSend({ type: 'url', content: sanitizedText, wasRedacted });
    } else {
      onSend({ type: 'text', content: sanitizedText, wasRedacted });
    }
    
    setInputText(''); 
    setSelectedFile(null);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset after send
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = ''; 
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3 relative z-10 font-sans"
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
    >
      {/* Container simulating ChatGPT/Gemini input bar */}
      <div className={cn(
        "w-full bg-[#111111]/80 backdrop-blur-xl border rounded-[24px] p-2 sm:p-3 flex flex-col gap-2 shadow-2xl ring-1 transition-all focus-within:ring-blue-500/50 relative",
        isDragging ? "border-blue-500 bg-blue-500/10 ring-blue-500/50" : "border-white/5 ring-white/10"
      )}>
        
        {/* Top-left File Preview area within the input container */}
        {selectedFile && (
          <div className="flex items-start pl-2 pt-1 animate-in fade-in zoom-in duration-200">
            <div className="relative group inline-block">
              {selectedFile.type === 'image' ? (
                 /* eslint-disable-next-line @next/next/no-img-element */
                 <img src={selectedFile.url} alt="Selected" className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-white/10 shadow-sm" />
              ) : (
                 <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-[#1E293B] border border-white/10 flex flex-col items-center justify-center gap-1 shadow-sm">
                   <FileIcon className="text-red-400" size={24} />
                   <span className="text-[10px] text-white/70 font-medium px-1 truncate w-full text-center">{selectedFile.name}</span>
                 </div>
              )}
              <button 
                onClick={() => setSelectedFile(null)} 
                className="absolute -top-2 -right-2 bg-gray-800 hover:bg-red-500 transition-colors rounded-full w-6 h-6 flex items-center justify-center text-white text-xs shadow-md border border-white/10 opacity-0 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 w-full">
          <input type="file" accept="image/*,application/pdf" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || !!selectedFile}
            className="w-10 h-10 shrink-0 flex items-center justify-center text-white/50 hover:text-white transition-colors disabled:opacity-30 rounded-full hover:bg-white/5"
            title="Attach Image or PDF"
          >
            <Plus size={24} />
          </button>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={selectedFile ? "Add a message..." : "Ask ForgeGuard..."}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-[15px] font-medium min-w-0 resize-none py-2 max-h-[200px] overflow-y-auto leading-[24px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            disabled={isLoading || isOcrRunning || (!inputText.trim() && !selectedFile)}
            className="w-10 h-10 shrink-0 bg-[#3B54EE] hover:bg-[#2A3CB5] rounded-full flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:hover:bg-[#3B54EE]"
            title="Analyze"
          >
            {isOcrRunning ? <FileText className="animate-pulse" size={18} /> : 
             isLoading ? <ShieldAlert className="animate-spin" size={18} /> : 
             <Send size={18} className="translate-x-px" />}
          </button>
        </div>
        
        {/* Dragging Overlay */}
        {isDragging && (
           <div className="absolute inset-0 rounded-[24px] border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none z-20 flex items-center justify-center backdrop-blur-sm">
             <div className="bg-black/80 px-4 py-2 rounded-full text-blue-300 font-medium text-sm border border-blue-500/30 flex items-center gap-2">
               <Plus size={16} /> Drop file here
             </div>
           </div>
        )}
      </div>
      
      {isOcrRunning && (
        <div className="absolute top-full mt-2 w-full text-center text-xs text-blue-400 animate-pulse font-medium tracking-wide">
          Running OCR Extraction on Image...
        </div>
      )}
    </div>
  );
}
