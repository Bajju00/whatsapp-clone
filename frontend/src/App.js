import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
    const [selectedChat, setSelectedChat] = useState(null);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
    };

    const handleBack = () => {
        setSelectedChat(null);
    };

    return (
        <div className="app-container">
            <div className={`sidebar-container ${selectedChat ? 'hidden-mobile' : ''}`}>
                <Sidebar
                    onSelectChat={handleSelectChat}
                    selectedChatId={selectedChat?.wa_id}
                />
            </div>
            <div className={`chat-container ${selectedChat ? '' : 'hidden-mobile'}`}>
                {selectedChat && (
                    <ChatWindow 
                        selectedChat={selectedChat} 
                        onBack={handleBack} 
                    />
                )}
            </div>
        </div>
    );
}

export default App;