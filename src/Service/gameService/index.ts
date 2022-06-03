import { Socket } from "socket.io-client";



class GameService {
  public link;
  public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
    return new Promise((rs, rj) => {
      socket.emit("join_game", { roomId });
      socket.on("room_joined", () => rs(true));
      socket.on("room_join_error", ({ error }) => rj(error));
    });
  }

  public async updateSong(socket: Socket){
    console.log("updateSong")
    socket.emit("update_Song");
  }

  public async getSong(
    socket: Socket,
    listiner: (link: null) => void
  ) {
    
    socket.on("get_Song", (link) => {
      console.log("Song in Gameservice: ", link);
      listiner(link)
      });
    
  }

  public async check_input(socket: Socket, input){
    socket.emit("check_Input", {message: input})
  }

  public async add_point(socket: Socket, listiner: (point: null) => void){
    socket.on("add_point", (point) => listiner(point))
  }
}

export default new GameService();