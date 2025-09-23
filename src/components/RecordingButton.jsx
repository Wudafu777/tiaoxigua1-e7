// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Mic, Square } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function RecordingButton({
  isRecording,
  onStart,
  onStop
}) {
  return <button onClick={isRecording ? onStop : onStart} className={cn('w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300', isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-110')}>
      {isRecording ? <Square size={48} className="text-white" /> : <Mic size={48} className="text-white" />}
    </button>;
}