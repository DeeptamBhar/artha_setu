import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Sparkles, Loader2 } from 'lucide-react';

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste! I am Sahayak, your financial assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');

    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      text: userMessage,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    console.log('[ChatPanel] Sending message:', userMessage);
    console.log('[ChatPanel] API URL:', '/api/chat');

    try {
      // Call the backend API
      console.log('[ChatPanel] Making fetch request...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          user_id: 'u101',
          language: 'english'
        })
      });

      console.log('[ChatPanel] Response status:', response.status);
      console.log('[ChatPanel] Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ChatPanel] Server error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[ChatPanel] Received data:', data);

      // Add assistant response to chat
      const assistantMessage = {
        role: 'assistant',
        text: data.spoken_response || 'I received your message but could not generate a response.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        ui_directive: data.ui_directive,
        genui_data: data.genui_data,
        ai_reasoning: data.ai_reasoning
      };
      setMessages(prev => [...prev, assistantMessage]);
      console.log('[ChatPanel] Message added successfully');

    } catch (err) {
      console.error('[ChatPanel] ERROR:', err);
      console.error('[ChatPanel] Error name:', err.name);
      console.error('[ChatPanel] Error message:', err.message);
      console.error('[ChatPanel] Error stack:', err.stack);
      
      setError(`Error: ${err.message}`);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        text: `I'm sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('[ChatPanel] Request complete');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="p-6 pb-2 relative z-10 w-full">
        <h3 className="text-sm font-semibold tracking-widest text-on-surface-variant uppercase font-label">
          Sahayak Conversation
        </h3>
        {error && (
          <div className="mt-2 p-2 bg-error/10 border border-error/30 rounded text-xs text-error">
            {error}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar w-full">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user'
                ? 'bg-secondary-container/15 rounded-tr-none backdrop-blur-sm'
                : msg.isError
                ? 'bg-error/10 border border-error/30 rounded-tl-none'
                : 'bg-surface-container rounded-tl-none border border-outline-variant/10 shadow-lg'
            }`}>
              <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </p>
              
              {msg.ui_directive && msg.ui_directive !== 'IDLE' && (
                <div className="mt-4 p-3 bg-primary-container/30 border border-primary/20 rounded-xl flex items-center gap-3">
                  <Sparkles className="text-primary w-5 h-5 flex-shrink-0" />
                  <span className="text-xs text-primary font-medium">
                    Widget: {msg.ui_directive}
                  </span>
                </div>
              )}
              
              <span className="block text-[10px] mt-2 text-on-surface-variant/60 font-label">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-surface-container p-4 rounded-2xl rounded-tl-none border border-outline-variant/10 shadow-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-on-surface-variant">Sahayak is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-6 relative z-10 w-full">
        <div className="glass-panel rounded-full flex items-center px-4 py-2 border border-outline-variant/20 aura-glow">
          <Paperclip className="text-on-surface-variant/50 mr-3 w-5 h-5 cursor-pointer hover:text-on-surface transition-colors" />
          <input
            className="bg-transparent border-none outline-none focus:ring-0 text-sm flex-1 placeholder:text-on-surface-variant/40 text-on-surface min-w-0"
            placeholder="Query Sahayak AI..."
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-br from-primary to-on-primary-container inline-flex h-9 w-9 flex-shrink-0 rounded-full items-center justify-center hover:opacity-90 transition-all active:scale-95 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="text-on-primary w-4 h-4 animate-spin" />
            ) : (
              <Send className="text-on-primary w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
