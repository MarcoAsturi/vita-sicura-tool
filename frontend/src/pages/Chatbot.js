import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';

const ChatContainer = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  padding: 1rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
`;

const ChatHeader = styled.h2`
  text-align: center;
  color: #333;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const MessagesContainer = styled.div`
  border: 1px solid #e0e0e0;
  padding: 1rem;
  height: 400px;
  overflow-y: auto;
  background-color: #fafafa;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const MessageRow = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  &.user {
    justify-content: flex-end;
  }
  
  &.bot {
    justify-content: flex-start;
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.5rem;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background-color: ${props => props.sender === 'user' ? '#007bff' : '#e2e2e2'};
  color: ${props => props.sender === 'user' ? '#fff' : '#333'};
  font-size: 0.95rem;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const SendButton = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: #007bff;
  border: none;
  color: #fff;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  &:hover {
    background-color: #0056b3;
  }
`;

const cleanBotResponse = (rawText) => {
  const withoutTags = rawText.replace(/<\/?response>/g, '');
  // add a newline after each sentence if the next sentence starts with a capital letter
  const formattedText = withoutTags.replace(/\. ([A-Z])/g, '.\n$1');
  return formattedText;
};


const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Ciao! Sono GIADA. Come posso aiutarti oggi?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: input })
      });
      if (!response.ok) {
        throw new Error("Errore nella chiamata API");
      }
      const data = await response.json();
      const botResponseRaw = data.answer;
      const botResponse = cleanBotResponse(botResponseRaw);
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Errore:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: "Si è verificato un errore con il chatbot." }]);
    }
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>G.I.A.D.A.</ChatHeader>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <MessageRow key={index} className={msg.sender}>
            {msg.sender === 'bot' && (
              <Avatar
                src="/giadabot.png"
                alt="Giada"
              />
            )}
            <MessageBubble sender={msg.sender}>
              <strong>{msg.sender === 'user' ? 'Tu' : 'Giada'}:</strong> {msg.text}
            </MessageBubble>
          </MessageRow>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <TextInput
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Scrivi un messaggio..."
        />
        <SendButton onClick={handleSend}>Invia</SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chatbot;
