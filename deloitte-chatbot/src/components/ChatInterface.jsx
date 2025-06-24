import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition from './SpeechRecognition';
import './ChatInterface.css';

const ChatInterface = ({ onLogout, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const endOfMessagesRef = useRef(null);
  const speechSynthRef = useRef(window.speechSynthesis);
  
  useEffect(() => {
    const welcomeMessage = {
      text: "Hello! I'm your Deloitte well-being assistant. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.sender === 'bot') {
      speakText(latestMessage.text);
    }
  }, [messages]);
  
  const speakText = (text) => {
    if (!text) return;
    
    speechSynthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voices = speechSynthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Daniel') || 
      voice.name.includes('Samantha') || 
      voice.lang === 'en-US'
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    speechSynthRef.current.speak(utterance);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    await sendMessage(input);
  };
  
  const handleSpeechResult = async (transcript) => {
    setInput(transcript);
    await sendMessage(transcript);
  };
  
  const sendMessage = async (messageText) => {
    // Add user message to chat
    const userMessage = {
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      setTimeout(() => {
        const botMessage = {
          text: data.response,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      
      setTimeout(() => {
        const errorMessage = {
          text: "I'm sorry, I'm having trouble connecting to the server. Please try again later.",
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleSpeakMessage = (text) => {
    speakText(text);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="logo">
          <img src="/deloitte-logo.png" alt="Deloitte Logo" />
          <h1>Deloitte Well-being Assistant</h1>
        </div>
        <div className="header-actions">
          {userRole === 'admin' && (
            <button className="dashboard-btn" onClick={() => window.location.href = '/dashboard'}>
              Dashboard
            </button>
          )}
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <div className="message-footer">
                <span className="timestamp">{formatTime(message.timestamp)}</span>
                {message.sender === 'bot' && (
                  <button 
                    className="speak-button" 
                    onClick={() => handleSpeakMessage(message.text)}
                    disabled={isSpeaking}
                  >
                    <i className="fa fa-volume-up"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot-message">
            <div className="message-content typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      
      <div className="input-area">
        <form className="text-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping || !input.trim()}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
        <SpeechRecognition onSpeechResult={handleSpeechResult} />
      </div>
    </div>
  );
};

export default ChatInterface;
