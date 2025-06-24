import React, { useEffect, useRef } from 'react';

const TextToSpeech = ({ text, autoSpeak = true, onSpeakEnd }) => {
  const speechSynthRef = useRef(window.speechSynthesis);
  
  const speak = (text) => {
    if (!text) return;
    
    // Stop any ongoing speech
    speechSynthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 1.0; // Speed of speech
    utterance.pitch = 1.0; // Pitch of voice
    utterance.volume = 1.0; // Volume
    
    // Get available voices and select a professional-sounding one
    const voices = speechSynthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Daniel') || // Professional male voice
      voice.name.includes('Samantha') || // Professional female voice
      voice.lang === 'en-US'
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      if (onSpeakEnd) onSpeakEnd();
    };
    
    speechSynthRef.current.speak(utterance);
  };
  
  useEffect(() => {
    if (autoSpeak && text) {
      speak(text);
    }
    
    return () => {
      speechSynthRef.current.cancel();
    };
  }, [text, autoSpeak]);
  
  return (
    <div className="text-to-speech">
      <button onClick={() => speak(text)} className="speak-button">
        <i className="fa fa-volume-up"></i> Speak
      </button>
    </div>
  );
};

export default TextToSpeech;
