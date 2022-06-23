import { Socket, io } from "socket.io-client";
//import {DefaulEventsMap} from "socket.io-client/build/typed-events"

class SocketService{


    //public socket, damit der Client darauf zugreifen kann
    public socket: Socket
    //In dieser Funktion wird der Client dem Socket hinzugefügt
    public connect(url: string): Promise<Socket<any>>{
        return new Promise((rs, rj) =>{
            this.socket = io(url,{ rejectUnauthorized: false })

            if(!this.socket){
                return rj();
            }
            //Wenn vom server "connect" zurückgegeben wird
            this.socket.on("connect", () =>{
                rs(this.socket)

            });

            this.socket.on("connect_error", (err) =>{

                console.log("Connection failed: ", err)
                rj(err)
            })
            
        })
    
    }
    

    }


export default new SocketService()