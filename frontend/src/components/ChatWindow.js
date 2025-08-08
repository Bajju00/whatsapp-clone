import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MessageBubble from './MessageBubble';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ChatWindow = ({ selectedChat }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // EFFECT 1: Fetch all messages when a new chat is selected
    useEffect(() => {
        if (selectedChat) {
            axios.get(`http://localhost:5000/api/conversations/${selectedChat.wa_id}`)
                .then(response => {
                    setMessages(response.data);
                })
                .catch(error => console.error('Error fetching messages:', error));
        } else {
            setMessages([]); // Clear messages if no chat is selected
        }
    }, [selectedChat]);

    // EFFECT 2: Set up and clean up socket listeners for real-time updates
    useEffect(() => {
        const handleNewMessage = (message) => {
            if (selectedChat && (message.to === selectedChat.wa_id || message.from === selectedChat.wa_id)) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        };

        const handleUpdateStatus = (updatedMessage) => {
             if (selectedChat && (updatedMessage.to === selectedChat.wa_id || updatedMessage.from === selectedChat.wa_id)) {
                setMessages(prevMessages => 
                    prevMessages.map(msg => msg.messageId === updatedMessage.messageId ? updatedMessage : msg)
                );
            }
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('updateStatus', handleUpdateStatus);

        // Cleanup function to remove listeners when the component unmounts or chat changes
        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('updateStatus', handleUpdateStatus);
        };
    }, [selectedChat]); // This effect now only depends on selectedChat

    // EFFECT 3: Scroll to the bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        await axios.post('http://localhost:5000/api/messages', {
            to: selectedChat.wa_id,
            text: newMessage
        });
        setNewMessage('');
    };

    if (!selectedChat) {
        return (
            <div className="chat-window empty">
                <div className="empty-chat-content">
                    <h2>WhatsApp Web Clone</h2>
                    <p>Select a chat to start messaging.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-avatar">{selectedChat.name.charAt(0).toUpperCase()}</div>
                <div className="chat-info">
                    <span className="chat-name">{selectedChat.name}</span>
                </div>
            </div>
            <div className="chat-messages">
                {messages.map((msg) => <MessageBubble key={msg.messageId} message={msg} />)}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="send-button">
                    {/* Updated button with SVG icon */}
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path
                            fill="currentColor"
                            d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"
                        ></path>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;