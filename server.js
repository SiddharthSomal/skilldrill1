
// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const ACTIONS = require('./src/components/mainWindow/Actions');
// const mongoose = require('mongoose');
// const cors = require('cors');

// // console.log("MongoDB URL:", process.env.MONGO_URL);
// // mongoose.set('strictQuery', true);

// mongoose.connect(process.env.MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// .then(() => console.log("✅ Connected to MongoDB Atlas"))
// .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);
// const rooms = {};
// let theSocketId = "";

// const { user, room, feedback } = require("./mongo");

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//     origin: "*", 
//     methods: ["GET", "POST"],
//     credentials: true
// }));

// async function callDb(clients, roomId) {
//     try {
//         const checkRoom = await room.findOne({ roomId: roomId }, { _id: 0 });
//         if (checkRoom) {
//             await room.updateMany({ roomId: roomId }, { $set: { client: clients } });
//         } else {
//             await room.insertMany({ roomId: roomId, client: clients });
//         }
//     } catch (err) {
//         console.error("Database Error:", err);
//     }
// }

// app.post("/login", async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const checkEmail = await user.findOne({ email: email });
//         if (checkEmail) {
//             const checkPassword = await user.findOne({ email, password });
//             if (!checkPassword) {
//                 return res.json({ status: "incorrect password" });
//             }
//             return res.json({ status: "exist", username: checkPassword.username });
//         }
//         res.json({ status: "notExist" });
//     } catch (e) {
//         res.json(e);
//     }
// });

// app.post("/signup", async (req, res) => {
//     try {
//         const { email, password, username } = req.body;
//         if (await user.findOne({ email })) {
//             return res.json("Already exist");
//         }
//         if (await user.findOne({ username })) {
//             return res.json("username exist");
//         }
//         await user.insertMany([{ email, password, username }]);
//         res.json("notExist");
//     } catch (e) {
//         res.json(e);
//     }
// });

// app.post("/expressions", async (req, res) => {
//     try {
//         const { username, roomId, expressions } = req.body;
//         const checkForUser = await feedback.findOne({ to: username });
//         if (checkForUser) {
//             const checkForRoomId = await feedback.findOne({ to: username, "info.roomId": roomId });
//             if (checkForRoomId) {
//                 await feedback.updateMany(
//                     { to: username, "info.roomId": roomId },
//                     { $set: { "info.$.expressions": expressions } }
//                 );
//             } else {
//                 await feedback.updateMany(
//                     { to: username },
//                     { $push: { info: [{ roomId, expressions }] } }
//                 );
//             }
//         } else {
//             await feedback.insertMany([{ to: username, info: [{ roomId, expressions }] }]);
//         }
//         res.json("Success");
//     } catch (e) {
//         console.error(e);
//         res.json("error");
//     }
// });

// const userSocketMap = {};
// function getAllConnectedClients(roomId) {
//     return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
//         socketId,
//         username: userSocketMap[socketId]?.[0] || "",
//         status: userSocketMap[socketId]?.[1] || false
//     }));
// }

// io.on('connection', (socket) => {
//     socket.on(ACTIONS.JOIN, ({ roomId, username, socketId, isInterviewee }) => {
//         userSocketMap[socket.id] = [username, isInterviewee];
//         if (!rooms[roomId]) {
//             rooms[roomId] = [];
//         }
//         rooms[roomId].push({ username, socketId });
//         theSocketId = socketId;
//         socket.join(roomId);
//         socket.to(roomId).emit("peer-joined", { socketId, username });
//         callDb(getAllConnectedClients(roomId), roomId);
//         rooms[roomId].forEach(({ socketId }) => {
//             io.to(socketId).emit(ACTIONS.JOINED, {
//                 rooms,
//                 clients: rooms[roomId],
//                 username,
//                 socketId
//             });
//         });
//     });

//     socket.on(ACTIONS.WHITEBOARD_CHANGE, ({ roomId, canvasImage }) => {
//         socket.in(roomId).emit(ACTIONS.WHITEBOARD_CHANGE, { canvasImage });
//     });

//     socket.on(ACTIONS.SYNC_WHITEBOARD, ({ socketId, canvasImage }) => {
//         io.to(socketId).emit(ACTIONS.WHITEBOARD_CHANGE, { canvasImage });
//     });

//     socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
//         socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
//     });

//     socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
//         io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
//     });

