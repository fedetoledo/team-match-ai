'use client';

import { useRef, useState } from 'react';
import { ArrowUp, FilePlus, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { ModelSelector } from './model-selector';

interface TechMatchInputProps {
  onStop: () => void;
  onSubmit: ({
    input,
    file,
  }: {
    input?: string;
    file?: File;
  }) => void | Promise<void>;
  isLoading: boolean;
  isProcessingPdf: boolean;
}

export function SearchInput({
  onSubmit,
  onStop,
  isLoading,
  isProcessingPdf,
}: TechMatchInputProps) {
  const [query, setQuery] = useState('');
  const [tooltipEnabled, setTooltipEnabled] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInputEmpty = query.length === 0 && !selectedFile;

  const handleTooltipEnabled = (open: boolean) => {
    if (isInputEmpty) {
      setTooltipEnabled(open);
    } else {
      setTooltipEnabled(false);
    }
  };

  const handleFileClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isProcessingPdf) return;

    if ((e.key === 'Enter' && e.metaKey) || e.ctrlKey) {
      onSubmit({ input: query, file: selectedFile || undefined });
    }
  };

  return (
    <form
      className="max-w-4xl mx-auto w-full flex flex-col gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="p-3 bg-slate-700/20 backdrop-blur-lg rounded-2xl flex flex-col gap-3 border border-slate-700 overflow-hidden relative">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="application/pdf"
        />
        <div className="relative w-full">
          {/* Input */}
          <textarea
            onKeyDown={handleKeyDown}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={2}
            className={cn(
              'resize-none max-h-32 border-none outline-none w-full relative z-10 bg-transparent field-sizing-content',
              selectedFile || isProcessingPdf
                ? 'pl-0 cursor-not-allowed'
                : 'pl-2',
            )}
            placeholder={
              selectedFile || isLoading
                ? ''
                : 'Describe the project requirements or role you need to staff'
            }
            disabled={!!selectedFile || isProcessingPdf} // disable typing if file is selected or processing
          />

          {/* File card overlay */}
          {selectedFile && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center bg-slate-600/80 text-slate-300 px-3 py-1 rounded-full gap-2 shadow-md z-20 pointer-events-auto">
              <span className="text-sm font-medium truncate max-w-xs">
                {selectedFile.name}
              </span>
              <button
                type="button"
                className="text-slate-400 hover:text-red-400 font-bold cursor-pointer"
                onClick={() => setSelectedFile(null)}
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild onClick={handleFileClick}>
                <div
                  className={cn(
                    'border cursor-pointer border-slate-600 rounded-full p-2 transition-all hover:scale-110 hover:shadow-[0_0_3px_0] hover:shadow-slate-400',
                  )}
                >
                  <FilePlus size={20} className="text-slate-300" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Upload PDF</TooltipContent>
            </Tooltip>

            <ModelSelector />
          </div>

          <Tooltip
            open={tooltipEnabled}
            onOpenChange={handleTooltipEnabled}
            delayDuration={400}
          >
            <TooltipTrigger asChild>
              {isLoading || isProcessingPdf ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isProcessingPdf) {
                      onStop();
                    }
                  }}
                  type="button"
                  className="border cursor-pointer rounded-full p-2 border-slate-600 hover:scale-110 hover:shadow-[0_0_5px_0] hover:shadow-slate-400 transition-all"
                  disabled={isProcessingPdf}
                >
                  <Square size={20} className="text-slate-300" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onSubmit({ input: query, file: selectedFile || undefined })
                  }
                  className={cn(
                    'border cursor-pointer border-slate-600 rounded-full p-2 transition-all',
                    isInputEmpty &&
                      'opacity-60 cursor-not-allowed hover:animate-shake',
                    !isProcessingPdf &&
                      !isInputEmpty &&
                      'hover:scale-110 hover:shadow-[0_0_5px_0] hover:shadow-slate-400',
                  )}
                >
                  <ArrowUp size={20} className="text-slate-200" />
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent>
              {isProcessingPdf
                ? 'Processing PDF...'
                : 'Enter project requirements to find matching developers'}
            </TooltipContent>
          </Tooltip>
        </div>

        <div
          className={cn(
            'bg-linear-to-r from-primary to-lime-200 h-full w-full absolute top-full blur-xl rounded-full left-1/2 -translate-x-1/2 -z-10 transition-all duration-500 ease-in-out',
            isLoading ? 'animate-pulse -translate-y-3' : 'translate-y-10',
          )}
        />
      </div>

      <div className="self-end">
        <KbdGroup className="text-sm flex items-center">
          <Kbd>⌘</Kbd>
          <span className="leading-0 text-gray-500">+</span>
          <Kbd>Enter</Kbd>
          <span className="leading-0 text-gray-500">Find matches</span>
        </KbdGroup>
      </div>
    </form>
  );
}
