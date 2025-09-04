import React from 'react';

//dummy
const messagesData = [
    { id: 1, user: 'Stacy Clarke', message: 'qwojfqwgqwojfwqojwfoqjwjofqwojfowqjwq' },
    { id: 2, user: 'Stacy Clarke', message: 'qwojfwqojfwqjofwqjowqjofwjqowjfoqwj' }
];

const Messages = () => {
  return (
    <section className="messages-log">
      {messagesData.map((msg, index) => (
        <div className="message" key={msg.id}>
          {index % 2 === 0 ? (
            <>
              <span className="message-user"><span className="user-icon">👤</span> {msg.user}</span>
              <span>{msg.message}</span>
              <span className="message-user"></span>
            </>
          ) : (
            <>
              <span className="message-user"></span>
              <span>{msg.message}</span>
              <span className="message-user">{msg.user} <span className="user-icon">👤</span></span>
            </>
          )}
        </div>
      ))}
    </section>
  );
};

export default Messages;