//     socket.on('disconnecting', () => {
//         for (const roomId of socket.rooms) {
//             if (rooms[roomId]) {
//                 rooms[roomId] = rooms[roomId].filter((el) => el.socketId !== socket.id);
//                 socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
//                     socketId: socket.id,
//                     username: userSocketMap[socket.id]?.[0] || "",
//                 });
//             }
//         }
//         delete userSocketMap[socket.id];
//     });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/components/mainWindow/Actions');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const rooms = {};
let theSocketId = "";

const { user, room, feedback } = require("./mongo");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: true
}));

async function callDb(clients, roomId) {
    try {
        const checkRoom = await room.findOne({ roomId: roomId }, { _id: 0 });
        if (checkRoom) {
            await room.updateMany({ roomId: roomId }, { $set: { client: clients } });
        } else {
            await room.insertMany({ roomId: roomId, client: clients });
        }
    } catch (err) {
        console.error("Database Error:", err);
    }
}

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const checkEmail = await user.findOne({ email: email });
        if (checkEmail) {
            const checkPassword = await user.findOne({ email, password });
            if (!checkPassword) {
                return res.json({ status: "incorrect password" });
            }
            return res.json({ status: "exist", username: checkPassword.username });
        }
        res.json({ status: "notExist" });
    } catch (e) {
        res.json(e);
    }
});

app.post("/signup", async (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (await user.findOne({ email })) {
            return res.json("Already exist");
        }
        if (await user.findOne({ username })) {
            return res.json("username exist");
        }
        await user.insertMany([{ email, password, username }]);
        res.json("notExist");
    } catch (e) {
        res.json(e);
    }
});

app.post("/expressions", async (req, res) => {
    try {
        const { username, roomId, expressions } = req.body;
        const checkForUser = await feedback.findOne({ to: username });
        if (checkForUser) {
            const checkForRoomId = await feedback.findOne({ to: username, "info.roomId": roomId });
            if (checkForRoomId) {
                await feedback.updateMany(
                    { to: username, "info.roomId": roomId },
                    { $set: { "info.$.expressions": expressions } }
                );
            } else {
                await feedback.updateMany(
                    { to: username },
                    { $push: { info: [{ roomId, expressions }] } }
                );
            }
        } else {
            await feedback.insertMany([{ to: username, info: [{ roomId, expressions }] }]);
        }
        res.json("Success");
    } catch (e) {
        console.error(e);
        res.json("error");
    }
});


// ✅ ADD THIS ROUTE FOR REPORTCARD
app.get("/reportCard/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const userFeedback = await feedback.findOne({ to: username });
        if (!userFeedback) {
            return res.status(404).json({ error: "No feedback found for this user" });
        }
        res.json(userFeedback.info); // Send only the relevant data
    } catch (e) {
        console.error("Error in /reportCard route:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// ✅ END OF ADDED ROUTE


const userSocketMap = {};
function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
        socketId,
        username: userSocketMap[socketId]?.[0] || "",
        status: userSocketMap[socketId]?.[1] || false
    }));
}

io.on('connection', (socket) => {
    socket.on(ACTIONS.JOIN, ({ roomId, username, socketId, isInterviewee }) => {
        userSocketMap[socket.id] = [username, isInterviewee];
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push({ username, socketId });
        theSocketId = socketId;
        socket.join(roomId);
        socket.to(roomId).emit("peer-joined", { socketId, username });
        callDb(getAllConnectedClients(roomId), roomId);
        rooms[roomId].forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                rooms,
                clients: rooms[roomId],
                username,
                socketId
            });
        });
    });

    socket.on(ACTIONS.WHITEBOARD_CHANGE, ({ roomId, canvasImage }) => {
        socket.in(roomId).emit(ACTIONS.WHITEBOARD_CHANGE, { canvasImage });
    });

    socket.on(ACTIONS.SYNC_WHITEBOARD, ({ socketId, canvasImage }) => {
        io.to(socketId).emit(ACTIONS.WHITEBOARD_CHANGE, { canvasImage });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        for (const roomId of socket.rooms) {
            if (rooms[roomId]) {
                rooms[roomId] = rooms[roomId].filter((el) => el.socketId !== socket.id);
                socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    username: userSocketMap[socket.id]?.[0] || "",
                });
            }
        }
        delete userSocketMap[socket.id];
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

