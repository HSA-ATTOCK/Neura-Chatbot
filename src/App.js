import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiSend, FiMoon, FiSun, FiUser } from "react-icons/fi";
import { BsThreeDotsVertical, BsArrowLeft } from "react-icons/bs";
import { MdAttachFile, MdEmojiEmotions } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Sample initial bot message with typing effect
  useEffect(() => {
    const welcomeMessage =
      "Hello! I'm Neura, your AI assistant. How can I help you today?";

    // Simulate typing effect for the welcome message
    let i = 0;
    const typingEffect = setInterval(() => {
      if (i <= welcomeMessage.length) {
        setMessages([
          {
            sender: "bot",
            text: welcomeMessage.substring(0, i),
            timestamp: new Date().toISOString(),
          },
        ]);
        i++;
      } else {
        clearInterval(typingEffect);
      }
    }, 20);

    return () => clearInterval(typingEffect);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      sender: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        message: input,
      });

      // Simulate typing effect for the bot response
      const botResponse =
        res.data.response || "I didn't get that. Could you try again?";
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i <= botResponse.length) {
          setMessages((prev) => {
            const newMessages = [...prev];
            if (newMessages[newMessages.length - 1]?.sender === "bot") {
              newMessages[newMessages.length - 1].text = botResponse.substring(
                0,
                i
              );
            } else {
              newMessages.push({
                sender: "bot",
                text: botResponse.substring(0, i),
                timestamp: new Date().toISOString(),
              });
            }
            return newMessages;
          });
          i++;
        } else {
          clearInterval(typingInterval);
          setIsLoading(false);
        }
      }, 20);
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error("API Error:", err);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.style.backgroundColor = isDarkMode ? "#f5f7fa" : "#121212";
  };

  const clearConversation = () => {
    setMessages([
      {
        sender: "bot",
        text: "Hello! I'm Neura, your AI assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setIsMenuOpen(false);
  };

  return (
    <div className={`app ${isDarkMode ? "dark" : "light"}`}>
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <button className="icon-button" aria-label="Back">
              <BsArrowLeft size={20} />
            </button>
            <div className="chat-title">
              <h2>Neura AI</h2>
              <span className="status">
                <span className="pulse-dot"></span> Online
              </span>
            </div>
          </div>
          <div className="header-right">
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <div className="menu-container">
              <button
                className="icon-button menu-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
                aria-expanded={isMenuOpen}
              >
                <BsThreeDotsVertical size={20} />
              </button>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <button onClick={clearConversation}>
                    <span className="menu-icon">🗑️</span> Clear conversation
                  </button>
                  <button>
                    <span className="menu-icon">⚙️</span> Settings
                  </button>
                  <button>
                    <span className="menu-icon">❓</span> Help
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.sender} ${
                i === messages.length - 1 ? "last-message" : ""
              }`}
            >
              <div className="message-avatar">
                {msg.sender === "user" ? (
                  <div className="user-avatar">
                    <FiUser size={16} />
                  </div>
                ) : (
                  <div className="bot-avatar">
                    <RiRobot2Line size={18} />
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <strong>{msg.sender === "user" ? "You" : "Neura AI"}</strong>
                  <span className="message-time">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div className="message-text">
                  {msg.text.split("\n").map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-avatar">
                <div className="bot-avatar">
                  <RiRobot2Line size={18} />
                </div>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error">
              ×
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="chat-input-area">
          <div className="input-tools">
            <button className="icon-button" aria-label="Attach file">
              <MdAttachFile size={22} />
            </button>
            <button className="icon-button" aria-label="Insert emoji">
              <MdEmojiEmotions size={22} />
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            aria-label="Message input"
          />
          <button
            className="send-button"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <IoSend size={20} className="send-icon" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
