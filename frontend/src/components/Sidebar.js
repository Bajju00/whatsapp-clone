import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatRelative } from 'date-fns';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Sidebar = ({ onSelectChat, selectedChatId }) => {
    const [conversations, setConversations] = useState([]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/conversations');
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    useEffect(() => {
        fetchConversations();

        socket.on('newMessage', (newMessage) => {
            // Re-fetch conversations when a new message comes in
            fetchConversations();
        });

        return () => {
            socket.off('newMessage');
        };
    }, []);

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Chats</h3>
            </div>
            <div className="sidebar-chat-list">
                {conversations.map(chat => (
                    <div
                        key={chat.wa_id}
                        className={`sidebar-chat-item ${selectedChatId === chat.wa_id ? 'active' : ''}`}
                        onClick={() => onSelectChat(chat)}
                    >
                        <div className="chat-avatar">{chat.name.charAt(0)}</div>
                        <div className="chat-info">
                            <span className="chat-name">{chat.name}</span>
                            <p className="chat-last-message">{chat.lastMessage}</p>
                        </div>
                        <div className="chat-meta">
                            <span className="chat-timestamp">
                                {chat.lastMessageTimestamp ? formatRelative(new Date(chat.lastMessageTimestamp), new Date()) : ''}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;