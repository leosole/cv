import ReactMarkdown from "react-markdown";
import type { Message } from "./chat";

interface MessageBubbleProps {
  message: Message;
}
export const MessageBubble = ({ message }: MessageBubbleProps) => {

  return (
    <div key={message.text} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col">
        <div
          className={`inline-block p-2 rounded-lg max-w-xs break-words text-gray-900 dark:text-gray-100 ${message.role === 'user'
              ? 'bg-bubble-user'
              : 'bg-bubble-bot'
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
            {message.text}
          </ReactMarkdown>
        </div>
        <div
          className={`mx-4 border-x-10 border-y-4 border-transparent ${message.role === 'user'
              ? 'border-t-bubble-user self-end border-r-bubble-user'
              : 'border-t-bubble-bot border-l-bubble-bot self-start'
            }`}
        ></div>
      </div>
    </div>
  )
}