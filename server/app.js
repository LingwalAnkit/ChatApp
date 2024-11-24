import express from 'express';
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

const port = 3000;

// Store active users with their regions
const users = new Map();

const broadcastOnlineUsers = () => {
    const userList = Array.from(users.values());
    io.emit("updateOnlineUsers", userList);
};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userData) => {
        // Store user data with socket ID
        users.set(socket.id, {
            username: userData.username,
            region: userData.region
        });

        // Broadcast to users in the same region that a new user has joined
        io.emit("message", {
            text: `${userData.username} has joined the ${userData.region} area chat`,
            username: "System",
            region: userData.region,
            timestamp: new Date().toISOString()
        });

        // Update online users list
        broadcastOnlineUsers();
    });

    socket.on("sendMessage", (messageData) => {
        // Broadcast the message to all connected clients
        // (filtering by region is handled on the client side)
        io.emit("message", messageData);
    });

    socket.on("disconnect", () => {
        const userData = users.get(socket.id);
        if (userData) {
            io.emit("message", {
                text: `${userData.username} has left the chat`,
                username: "System",
                region: userData.region,
                timestamp: new Date().toISOString()
            });
            users.delete(socket.id);
            broadcastOnlineUsers();
        }
    });
});

app.get('/', (req, res) => {
    res.send("Area-based Chat Server Running");
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});