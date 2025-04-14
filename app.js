const express = require('express');
const http = require("http");
const path = require("path");
const app = express();

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views')); 

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

const users = {}; // Track user connections by socket.id

io.on("connection", function (socket) {
    // When a user sends location
    socket.on("send-location", function (data) {
        users[socket.id] = data.username; 
        io.emit("receive-location", {
            id: socket.id,
            username: data.username,  // optional to send username
            latitude: data.latitude,
            longitude: data.longitude
        });
        io.emit("online-users", Object.keys(users).length); // send updated user count
    });

    // When user disconnects
    socket.on("disconnect", function () {
        delete users[socket.id];  // Remove user from the list
        io.emit("user-disconnected", socket.id);
        io.emit("online-users", Object.keys(users).length); // send updated user count
    });

    console.log("User connected:", socket.id);
});




// Route
app.get("/", function (req, res) {
    res.render("index");
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});