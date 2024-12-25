import { useEffect } from 'react';
import Typewriter from 'typewriter-effect/dist/core';

function TypeWriterEffect() {
  useEffect(() => {
    const strings = [
        "Hope you're having a great day!",
        "Wishing you a productive session!",
        "Ready to manage your files?",
        "Let's organize your digital world!",
        "Secure file sharing made easy for you!"
      ];
  
      const randomStartIndex = Math.floor(Math.random() * strings.length);
      const randomizedStrings = [...strings.slice(randomStartIndex), ...strings.slice(0, randomStartIndex)];
  
    new Typewriter('#typewriter', {
      strings:randomizedStrings,
      autoStart: true,
      loop: true,
      delay: 75, 
    });
  }, []);

  return <span id="typewriter"></span>;
}

export default TypeWriterEffect;
