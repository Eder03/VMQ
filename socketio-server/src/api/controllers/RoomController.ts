import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";


@SocketController()
export class RoomController{

    //Client joint dem richtigen Raum
    @OnMessage("join_game")
    public async joinGame(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any){

        //message = der Raumname
        console.log("User Joined the room: ", message);

        //Anzahl der Clients wird geholt
        const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
        //Alle Räume in denen der Client bereits ist; Zur Überprüfung, da man nicht in 2 Räumen gleichzeitig sein darf
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);

        if(socketRooms.length > 0 || connectedSockets && connectedSockets.size === 5){
            socket.emit("room_join_error", {
               error: "Room is full" 
            })
            //Client tritt erfolgreich dem Raum bei
        }else{
            await socket.join(message.roomId);
            socket.emit("room_joined");
            
        }
    }
}