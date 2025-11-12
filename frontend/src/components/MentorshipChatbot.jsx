import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Send, Bot, User, Sparkles, MessageSquarePlus } from "lucide-react";

const QUICK_REPLIES = [
  "Career Advice",
  "Internship Search",
  "Skill Development",
  "Resume Tips",
  "Interview Prep",
  "Industry Trends",
];

export function MentorshipChatbot() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("access_token");

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // ✅ Fetch conversation list
  const loadConversations = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/chatbot/history/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setConversations(data.results || data);
    } catch (error) {
      console.error("Error loading conversations", error);
    }
  };

  // ✅ Load messages for selected conversation
  const loadConversationMessages = async (id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/chatbot/conversations/${id}/messages/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setMessages(
        data.map((msg) => ({
          id: msg.id,
          sender: msg.sender === "ai" ? "bot" : msg.sender,
          text: msg.text,
          timestamp: msg.created_at,
        }))
      );
      setActiveConversation(id);
    } catch (error) {
      console.error("Error loading messages", error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // ✅ Send a new message
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          conversation_id: activeConversation || undefined,
        }),
      });

      const data = await response.json();
      const botMessage = {
        id: messages.length + 2,
        sender: "bot",
        text:
          data.reply ||
          FALLBACK_BOT_RESPONSES[
            Math.floor(Math.random() * FALLBACK_BOT_RESPONSES.length)
          ],
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, botMessage]);

      // update conversation if new
      if (!activeConversation && data.conversation_id) {
        setActiveConversation(data.conversation_id);
        loadConversations();
      }
    } catch (error) {
      console.error("Error:", error);
      const botMessage = {
        id: messages.length + 2,
        sender: "bot",
        text: "⚠️ Sorry, I couldn’t connect to the AI service.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply) => handleSendMessage(reply);

  const handleNewChat = () => {
    setMessages([
      {
        id: 1,
        sender: "bot",
        text: "👋 Hi! I'm Kazini Mentor AI — your personal career advisor. How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setActiveConversation(null);
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-background to-accent/20">
      {/* 🧭 Sidebar */}
      <div className="w-72 border-r bg-card p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Conversations</h2>
          <Button variant="ghost" size="icon" onClick={handleNewChat}>
            <MessageSquarePlus className="w-5 h-5" />
          </Button>
        </div>
        <div className="overflow-y-auto flex-1 space-y-2">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversationMessages(conv.id)}
                className={`p-2 rounded-lg cursor-pointer transition ${
                  activeConversation === conv.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <p className="font-medium text-sm">
                  {conv.title || "Untitled Chat"}
                </p>
                <p className="text-xs opacity-70 truncate">
                  {conv.last_message?.text || "No messages yet"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No conversations yet.
            </p>
          )}
        </div>
      </div>

      {/* 💬 Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold">Kazini Mentor AI</h1>
        </div>

        <Card className="flex-1 m-4 shadow-lg">
          <CardContent className="p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.sender === "bot"
                      ? "bg-gradient-to-br from-chart-3 to-chart-5"
                      : "bg-gradient-to-br from-primary to-chart-2"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.sender === "bot"
                      ? "bg-secondary text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chart-3 to-chart-5 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-secondary rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        {/* ⚡ Quick Replies + Input */}
        <div className="p-4 border-t space-y-4">
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((reply) => (
              <Badge
                key={reply}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5"
                onClick={() => handleQuickReply(reply)}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {reply}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              size="icon"
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
