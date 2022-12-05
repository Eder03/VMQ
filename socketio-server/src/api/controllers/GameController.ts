import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";
import axios from 'axios';



@SocketController()
export class GameController {

    currentgame = "";
    gamebefore;


    //Funktion um die GameRoom des Clients zu bekommen
    private getSocketGameRoom(socket: Socket): string {
        const socketRooms = Array.from(socket.rooms.values()).filter(
          (r) => r !== socket.id
        );
        const gameRoom = socketRooms && socketRooms[0];
    
        return gameRoom;
      }


      //Setter Funktionen
      private setCurrentGame(game){
        this.currentgame = game;
      }

      private setGameBefore(game){
        this.gamebefore = game;
      }


      //Funktion um den Song zu ändern
@OnMessage("update_Song")
public update_Song(@SocketIO() io: Server, @ConnectedSocket() socket: Socket){
  //GameRoom des Clients
    const gameRoom = this.getSocketGameRoom(socket);
    
    //Get Request
    axios.get('https://vmq-production.up.railway.app/getAll')
      .then(res => {
        var k = Math.floor(Math.random() * res.data.length);
        var p = Math.floor(Math.random() * res.data[k].songs.length);
        var link = "https://www.youtube.com/embed/" + res.data[k].songs[p].link + "?start=10&autoplay=1"
        this.setGameBefore(this.currentgame)
        this.setCurrentGame(res.data[k].game)
        //Neuer Song wird an alle Clients im mitgegebenen Gameroom geschickt
        io.in(gameRoom).emit("get_Song", link)
      });

}

//mitgegebener Input des Users, wird mit dem aktuellen Spiel verglichen
@OnMessage("check_Input")
public check_input(@SocketIO() io: Server, @ConnectedSocket() socket: Socket, @MessageBody() message: any){
   console.log(message.message);
   console.log(this.gamebefore)

   if(message.message == this.gamebefore){
    //Nur an einen Client, der das auch richtig erraten hat
     socket.emit("add_point", 1)
     console.log("right: ", socket.id)
   }
}

}