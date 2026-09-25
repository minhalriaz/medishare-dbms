'use client';

import { FormEvent, KeyboardEvent, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ragApi, RagSource } from '../../services/ragApi';
import './rag.css';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: RagSource[];
};

export default function RagPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
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

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
    setOpenSources(null);
  }

  function toggleSources(messageId: number) {
    setOpenSources((current) =>
      current === messageId ? null : messageId,
    );
  }

  return (
    <main className="chatPage">
      <header className="header">
        <div className="headerTitle">MediShare AI Assistant</div>
        <div className="headerSubtitle">
          Ask questions about the MediShare knowledge base
        </div>
      </header>

      <section className="chatContainer">
        <div className="messages">
          {messages.length === 0 ? (
            <div className="emptyState">
              <div className="emptyIcon">✦</div>

              <div className="emptyTitle">
                How can I help you?
              </div>

              <div className="emptyText">
                Ask me anything about MediShare.
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`messageRow ${
                  message.role === 'user'
                    ? 'userRow'
                    : 'assistantRow'
                }`}
              >
                <div>
                  <div
                    className={`message ${
                      message.role === 'user'
                        ? 'userMessage'
                        : 'assistantMessage'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="markdownContent">
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
                      <div className="sourceContainer">
                        <button
                          type="button"
                          className="sourceButton"
                          onClick={() =>
                            toggleSources(message.id)
                          }
                        >
                          📚 {message.sources.length} sources
                          <span>
                            {openSources === message.id
                              ? ' ▲'
                              : ' ▼'}
                          </span>
                        </button>

                        {openSources === message.id && (
                          <div className="sourceList">
                            {message.sources.map((source) => (
                              <div
                                key={source.chunk_id}
                                className="sourceItem"
                              >
                                <span>
                                  📄 Knowledge chunk{' '}
                                  {source.chunk_id}
                                </span>

                                <span className="similarity">
                                  {(
                                    source.similarity * 100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="messageRow assistantRow">
              <div className="message assistantMessage typing">
                <span>Thinking</span>
                <span className="typingDots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="inputArea">
            <textarea
              className="input"
              rows={1}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about MediShare..."
              disabled={loading}
            />

            <button
              className="sendButton"
              type="submit"
              disabled={loading || !query.trim()}
              aria-label="Send message"
            >
              ↑
            </button>
          </div>
        </form>

        <div className="bottomBar">
          <span className="disclaimer">
            Answers are generated from the MediShare knowledge base.
          </span>

          {messages.length > 0 && (
            <button
              className="clearButton"
              type="button"
              onClick={clearChat}
            >
              Clear chat
            </button>
          )}
        </div>
      </section>
    </main>
  );
}