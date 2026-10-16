import { useState, useRef, useEffect } from 'react';
import { getConversationHistory, sendMessageToBot, type ChatMessage } from './service/chat-service';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';
import { IoChatboxEllipses, IoReloadOutline, IoRemoveOutline, IoSend } from "react-icons/io5";
import { LoadingChat } from '@/svgs/loading-chat';
import cv_json from '@/static/cv.json';
import { useCardState } from '@/hooks/use-card-state';
import { convertActionToCardIndices } from '@/lib/card-index';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { MessageBubble } from './message-bubble';
import { useTheme } from '@/hooks/use-theme';


export type Message = ChatMessage;

const initialMessage: Message = {
  role: 'bot',
  text: "Hi! Ask me about Leo's experience, skills, and projects, or paste a job description to see if he's a good fit. You can also customize the page theme or glass effect. What would you like to know or change?"
} 

const allowedChatLinks = new Set([
  ...Object.values(cv_json.links),
  `mailto:${cv_json.info.email}`,
  `https://wa.me/${cv_json.info.phone.replace(/\D/g, '')}`,
  ...cv_json.professional_experience.flatMap(experience =>
    experience.positions.flatMap(position =>
      position.tasks.flatMap(task => typeof task === 'string' ? [] : [task.publication.link])
    )
  ),
]);

const SESSION_ID_KEY = 'cv-chat-session-id';
const CONVERSATION_INDEX_KEY = 'cv-chat-conversation-index';
let fallbackSessionId: string | null = null;
let fallbackConversationIndex = 0;

const readConversationState = () => {
  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    const storedIndex = localStorage.getItem(CONVERSATION_INDEX_KEY);
    const parsedIndex = storedIndex === null ? 0 : Number(storedIndex);
    const conversationIndex = sessionId && Number.isSafeInteger(parsedIndex) && parsedIndex >= 0
      ? parsedIndex
      : 0;
    if (sessionId && storedIndex === null) {
      localStorage.setItem(CONVERSATION_INDEX_KEY, '0');
    }

    fallbackSessionId = sessionId;
    fallbackConversationIndex = conversationIndex;
    return { sessionId, conversationIndex };
  } catch {
    return { sessionId: fallbackSessionId, conversationIndex: fallbackConversationIndex };
  }
};

const ensureSessionId = (sessionId: string | null): string => {
  if (sessionId) return sessionId;
  const newSessionId = crypto.randomUUID();
  fallbackSessionId = newSessionId;
  try {
    localStorage.setItem(SESSION_ID_KEY, newSessionId);
  } catch {
    // Keep the generated ID in memory when local storage is unavailable.
  }
  return newSessionId;
};

const saveConversationIndex = (conversationIndex: number) => {
  fallbackConversationIndex = conversationIndex;
  try {
    localStorage.setItem(CONVERSATION_INDEX_KEY, String(conversationIndex));
  } catch {
    // Keep the current index in memory when local storage is unavailable.
  }
};

interface ChatProps {
  onSkillsHighlighted: (skills: string[]) => void;
}

