import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import RegisterForm from './form';

const socket = io('http://localhost:3000');

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.on("message", (message) => {
      // Only show messages from the same region (case-insensitive comparison)
      if (message.region.toLowerCase() === userData?.region.toLowerCase()) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("updateOnlineUsers", (users) => {
      // Filter users by region (case-insensitive)
      const regionalUsers = users.filter(
        user => user.region.toLowerCase() === userData?.region.toLowerCase()
      );
      setOnlineUsers(regionalUsers);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
      socket.off("updateOnlineUsers");
    };
  }, [userData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRegister = (formData) => {
    // Convert region to proper case for consistency
    const processedData = {
      ...formData,
      region: formData.region.trim()
    };
    setUserData(processedData);
    socket.emit("register", processedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageInput.trim() && userData) {
      const messageData = {
        text: messageInput,
        username: userData.username,
        region: userData.region,
        timestamp: new Date().toISOString(),
      };
      socket.emit("sendMessage", messageData);
      setMessageInput("");
    }
  };

  if (!userData) {
    return <RegisterForm onRegister={handleRegister} />;
  }

  return (
    <div className="flex h-screen">
      {/* Online Users Sidebar */}
      <div className="w-64 bg-gray-50 border-r p-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Area: {userData.region}</h2>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Online Users</h3>
            <ul className="space-y-2">
              {onlineUsers.map((user, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm">{user.username}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 shadow">
          <h1 className="text-xl font-bold">
            {userData.region} Area Chat Room
          </h1>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.username === userData.username ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-sm p-3 rounded-lg shadow ${
                    message.username === userData.username
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }`}
                >
                  <div className="font-semibold text-sm">
                    {message.username === userData.username ? "You" : message.username}
                  </div>
                  <div>{message.text}</div>
                  <div className="text-xs opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition duration-200"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;