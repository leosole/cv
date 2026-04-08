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
              ? 'bg-secondary'
              : 'bg-gray-200 dark:bg-gray-700'
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
              ? 'border-t-secondary self-end border-r-secondary'
              : 'border-t-gray-200 dark:border-t-gray-700 border-l-gray-200 dark:border-l-gray-700 self-start'
            }`}
        ></div>
      </div>
    </div>
  )
}