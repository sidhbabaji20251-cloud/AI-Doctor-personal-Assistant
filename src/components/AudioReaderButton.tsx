import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AudioReaderButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export const AudioReaderButton: React.FC<AudioReaderButtonProps> = ({
  text,
  className = '',
  label,
}) => {
  const { language, settings } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  const toggleSpeech = () => {
    if (!supported || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const cleanText = text.replace(/[#*`_\[\]]/g, ' ').slice(0, 1500); // safety length
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  if (!supported || !settings.enableAudioNarration) return null;

  const isHindi = language === 'hi';

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border transition-colors ${
        isPlaying
          ? 'bg-amber-100/80 text-amber-900 border-amber-300'
          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
      } ${className}`}
      title={
        isPlaying
          ? isHindi ? 'वाचन बंद करें' : 'Stop reading aloud'
          : isHindi ? 'आवाज़ में सुनें' : 'Listen aloud'
      }
      aria-label={isPlaying ? 'Stop narration' : 'Start narration'}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-amber-800" />
          <span>{label || (isHindi ? 'रूकें' : 'Stop')}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-stone-500" />
          <span>{label || (isHindi ? 'सुनें' : 'Listen')}</span>
        </>
      )}
    </button>
  );
};
