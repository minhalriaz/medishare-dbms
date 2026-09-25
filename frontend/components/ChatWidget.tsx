'use client';

import { FormEvent, KeyboardEvent, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, ChevronDown, ChevronUp, Send, X } from 'lucide-react';
import { ragApi, RagSource } from '@/services/ragApi';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: RagSource[];
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [openSources, setOpenSources] = useState<number | null>(null);

  async function sendMessage() {
    const question = query.trim();

    if (!question || loading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: question,
    };

    setMessages((previous) => [...previous, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await ragApi.ask(question);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          error instanceof Error
            ? `Sorry, something went wrong.\n\n${error.message}`
            : 'Sorry, something went wrong.',
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function toggleSources(messageId: number) {
    setOpenSources((current) =>
      current === messageId ? null : messageId,
    );
  }

  function clearChat() {
    setMessages([]);
    setOpenSources(null);
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[620px] w-[390px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  MediShare AI Assistant
                </h2>

                <p className="text-[11px] text-gray-400">
                  Ask about MediShare
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close chatbot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <Bot className="h-7 w-7 text-emerald-600" />
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                  How can I help you?
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Ask me questions about medicines,
                  donations, organizations, requests,
                  and the MediShare system.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div className="max-w-[85%]">
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                          message.role === 'user'
                            ? 'rounded-br-md bg-emerald-600 text-white'
                            : 'rounded-bl-md border border-gray-200 bg-white text-gray-700'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>

                      {message.role === 'assistant' &&
                        message.sources &&
                        message.sources.length > 0 && (
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={() =>
                                toggleSources(message.id)
                              }
                              className="flex items-center gap-1 px-1 text-[11px] font-medium text-emerald-700 hover:underline"
                            >
                              📚 {message.sources.length} sources

                              {openSources === message.id ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>

                            {openSources === message.id && (
                              <div className="mt-2 space-y-1 rounded-lg border border-gray-200 bg-white p-2">
                                {message.sources.map(
                                  (source) => (
                                    <div
                                      key={source.chunk_id}
                                      className="flex items-center justify-between rounded-md bg-gray-50 px-2 py-1.5 text-[10px]"
                                    >
                                      <span className="text-gray-500">
                                        📄 Knowledge chunk{' '}
                                        {source.chunk_id}
                                      </span>

                                      <span className="font-semibold text-emerald-600">
                                        {(
                                          source.similarity * 100
                                        ).toFixed(1)}
                                        %
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-400">
                      <span className="animate-pulse">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 bg-white p-3">
            <form onSubmit={handleSubmit}>
              <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 focus-within:border-emerald-400">
                <textarea
                  rows={1}
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder="Ask about MediShare..."
                  className="min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />

                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-[9px] text-gray-400">
                Powered by MediShare RAG
              </span>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="text-[10px] text-gray-400 hover:text-emerald-600"
                >
                  Clear chat
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition-all duration-200 hover:scale-105 hover:bg-emerald-700"
        aria-label="Open MediShare AI Assistant"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6" />
        )}
      </button>
    </>
  );
}