"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserEmail(session.user.email ?? "");
      await loadConversations(session.user.id);
    }
    init();
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  async function loadConversations(userId: string) {
    const { data } = await supabase
      .from("codemate_conversations")
      .select("id, title, created_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (data) setConversations(data);
  }

  async function loadMessages(conversationId: string) {
    const { data } = await supabase
      .from("codemate_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
  }

  async function handleSelectConversation(id: string) {
    setActiveConversationId(id);
    await loadMessages(id);
  }

  async function handleNewConversation() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("codemate_conversations")
      .insert({ user_id: session.user.id, title: "Nueva conversación" })
      .select()
      .single();

    if (data) {
      setConversations((prev) => [data, ...prev]);
      setActiveConversationId(data.id);
      setMessages([]);
    }
  }

  async function handleDeleteConversation(id: string) {
    await supabase.from("codemate_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeConversationId) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setIsThinking(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const formData = new FormData();
    formData.append("messages", JSON.stringify(newMessages));
    formData.append("conversationId", activeConversationId);
    if (file) {
      formData.append("file", file);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: formData,
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = "";

    setMessages([...newMessages, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      assistantMessage += chunk;
      setIsThinking(false);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: assistantMessage,
        };
        return updated;
      });
    }

    // Actualizar título en el sidebar si es el primer mensaje
    if (newMessages.length === 1) {
      const title = input.slice(0, 50);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, title } : c)),
      );
    }

    setIsLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0`}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              CodeMate
            </span>
          </div>
          <button
            onClick={handleNewConversation}
            className="w-full bg-violet-600 text-white rounded-xl py-2 text-xs font-medium hover:bg-violet-700 transition-colors"
          >
            + Nueva conversación
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 && (
            <p className="text-xs text-gray-300 text-center mt-4">
              Sin conversaciones
            </p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer mb-1 transition-colors ${
                activeConversationId === c.id
                  ? "bg-violet-50 text-violet-700"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
              onClick={() => handleSelectConversation(c.id)}
            >
              <span className="text-xs flex-1 truncate">{c.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(c.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 truncate mb-2">{userEmail}</p>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700">
            {activeConversationId
              ? (conversations.find((c) => c.id === activeConversationId)
                  ?.title ?? "Conversación")
              : "CodeMate"}
          </span>
        </header>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {!activeConversationId && (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Seleccioná o creá una conversación
                </p>
              </div>
            )}

            {activeConversationId && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-gray-300 text-sm">Empezá a escribir...</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                    <span className="text-white text-xs font-bold">C</span>
                  </div>
                )}
                <div
                  className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        code: ({ children, className }) => {
                          const isBlock = className?.includes("language-");
                          return isBlock ? (
                            <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 my-2 overflow-x-auto text-xs">
                              <code>{children}</code>
                            </pre>
                          ) : (
                            <code className="bg-gray-100 text-violet-600 px-1 rounded text-xs">
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-2 space-y-1">
                            {children}
                          </ol>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-2xl mx-auto flex flex-col gap-2">
            {file && (
              <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <span className="text-violet-600 text-xs">📄</span>
                )}
                <span className="text-xs text-violet-600 flex-1 truncate">
                  {file.name}
                </span>
                <button
                  onClick={() => {
                    setFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="text-violet-400 hover:text-violet-600 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={!activeConversationId}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                  />
                </svg>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.cs,.go,.rs,.html,.css,.json,.md,.txt,.pdf,.png,.jpg,.jpeg,.gif,.webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <input
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-violet-300 focus:bg-white transition-colors"
                placeholder={
                  activeConversationId
                    ? "Preguntá algo sobre código..."
                    : "Creá una conversación para empezar"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!activeConversationId}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || !activeConversationId}
                className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
