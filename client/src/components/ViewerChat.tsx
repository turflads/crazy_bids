import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Smile } from "lucide-react";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { cn } from "@/lib/utils";

interface ViewerChatProps {
  username: string;
}

const QUICK_REACTIONS = ["🔥", "👏", "😮", "🎉", "💪", "⚡", "❤️", "👍"];

export default function ViewerChat({ username }: ViewerChatProps) {
  const [message, setMessage] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const { messages, reactions, sendMessage, sendReaction, isConnected } = useChatWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug: Log reactions whenever they change
  useEffect(() => {
    console.log('Reactions updated:', reactions.length, reactions);
  }, [reactions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && isConnected) {
      sendMessage(username, message.trim());
      setMessage("");
    }
  };

  const handleReaction = (emoji: string) => {
    console.log('Reaction clicked:', emoji, 'Connected:', isConnected);
    if (isConnected) {
      console.log('Sending reaction...');
      sendReaction(username, emoji);
      setShowReactions(false);
    } else {
      console.error('Not connected to WebSocket');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          Live Chat
        </CardTitle>
        <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </CardHeader>
      
      {/* Floating Reactions Overlay - Outside CardContent for proper positioning */}
      {reactions.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-50" style={{ height: '100%', width: '100%' }}>
          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute text-4xl"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                bottom: '20px',
                animation: `floatUp 5s ease-out forwards`,
              }}
            >
              {reaction.emoji}
            </div>
          ))}
        </div>
      )}

      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden p-0">

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <p>No messages yet. Start chatting!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "p-2 rounded-lg break-words",
                  msg.username === username ? "bg-primary/10 ml-8" : "bg-muted mr-8"
                )}
                data-testid={`chat-message-${msg.id}`}
              >
                <p className="text-xs font-semibold text-primary mb-1">
                  {msg.username}
                </p>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reactions Bar */}
        {showReactions && (
          <div className="px-4 py-2 bg-muted/50 border-t">
            <div className="flex gap-2 flex-wrap justify-center">
              {QUICK_REACTIONS.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="text-2xl hover:scale-125 transition-transform"
                  onClick={() => handleReaction(emoji)}
                  data-testid={`button-reaction-${emoji}`}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowReactions(!showReactions)}
              data-testid="button-toggle-reactions"
              className="flex-shrink-0"
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected}
              size="icon"
              data-testid="button-send-message"
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-destructive">
              Disconnected. Reconnecting...
            </p>
          )}
        </div>
      </CardContent>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(-600px) scale(1.5);
            opacity: 0;
          }
        }
        
        .animate-float-up {
          animation: floatUp 5s ease-out forwards;
        }
      `}</style>
    </Card>
  );
}
