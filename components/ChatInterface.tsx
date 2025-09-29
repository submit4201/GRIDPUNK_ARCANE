import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { SparklesIcon } from './icons';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-secondary border-t border-border-primary">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <SparklesIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />}
            <div
              className={`max-w-md px-4 py-2 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-[#232533] text-text-primary rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-400 flex-shrink-0 animate-pulse" />
            <div className="max-w-md px-4 py-2 rounded-2xl bg-[#232533] text-text-primary rounded-bl-none">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce delay-300"></span>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-[#111218] border-t border-border-primary">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a follow-up question..."
            className="w-full bg-[#232533] border border-border-primary rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;