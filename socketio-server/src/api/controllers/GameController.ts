import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";
import axios from 'axios';



@SocketController()
export class GameController {

    currentgame = "ratio";
    gamebefore;
    private getSocketGameRoom(socket: Socket): string {
        const socketRooms = Array.from(socket.rooms.values()).filter(
          (r) => r !== socket.id
        );
        const gameRoom = socketRooms && socketRooms[0];
    
        return gameRoom;
      }

      private setCurrentGame(game){
        this.currentgame = game;
      }

      private setGameBefore(game){
        this.gamebefore = game;
      }


@OnMessage("update_Song")
public update_Song(@SocketIO() io: Server, @ConnectedSocket() socket: Socket){
    const gameRoom = this.getSocketGameRoom(socket);
    console.log("get a New Song in gameRoom: ", gameRoom)
    axios.get('https://vmq-server.herokuapp.com/getAll')
      .then(res => {
        var k = Math.floor(Math.random() * res.data.length);
        var p = Math.floor(Math.random() * res.data[k].songs.length);
        var link = "https://www.youtube.com/embed/" + res.data[k].songs[p].link + "?start=10&autoplay=1"
        this.setGameBefore(this.currentgame)
        this.setCurrentGame(res.data[k].game)
        io.in(gameRoom).emit("get_Song", link)
      });

}

@OnMessage("check_Input")
public check_input(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any){
   console.log(message.message);
   console.log(this.gamebefore)

   if(message.message == this.gamebefore){
     socket.emit("add_point", 1)
     console.log("right: ", socket.id)
   }
}

}