const Chat = ({ onSkillsHighlighted }: ChatProps) => {
  const [initialConversation] = useState(readConversationState);
  const visitorIdRef = useRef<string | null>(initialConversation.sessionId);
  const [conversationIndex, setConversationIndex] = useState(initialConversation.conversationIndex);
  const [isOpen, setIsOpen] = useState(true);
  const [isLauncherHovered, setIsLauncherHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [textareaHeight, setTextareaHeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(Boolean(initialConversation.sessionId));
  const [initialHistoryLoading, setInitialHistoryLoading] = useState(Boolean(initialConversation.sessionId));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const launcherButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resizeStartRef = useRef<{ pointerId: number; startY: number; startHeight: number } | null>(null);
  const { setOpenedCards } = useCardState();
  const { setTheme, setGlassEnabled, glassEnabled } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (!isOpen) launcherButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    let cancelled = false;
    const sessionId = visitorIdRef.current;
    if (!sessionId) {
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);
    getConversationHistory(sessionId, conversationIndex)
      .then((history) => {
        if (!cancelled) setMessages([initialMessage, ...history]);
      })
      .catch((error) => {
        console.error("Failed to retrieve chat history:", error);
        if (!cancelled) setMessages([initialMessage]);
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
          setInitialHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [conversationIndex]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim() || loading || historyLoading) return;
    const sessionId = ensureSessionId(visitorIdRef.current);
    visitorIdRef.current = sessionId;
    saveConversationIndex(conversationIndex);
    const userMessage: Message = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const response = await sendMessageToBot(input, cv_json, sessionId, conversationIndex);
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
      if (typeof action?.glass === 'boolean') {
        setGlassEnabled(action.glass);
      }

      const skillsByName = new Map(
        cv_json.technical_skills.map(skill => [skill.trim().toLowerCase(), skill])
      );
      const highlightedSkills = (action?.skills ?? [])
        .filter((skill): skill is string => typeof skill === 'string')
        .map(skill => skillsByName.get(skill.trim().toLowerCase()))
        .filter((skill): skill is string => skill !== undefined);
      onSkillsHighlighted([...new Set(highlightedSkills)]);
    } catch {
      const errorMessage: Message = { role: 'bot', text: 'Sorry, something went wrong. Please try again.' };
      setMessages([...newMessages, errorMessage]);
      onSkillsHighlighted([]);
    }
    setLoading(false);
  };

  const startNewChat = () => {
    if (loading || historyLoading || !messages.some((message) => message.role === 'user')) return;
    const nextIndex = conversationIndex + 1;
    saveConversationIndex(nextIndex);
    setConversationIndex(nextIndex);
    setMessages([initialMessage]);
    onSkillsHighlighted([]);
  };

  return (
    <div className={`chat-shell z-40 ${isOpen ? "chat-shell--open" : ""}`}>
      <div
        inert={isOpen}
        className="chat-shell__launcher"
      >
        <Tooltip open={isLauncherHovered}>
          <TooltipContent className="z-[200]">Open Chat</TooltipContent>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleOpen}
              onMouseEnter={() => setIsLauncherHovered(true)}
              onMouseLeave={() => setIsLauncherHovered(false)}
              variant="secondary"
              size="icon"
              ref={launcherButtonRef}
              aria-label="Open chat"
              className="drop-shadow-lg dark:drop-shadow-lg/60 w-14 h-14 rounded-full"
            >
              <IoChatboxEllipses className="size-6" />
            </Button>
          </TooltipTrigger>
        </Tooltip>
      </div>
      <Card
        inert={!isOpen}
        className="chat-shell__panel glass-gradient-border glass-surface border-transparent bg-transparent shadow-lg flex flex-col"
      >
          {glassEnabled && (
            <div
              aria-hidden="true"
              className="header-glass__backdrop header-glass__backdrop--surface"
            />
          )}
          <div className="chat-shell__content flex min-h-0 flex-1 flex-col">
          <CardHeader className="flex flex-row justify-between items-center p-2 pl-4 border-b border-gray-300 dark:border-gray-600">
            <h3 className="text-lg font-semibold m-0">Chat</h3>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipContent>Start a new chat</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    onClick={startNewChat}
                    variant="ghost"
                    size="icon"
                    aria-label="Start a new chat"
                    disabled={loading || historyLoading || !messages.some((message) => message.role === 'user')}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:text-gray-300 dark:disabled:text-gray-600"
                  >
                    <IoReloadOutline />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
              <Button
                onClick={toggleOpen}
                variant="ghost"
                size="icon"
                aria-label="Close chat"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <IoRemoveOutline />
              </Button>
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-2 space-y-2">
            {initialHistoryLoading ? (
              <div className="flex justify-start">
                <LoadingChat />
              </div>
            ) : (
              <>
                {messages.map((msg, messageIndex) => (
                  <MessageBubble key={`${conversationIndex}-${messageIndex}`} message={msg} allowedLinks={allowedChatLinks} />
                ))}
                {loading && (
                  <div className="flex justify-start">
                      <LoadingChat />
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="relative p-2 border-t border-gray-300 dark:border-gray-600 flex items-end">
            <div
              role="separator"
              aria-orientation="horizontal"
              aria-label="Resize message input"
              tabIndex={0}
              className="absolute inset-x-0 top-0 z-10 h-2 cursor-ns-resize touch-none focus-visible:outline-1 focus-visible:outline-accent"
              onPointerDown={(event) => {
                const textarea = textareaRef.current;
                if (!textarea) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                resizeStartRef.current = {
                  pointerId: event.pointerId,
                  startY: event.clientY,
                  startHeight: textarea.getBoundingClientRect().height,
                };
                setTextareaHeight(textarea.getBoundingClientRect().height);
              }}
              onPointerMove={(event) => {
                const resizeStart = resizeStartRef.current;
                if (!resizeStart || resizeStart.pointerId !== event.pointerId) return;
                setTextareaHeight(Math.max(72, resizeStart.startHeight + resizeStart.startY - event.clientY));
              }}
              onPointerUp={(event) => {
                if (resizeStartRef.current?.pointerId === event.pointerId) resizeStartRef.current = null;
              }}
              onPointerCancel={(event) => {
                if (resizeStartRef.current?.pointerId === event.pointerId) resizeStartRef.current = null;
              }}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                event.preventDefault();
                const currentHeight = textareaHeight ?? textareaRef.current?.getBoundingClientRect().height ?? 84;
                setTextareaHeight(Math.max(72, currentHeight + (event.key === 'ArrowUp' ? 16 : -16)));
              }}
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
                e.preventDefault();
                sendMessage();
              }}
              className="flex-1 resize-none p-1.5 text-gray-900 dark:text-gray-100 h-full max-h-[calc(80dvh-12rem)] rounded-md focus:outline-accent/50 focus:outline-1"
              style={textareaHeight === null ? undefined : { height: textareaHeight }}
              placeholder="Ask me something"
              disabled={loading || historyLoading}
              rows={3}
            />
            <Button
              onClick={sendMessage}
              size="icon"
              className="ml-2 text-white px-4 py-2 rounded-md disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 transition-colors"
              disabled={loading || historyLoading || !input.trim()}
            >
              <IoSend />
            </Button>
          </div>
          </div>
      </Card>
    </div>
  );
};

export default Chat;