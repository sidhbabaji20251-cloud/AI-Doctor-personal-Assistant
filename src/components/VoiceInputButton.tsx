import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  placeholderText?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = '',
  placeholderText,
}) => {
  const { language } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(language === 'hi' ? 'माइक अनुमति अस्वीकृत है' : 'Microphone permission blocked');
        } else if (event.error === 'no-speech') {
          setErrorMessage(language === 'hi' ? 'कोई आवाज़ नहीं सुनी गई' : 'No speech detected');
        } else {
          setErrorMessage(language === 'hi' ? 'आवाज़ पहचान में त्रुटि' : 'Speech error: ' + event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!supported) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान (Speech Recognition) समर्थित नहीं है।'
          : 'Speech recognition is not supported in this browser. Please type your query.'
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  if (!supported) return null;

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        title={
          isListening
            ? language === 'hi'
              ? 'सुनना बंद करें'
              : 'Stop listening'
            : placeholderText ||
              (language === 'hi'
                ? 'बोलकर दर्ज करें (हिन्दी / English)'
                : 'Speak with voice (English / Hindi)')
        }
        className={`p-2 transition-colors border flex items-center gap-1.5 text-xs font-medium ${
          isListening
            ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
        } ${className}`}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4 text-rose-600 animate-bounce" />
            <span className="hidden sm:inline">
              {language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...'}
            </span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-stone-600" />
            <span className="hidden sm:inline">
              {language === 'hi' ? 'बोलें' : 'Voice'}
            </span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="absolute top-full mt-1 left-0 z-20 text-[11px] text-rose-700 bg-white border border-rose-200 px-2 py-1 shadow-xs whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
