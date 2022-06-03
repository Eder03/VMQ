import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";


@SocketController()
export class RoomController{

    @OnMessage("join_game")
    public async joinGame(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any){

        console.log("User Joined the room: ", message);

        const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);

        if(socketRooms.length > 0 || connectedSockets && connectedSockets.size === 5){
            socket.emit("room_join_error", {
               error: "Room is full" 
            })
        }else{
            await socket.join(message.roomId);
            socket.emit("room_joined");
            
        }
    }
}