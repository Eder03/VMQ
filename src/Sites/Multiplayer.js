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

      //Initialisierung der Funktionen um den Input zu akzeptieren

      //Deklaration der einzelnen Datenbank Variablen
      this.state = {
          userGuess:'',
          musicData: {},
          dropdownData: [],
          video:'',
      dropdownOptions: [{
        key: '',
        text: '',
        value: ''
      }],
      roomName: "public_server",
      points: 0
      }
  }

 /*connect = () =>{
    const socket = io("http://localhost:9000");
    socket.on("connect", () =>{

        socket.emit("custom_event", {name: "Alex"})
    })

}*/
  connectSocket = async () =>{
      const socket = await socketService.connect("http://localhost:9000").catch((err)=>{
        console.log("Error: ", err)
      });
  }

  joinRoom = async () =>{
      const socket = socketService.socket;
      if(!this.state.roomName || this.state.roomName.trim() === "" || !socket) return;

      const joined = await gameService.joinGameRoom(socket, this.state.roomName).catch((err) =>{
          alert(err);
      })

  }
  componentDidMount(){
    axios.get('https://vmq-server.herokuapp.com/getAll')
    .then(res => {
      this.setState({ musicData: res.data });

      for (var i = 0; i < this.state.musicData.length; i++) {
        this.state.dropdownData.push(this.state.musicData[i].game)
      }
      this.state.dropdownOptions[0].key = this.state.dropdownData[0]
      this.state.dropdownOptions[0].text = this.state.dropdownData[0]
      this.state.dropdownOptions[0].value = this.state.dropdownData[0]
      for (var j = 1; j < this.state.dropdownData.length; j++) {
        this.state.dropdownOptions.push({ key: this.state.dropdownData[j], text: this.state.dropdownData[j], value: this.state.dropdownData[j] })
      }
    })
    .catch(function (error) {
      console.log(error);
    })
    //this.connect();
    this.connectSocket()
    this.joinRoom()
    
  }

  componentWillUnmount(){
    clearInterval(this.timerinterval)
    this.timerinterval = 0;
  }

  onChangeDropdown = (e, { value }) => this.setState({ userGuess: value })
  onSubmit(e){

    clearInterval(this.timerinterval)
    this.timerinterval = 0;
    e.preventDefault();
    console.log("render")
    this.getSong()
    this.timerinterval = setInterval(this.getSong, 20000)
    
  }

 timerinterval = 0;

 getSong(){
  gameService.updateSong(socketService.socket);
  gameService.getSong(socketService.socket, (link) =>{
    console.log("React: ", link)
    this.setState({video: link})
    console.log("state: ",this.state.video)
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