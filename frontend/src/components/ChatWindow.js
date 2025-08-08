import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MessageBubble from './MessageBubble';
import io from 'socket.io-client';
import { FaArrowLeft } from 'react-icons/fa';

const socket = io();

const ChatWindow = ({ selectedChat, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (selectedChat) {
            axios.get(`/api/conversations/${selectedChat.wa_id}`)
                .then(response => setMessages(response.data))
                .catch(error => console.error('Error fetching messages:', error));
        }
    }, [selectedChat]);

    useEffect(() => {
        if (!selectedChat) return;
        const handleNewMessage = (message) => {
            if (message.from === selectedChat.wa_id || message.to === selectedChat.wa_id) {
                setMessages(prev => [...prev, message]);
            }
        };
        socket.on('newMessage', handleNewMessage);
        return () => { socket.off('newMessage', handleNewMessage); };
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;
        await axios.post('/api/messages', { to: selectedChat.wa_id, text: newMessage });
        setNewMessage('');
    };

    if (!selectedChat) {
        return (
            <div className="chat-window empty">
                <div className="empty-chat-content">
                    <h2>Select a chat to start messaging</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="back-button" onClick={onBack}><FaArrowLeft /></div>
                <div className="chat-avatar">{selectedChat.name.charAt(0).toUpperCase()}</div>
                <div className="chat-info"><span className="chat-name">{selectedChat.name}</span></div>
            </div>
            <div className="chat-messages">
                {messages.map((msg) => <MessageBubble key={msg.messageId} message={msg} />)}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input type="text" className="chat-input" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                <button type="submit" className="send-button">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;