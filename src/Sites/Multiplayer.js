import React, { Component } from 'react'
import { Segment, Form, GridRow, Label, Grid, Icon, Input, Message, Header, Button, Visibility, Image, GridColumn } from 'semantic-ui-react'
import axios from 'axios';
import {io} from "socket.io-client"
import socketService from '../Service/socketService/index.ts';
import gameService from '../Service/gameService/index.ts';



export default class ApiForm extends Component {
  constructor(props) {
      super(props)

      this.onSubmit = this.onSubmit.bind(this);

      //Deklaration der einzelnen Datenbank Variablen und weiterer Variablen
      this.state = {
          userGuess:'',
          musicData: {},
          dropdownData: [],
          video:'',
      dropdownOptions: [],
      //Lobbyname für den Multiplayer, derzeit statisch; später einzugeben
      roomName: "public_server",
      points: 0
      }
  }


  //Client probiert den gestarteten Socket zu joinen
  connectSocket = async () =>{
      const socket = await socketService.connect("http://localhost:9000").catch((err)=>{
        console.log("Error: ", err)
      });
  }

  //Es wird dem spzifischen Multiplayer Raum beigetreten
  joinRoom = async () =>{
    //Server
      const socket = socketService.socket;
      if(!this.state.roomName || this.state.roomName.trim() === "" || !socket) return;

      const joined = await gameService.joinGameRoom(socket, this.state.roomName).catch((err) =>{
          alert(err);
      })

  }
  componentDidMount(){
    axios.get('https://vmq-production.up.railway.app/getAll')
    .then(res => {
      this.setState({ musicData: res.data });

      for (var i = 0; i < this.state.musicData.length; i++) {
        this.state.dropdownData.push(this.state.musicData[i].game)
      }

      for (var j = 0; j < this.state.dropdownData.length; j++) {
        this.state.dropdownOptions.push({ key: this.state.dropdownData[j], text: this.state.dropdownData[j], value: this.state.dropdownData[j] })
      }
    })
    .catch(function (error) {
      console.log(error);
    })
    
    //Beim betreten der Multiplayer Seite wird bereits dem Server und der Lobby gejoint; Später mittels Button/Form etc. geregelt
    this.connectSocket()
    this.joinRoom()
    
  }

  componentWillUnmount(){
    clearInterval(this.timerinterval)
    this.timerinterval = 0;
  }

  onChangeDropdown = (e, { value }) => this.setState({ userGuess: value })

  //TestFunktion um zu schauen, ob die Kommunikation zwischen Server und Client funktioniert
  onSubmit(e){

    clearInterval(this.timerinterval)
    this.timerinterval = 0;
    e.preventDefault();
    this.getSong()
    this.timerinterval = setInterval(this.getSong, 20000)
    
  }

 timerinterval = 0;

 //TestFunktion um zu schauen, ob die Kommunikation zwischen Server und Client funktioniert
 getSong(){
  //In gameservice sind alle Funktionen, um das Online Spiel zu regeln
  //Schickt dem Server die Anfrage einen neuen Song zu rendern
  gameService.updateSong(socketService.socket);
  //Neuer Song vom Server wird gerendert
  gameService.getSong(socketService.socket, (link) =>{
    console.log("React: ", link)
    this.setState({video: link})
    console.log("state: ",this.state.video)
    //Punkt wird dem Client hinzugefügt, der den Song richtig erraten hat; Serverseitig gelöst, damit später alle Clients die Punkte von anderen sehen können
    gameService.check_input(socketService.socket, this.state.userGuess)
    gameService.add_point(socketService.socket, (point) =>{
      console.log("add point: ",point)
      this.setState({points: this.state.points + point})
    })
    
  })
  
 }





  render() {
      return (
        
        <div>
          {/* Abstand zu Navbar */}
          <br></br>


          <Label>hello</Label>
          <Label>Your Points: {this.state.points}</Label>


          <Form onSubmit={this.onSubmit}>

          <Form.Dropdown
                placeholder='Select Game'
                fluid
                selection
                search
                icon={{ name: this.state.icon, color: this.state.iconcolor }}
                options={this.state.dropdownOptions}
                onChange={this.onChangeDropdown}
                selectOnNavigation={true}
              ></Form.Dropdown>

                <Form.Button content='Start' color='green'/>
          </Form>
          <iframe width="400" height="400" src={this.state.video} title="YouTube video player" frameborder="0" allow="autoplay; encrypted-media;" allowfullscreen></iframe>
          
          
        </div>
      )
  }
}