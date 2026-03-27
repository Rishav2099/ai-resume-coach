"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { useSessionId } from "@/hooks/useSessionId";
import { Paperclip, LoaderIcon, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";

// 1. Your Custom AI Elements
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

export default function Home() {
  const sessionId = useSessionId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const isProcessing = status === "streaming" || status === "submitted";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e?: PromptInputMessage) => {
    if ((!input && !file) || !sessionId || isProcessing) return;

    let fileBase64 = "";
    let mimeType = "";

    if (file) {
      fileBase64 = await toBase64(file);
      mimeType = file.type;
    }

    const messageContent = input || "Here is my resume for analysis.";

    sendMessage(
      { text: messageContent },
      {
        body: {
          sessionId,
          hasFile: file ? "true" : "false",
          fileName: file?.name || "",
          fileData: fileBase64,
          mimeType,
        },
      },
    );

    setInput("");
    setFile(null);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background dark text-foreground font-sans">
      {/* Header */}
      <div className="h-14 border-b w-full flex items-center justify-between shrink-0 px-4">
        <div className="font-semibold tracking-tight">AI Resume Coach</div>
      </div>

      {/* Main Conversation Area using your components */}
      <div className="flex-1 min-h-0 relative w-full">
        <Conversation className="h-full w-full">
          <ConversationContent>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground pt-20">
                <Bot size={48} className="text-primary opacity-50" />
                <p>Upload your resume and a job description to get started.</p>
              </div>
            ) : (
              messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  {/* Avatar Container */}
                  <div className="shrink-0 mt-1 mr-4 w-full">
                    {m.role === "assistant" ? (
                      <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-zinc-900 shadow-sm">
                        <Bot size={18} />
                      </div>
                    ) : (
                      <div className=" h-8 rounded-md  flex items-center  text-zinc-300 shadow-sm bg-black justify-end">
                        <User size={18} />
                      </div>
                    )}
                  </div>

                  <MessageContent>
                    <MessageResponse>
                      {m.parts
                        ?.map((part) => (part.type === "text" ? part.text : ""))
                        .join("")}
                    </MessageResponse>
                  </MessageContent>
                </Message>
              ))
            )}

            {/* Loading Indicator */}
            {isProcessing && status === "submitted" && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm p-4">
                <LoaderIcon className="size-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Prompt Input Area using your components */}
      <div className="p-3 w-full shrink-0 bg-background max-w-4xl mx-auto">
        <input
          type="file"
          accept=".pdf,.docx,image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {file && (
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
              Attached: {file.name}
            </span>
          </div>
        )}

        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Paste job description or ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[60px]"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className={file ? "text-primary" : "text-muted-foreground"}
              >
                <Paperclip className="size-4" />
              </Button>
            </PromptInputTools>

            <PromptInputSubmit
              status={isProcessing ? "streaming" : undefined}
              disabled={isProcessing ? false : !input.trim() && !file}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
