import { useSocketServer } from "socket-controllers";
import { Server } from "socket.io";

export default (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // io.on("connection", (socket) => {

  // });

  //Gibt an, dass die Controller Klassen für die Verbindungen verwendet werden müssen
  useSocketServer(io, { controllers: [__dirname + "/api/controllers/*.ts"] });

  return io;
};
