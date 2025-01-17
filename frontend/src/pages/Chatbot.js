import React, { useState } from 'react';
import styled from 'styled-components';
import { API_BASE_URL } from '../config';

const ChatContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Messages = styled.div`
  border: 1px solid #ccc;
  padding: 10px;
  height: 400px;
  overflow-y: scroll;
  background-color: #f9f9f9;
`;

const Message = styled.div`
  margin: 10px 0;
  &.user {
    text-align: right;
    color: blue;
  }
  &.bot {
    text-align: left;
    color: green;
  }
`;

const InputContainer = styled.div`
  display: flex;
  margin-top: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
`;

const Button = styled.button`
  padding: 10px;
`;

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Ciao! Come posso aiutarti oggi?' }
  ]);
  const [input, setInput] = useState('');

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
      const botResponse = data.answer;
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
      <h2>Chatbot</h2>
      <Messages>
        {messages.map((msg, index) => (
          <Message key={index} className={msg.sender}>
            <strong>{msg.sender === 'user' ? 'Tu' : 'Bot'}:</strong> {msg.text}
          </Message>
        ))}
      </Messages>
      <InputContainer>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Scrivi un messaggio..."
        />
        <Button onClick={handleSend}>Invia</Button>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chatbot;
