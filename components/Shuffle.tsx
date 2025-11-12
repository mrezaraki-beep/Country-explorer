import React, { useState, useEffect, useRef } from 'react';

export interface ShuffleProps {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

const Shuffle: React.FC<ShuffleProps> = ({ text, className = '', tag = 'h1' }) => {
  const [displayedText, setDisplayedText] = useState(text);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  const scramble = () => {
    let iteration = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setDisplayedText(
        text
          .split("")
          .map((_letter, index) => {
            if(index < iteration) {
              return text[index];
            }
            return letters[Math.floor(Math.random() * 26)]
          })
          .join("")
      );
      
      if(iteration >= text.length){
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      
      iteration += 1 / 3;
    }, 30);
  };
  
  // Trigger on mount
  useEffect(() => {
    // A small delay to let the font load and avoid visual glitches
    timeoutRef.current = window.setTimeout(scramble, 100);

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [text]);

  // Trigger on hover
  useEffect(() => {
    const element = elementRef.current;
    const handleMouseEnter = () => scramble();
    
    if (element) {
        element.addEventListener('mouseenter', handleMouseEnter);
    }
    return () => {
        if (element) {
            element.removeEventListener('mouseenter', handleMouseEnter);
        }
    }
  }, [text]);

  const Tag = tag;

  return (
    <Tag ref={elementRef as any} className={className} style={{ fontFamily: `'Press Start 2P', sans-serif`, backfaceVisibility: 'hidden' }}>
      {displayedText}
    </Tag>
  );
};

export default Shuffle;
