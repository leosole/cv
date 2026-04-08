import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendMessageToBot } from './service/chat-service';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';
import { IoSend, IoChatboxEllipses } from "react-icons/io5";
import { LoadingChat } from '@/svgs/loading-chat';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';


interface Message {
  role: 'user' | 'bot';
  text: string;
}

const firstMessage: Message = {
  role: 'bot',
  text: 'Hello! I am an AI assistant to help you with questions about Leo. You can ask me anything about his experience, skills, projects, or anything else you want to know. You can even paste a job description, and I can tell you if Leo is a good fit for the role. Just type your question below and I will do my best to provide a helpful answer.',
}

const Chat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([firstMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    const previous = messages.map(m => `${m.role}: ${m.text}`).join('\n');
    try {
      const response = await sendMessageToBot(input, previous);
      const botMessage: Message = { role: 'bot', text: response };
      setMessages([...newMessages, botMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'bot', text: 'Sorry, something went wrong. Please try again.' };
      setMessages([...newMessages, errorMessage]);
    }
    setLoading(false);
  };

  return (
    <div className="z-40">
      {!isOpen ? (
        <Tooltip>
          <TooltipContent>
            Open Chat
          </TooltipContent>
          <TooltipTrigger>
            <Button onClick={toggleOpen} variant="secondary" size="icon" className="drop-shadow-lg dark:drop-shadow-lg/60 w-14 h-14 rounded-full">
                <IoChatboxEllipses className="size-6"/>
            </Button>
          </TooltipTrigger>
        </Tooltip>
      ) : (
        <Card className="shadow-lg w-100 h-200 flex flex-col">
          <CardHeader className="flex flex-row justify-between items-center p-2 pl-4 border-b border-gray-300 dark:border-gray-600">
            <h3 className="text-lg font-semibold m-0">Chat</h3>
            <Button
              onClick={toggleOpen}
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </Button>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`inline-block p-2 rounded-lg max-w-xs break-words ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="m-0">{children}</p>,
                      code: ({ className, children, ...props }) => (
                        <code
                          className={`rounded bg-slate-100 px-1 py-0.5 text-sm ${className ?? ''}`}
                          {...props}
                        >
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <span className="animate-pulse p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-10 flex items-center">
                  <LoadingChat />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 border-t border-gray-300 dark:border-gray-600 flex items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 p-1.5 text-gray-900 dark:text-gray-100 h-full"
              placeholder="Ask me something"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              size="icon"
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading || !input.trim()}
            >
              <IoSend />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Chat;