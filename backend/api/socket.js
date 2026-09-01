const { Server } = require("socket.io");
const { verifySocketToken } = require("./middlewares/auth");

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(
        ",",
      ),
      credentials: true,
    },
  });

  io.use(verifySocketToken);

  io.on("connection", (socket) => {
    socket.join(`user_${socket.userId}`);
    socket.on("disconnect", () => {});
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error("Socket.io non initialisé");
  return io;
};

module.exports = { initSocket, getIo };
