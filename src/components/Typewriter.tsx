import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function Typewriter({ text, speed = 30, onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-2 h-4 bg-amber-400 ml-1 animate-pulse" />
      )}
    </p>
  );
}
