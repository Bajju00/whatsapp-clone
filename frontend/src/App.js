import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
    const [selectedChat, setSelectedChat] = useState(null);

    return (
        <div className="app-container">
            <Sidebar onSelectChat={setSelectedChat} selectedChatId={selectedChat?.wa_id} />
            <ChatWindow selectedChat={selectedChat} />
        </div>
    );
}

export default App;