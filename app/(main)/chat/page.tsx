"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send, Volume2, Loader2, Trash2 } from "lucide-react";
import { sendChatMessage, getChatHistory, clearChatHistory } from "@/actions/chat";
import { toast } from "sonner";
import { ChatResponseDto } from "@/schemas/chat";

interface Message {
  id: string;
  text: string;
  type: "user" | "ai";
  timestamp: Date;
  translation?: ChatResponseDto["translation"];
}

// Declare types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = "en-US"; // Đổi sang tiếng Anh
        recognitionRef.current.interimResults = true; // Bật interim để nhận dạng tốt hơn

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const results = event.results;
          const lastResult = results[results.length - 1];
          
          // Chỉ lấy kết quả final
          if (lastResult.isFinal) {
            const transcript = lastResult[0].transcript;
            setInputText(transcript);
            handleSendMessage(transcript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          toast.error("Lỗi nhận diện giọng nói. Vui lòng thử lại!");
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const history = await getChatHistory();
      const loadedMessages: Message[] = [];
      
      for (let i = 0; i < history.length; i += 2) {
        const userMsg = history[i];
        const aiMsg = history[i + 1];
        
        if (userMsg) {
          loadedMessages.push({
            id: `${i}`,
            text: userMsg.content,
            type: "user",
            timestamp: new Date(userMsg.createdAt),
          });
        }
        
        if (aiMsg) {
          loadedMessages.push({
            id: `${i + 1}`,
            text: aiMsg.content,
            type: "ai",
            timestamp: new Date(aiMsg.createdAt),
          });
        }
      }
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      setMessages([]);
      toast.success("Đã xóa lịch sử chat!");
    } catch {
      toast.error("Không thể xóa lịch sử!");
    }
  };

  const handleListen = () => {
    if (!recognitionRef.current) {
      toast.error("Trình duyệt không hỗ trợ nhận diện giọng nói!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Đang lắng nghe...");
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Không thể bắt đầu nhận diện giọng nói!");
      }
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    
    if (!messageText) {
      toast.error("Vui lòng nhập tin nhắn!");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      type: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsSending(true);

    try {
      const response = await sendChatMessage(messageText);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        type: "ai",
        timestamp: new Date(),
        translation: response.translation,
      };
      setMessages((prev) => [...prev, aiMessage]);

      speakText(response.response);
    } catch {
      toast.error("Không thể nhận phản hồi từ AI!");
    } finally {
      setIsSending(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      // Tách phần tiếng Anh và CHỈ ĐỌC phần tiếng Anh
      // Format: "English text (Tiếng Việt)" -> Chỉ đọc "English text"
      const englishMatch = text.match(/^([^(]+)/);

      if (englishMatch) {
        const englishText = englishMatch[1].trim();
        const utterance = new SpeechSynthesisUtterance(englishText);
        utterance.lang = "en-US";
        utterance.rate = 0.85; // Chậm hơn để dễ nghe
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="h-[calc(100vh-12rem)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-6 w-6 text-primary" />
                Hội thoại với AI
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Hỏi bất cứ điều gì bằng tiếng Việt hoặc tiếng Anh
              </p>
            </div>
            <Button variant="dangerOutline" size="sm" onClick={handleClearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa lịch sử
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col h-[calc(100%-8rem)]">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Bắt đầu cuộc trò chuyện hoặc hỏi nghĩa từ!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-white border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    
                    {message.translation && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="font-semibold">{message.translation.word}</p>
                        {message.translation.phonetic && (
                          <p className="text-sm opacity-70">/{message.translation.phonetic}/</p>
                        )}
                        <p className="mt-1">{message.translation.meaning}</p>
                        {message.translation.examples && (
                          <ul className="mt-2 text-sm space-y-1">
                            {message.translation.examples.map((ex, i) => (
                              <li key={i}>• {ex}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div className="flex gap-2">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hỏi gì cũng được: chat, hỏi nghĩa từ, học từ vựng..."
              className="resize-none"
              rows={2}
              disabled={isSending || isListening}
            />
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleListen}
                variant={isListening ? "danger" : "secondaryOutline"}
                size="icon"
                disabled={isSending}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>

              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isSending}
                size="icon"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Status Indicators */}
          {(isListening || isSpeaking || isSending) && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              {isListening && "Đang lắng nghe..."}
              {isSpeaking && "Đang phát âm..."}
              {isSending && "Đang gửi..."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
