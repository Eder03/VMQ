import { Socket } from "socket.io-client";



class GameService {
  public link;
  //Client wird der jeweiligen Lobby hinzugefügt
  public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
    return new Promise((rs, rj) => {
      socket.emit("join_game", { roomId });
      socket.on("room_joined", () => rs(true));
      socket.on("room_join_error", ({ error }) => rj(error));
    });
  }

  //Schickt dem Server die Anfrage einen neuen Song zu rendern
  public async updateSong(socket: Socket){
    console.log("updateSong")
    socket.emit("update_Song");
  }

  //Gibt neuen Song vom Socket und dem jeweiligen Raum zurück
  public async getSong(
    socket: Socket,
    listiner: (link: null) => void
  ) {
    
    socket.on("get_Song", (link) => {
      console.log("Song in Gameservice: ", link);
      listiner(link)
      });
    
  }

  //Gibt dem Server den Input des Clients mit
  public async check_input(socket: Socket, input){
    socket.emit("check_Input", {message: input})
  }

  //Server schickt dem Client einen Punkt sozusagen, wenn seine Eingabe richtig ist
  public async add_point(socket: Socket, listiner: (point: null) => void){
    socket.on("add_point", (point) => listiner(point))
  }
}

export default new GameService();