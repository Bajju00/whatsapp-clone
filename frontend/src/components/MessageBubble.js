import React from 'react';
import { format } from 'date-fns';

const StatusTicks = ({ status }) => {
    if (status === 'read') return <span className="ticks read">✓✓</span>;
    if (status === 'delivered') return <span className="ticks">✓✓</span>;
    if (status === 'sent') return <span className="ticks">✓</span>;
    return null;
};

const MessageBubble = ({ message }) => {
    const isSentByMe = message.direction === 'outbound';

    return (
        <div className={`message-bubble-container ${isSentByMe ? 'sent' : 'received'}`}>
            <div className="message-bubble">
                <div className="message-text">{message.text.body}</div>
                <div className="message-meta">
                    <span className="message-timestamp">{format(new Date(message.timestamp), 'p')}</span>
                    {isSentByMe && <StatusTicks status={message.status} />}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;