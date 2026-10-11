import { useState, useRef, useEffect } from 'react';
import { sendMessageToBot } from './service/chat-service';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';
import { IoSend, IoChatboxEllipses } from "react-icons/io5";
import { LoadingChat } from '@/svgs/loading-chat';
import cv_json from '@/static/cv.json';
import { useCardState } from '@/hooks/use-card-state';
import { convertActionToCardIndices } from '@/lib/card-index';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { MessageBubble } from './message-bubble';
import { useTheme } from '@/hooks/use-theme';


export interface Message {
  role: 'user' | 'bot';
  text: string;
}

const initialMessage: Message = {
  role: 'bot',
  text: "Hi! Ask me about Leo's experience, skills, and projects, or paste a job description to see if he's a good fit. You can also ask me to customize the page, like animating the background or changing the theme. What would you like to know or change?"
} 

interface ChatProps {
  onSkillsHighlighted: (skills: string[]) => void;
}

const Chat = ({ onSkillsHighlighted }: ChatProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setOpenedCards } = useCardState();
  const { setTheme, setAnimatedBackgroundEnabled } = useTheme();

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
      const response = await sendMessageToBot(input, previous, cv_json);
      const botMessage: Message = { role: 'bot', text: response.message };
      setMessages([...newMessages, botMessage]);

      const action = response.action;
      if (action?.timeline) {
        const cardIndices = convertActionToCardIndices(cv_json, action.timeline);
        if (cardIndices.length > 0) {
          setOpenedCards(cardIndices);
        }
      }

      if (action?.theme === 'light' || action?.theme === 'dark') {
        setTheme(action.theme);
      }
      if (typeof action?.animatedBackground === 'boolean') {
        setAnimatedBackgroundEnabled(action.animatedBackground);
      }

      const skillsByName = new Map(
        cv_json.technical_skills.map(skill => [skill.trim().toLowerCase(), skill])
      );
      const highlightedSkills = (action?.skills ?? [])
        .filter((skill): skill is string => typeof skill === 'string')
        .map(skill => skillsByName.get(skill.trim().toLowerCase()))
        .filter((skill): skill is string => skill !== undefined);
      onSkillsHighlighted([...new Set(highlightedSkills)]);
    } catch (error) {
      const errorMessage: Message = { role: 'bot', text: 'Sorry, something went wrong. Please try again.' };
      setMessages([...newMessages, errorMessage]);
      onSkillsHighlighted([]);
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
        <Card className="glass-gradient-border glass-surface border-transparent bg-transparent shadow-lg w-full max-h-[80dvh] sm:w-100 sm:h-200 h-full flex flex-col">
          <div
            aria-hidden="true"
            className="header-glass__backdrop header-glass__backdrop--surface"
          />
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
          <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-2 space-y-2">
            {messages.map((msg) => (
              <MessageBubble key={msg.text} message={msg} />
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
              className="ml-2 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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