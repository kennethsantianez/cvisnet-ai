import { useState, useEffect } from "react";
import "./App.css";
import { ChatMessageList } from "./components/ui/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "./components/ui/chat/chat-bubble";
import { Button } from "./components/ui/button";
import { CornerDownLeft, Mic, Paperclip } from "lucide-react";
import { ChatInput } from "./components/ui/chat/chat-input";

type Message = {
  content: string;
  role: "User" | "System";
};

function App() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]); // Initialize an empty messages array
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    const newMessage: Message = {
      content: message,
      role: "User",
    };

    setMessages((prev) => [...prev, newMessage]); // Append User message
    setMessage(""); // Clear input
    setIsLoading(true); // Show loading bubble

    try {
			const formattedPrompt = [...messages, newMessage] // Include full chat history
				.map((msg) => `Role: ${msg.role}\nContent: "${msg.content}"\n`) // Add newline
				.join("\n"); // Join all messages with an extra newline

      const response = await fetch("http://103.104.17.31:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "cvisnet",
          prompt: formattedPrompt, // Send as a single string
          stream: false,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        content: data.response || "No response from AI.",
        role: "System",
      };

      setMessages((prev) => [...prev, aiMessage]); // Append AI response
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setIsLoading(false);
  };

  // Log messages whenever they change
  useEffect(() => {
  }, [messages]);

  return (
    <>
      <ChatMessageList>
        {messages.map((msg, index) => (
          <ChatBubble
            key={index}
            variant={msg.role === "User" ? "sent" : "received"}
            className={msg.role === "System" ? "items-start" : ""}
          >
            <ChatBubbleAvatar fallback={msg.role === "User" ? "U" : "AI"} />
            <ChatBubbleMessage
              variant={msg.role === "User" ? "sent" : "received"}
              className="text-left"
            >
              {msg.content}
            </ChatBubbleMessage>
          </ChatBubble>
        ))}

        {/* Show loading bubble when waiting for AI response */}
        {isLoading && (
          <ChatBubble variant="received">
            <ChatBubbleAvatar fallback="AI" />
            <ChatBubbleMessage isLoading />
          </ChatBubble>
        )}
      </ChatMessageList>

      <form
        onSubmit={sendMessage}
        className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
      >
        <ChatInput
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
        />
        <div className="flex items-center p-3 pt-0">
          <Button variant="ghost" size="icon">
            <Paperclip className="size-4" />
            <span className="sr-only">Attach file</span>
          </Button>

          <Button variant="ghost" size="icon">
            <Mic className="size-4" />
            <span className="sr-only">Use Microphone</span>
          </Button>

          <Button
            type="submit"
            size="sm"
            className="ml-auto gap-1.5"
            disabled={!message.trim() || isLoading}
          >
            Send Message
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </form>
    </>
  );
}

export default App;
