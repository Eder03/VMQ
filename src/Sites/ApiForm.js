import React, { Component } from 'react'
import { Form, GridRow, Label, Grid } from 'semantic-ui-react'
import axios from 'axios';


export default class ApiForm extends Component {
  constructor(props) {
      super(props)

      //Initialisierung der Funktionen um den Input zu akzeptieren
      this.onChangeGame = this.onChangeGame.bind(this);
      this.onChangeSeries = this.onChangeSeries.bind(this);
      this.onChangeSongName = this.onChangeSongName.bind(this);
      this.onChangeLink = this.onChangeLink.bind(this);
      this.onChangeComposers = this.onChangeComposers.bind(this);
      this.onChangePlatforms = this.onChangePlatforms.bind(this);
      this.onChangeGenres = this.onChangeGenres.bind(this);
      this.onChangePublisher = this.onChangePublisher.bind(this);
      this.onChangeDeveloper = this.onChangeDeveloper.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      

      //Deklaration der einzelnen Datenbank Variablen
      this.state = {
          game: '',
          series: '',
          songname: '',
          link:'',
          composers:'',
          platforms:'',
          genres:'',
          publisher:'',
          developer:''
      }
  }
  //Setter Funktionen für die Datenbank Variablen
  onChangeGame(e) {
      this.setState({ game: e.target.value })
  }
  onChangeSeries(e) {
      this.setState({ series: e.target.value })
  }
  onChangeSongName(e) {
    this.setState({ songname: e.target.value })
}

onChangeLink(e) {
  this.setState({ link: e.target.value })
}

onChangeComposers(e){
  this.setState({composers: e.target.value})
}

onChangePlatforms(e){
  this.setState({platforms: e.target.value})
}

onChangeGenres(e){
  this.setState({genres: e.target.value})
}

onChangePublisher(e){
  this.setState({publisher: e.target.value})
}

onChangeDeveloper(e){
  this.setState({developer: e.target.value})
}

//Funktion für Submit Button
  onSubmit(e) {
    //
      e.preventDefault()
      //Music Collection Objekt
      const musicObject = {
          game: this.state.game,
          series: this.state.series,
          songs: [
            {
              name: this.state.songname,
              link: this.state.link,
              composers: this.state.composers.split(", "),
              songapproved: false
            }
          ],
          platforms: this.state.platforms.split(", "),
          genres: this.state.genres.split(", "),
          publisher: this.state.publisher,
          developer: this.state.developer
      };
      //Aufruf des POST Endpoints
      axios.post('https://vmq-server.herokuapp.com/addMusic', musicObject)
          .then((res) => {
              console.log(res.data)
          }).catch((error) => {
              console.log(error)
          });
          //Nach Submit werden die Werte Zurückgesetzt
      this.setState({ game: '', series: '', songname:'', link:'', composers:'', publisher:'', developer:'', genres:'', platforms:''})
  }

  render() {
  
      return (
        <div>
          {/* Abstand zu Navbar */}
          <br></br>
          
          <Form onSubmit={this.onSubmit}>
          <Label>Game Informations</Label>
            <Form.Group>
              <Form.Input 
                placeholder='Game e.g. Mario Kart 8'
                name='game'
                value={this.state.game}
                onChange={this.onChangeGame}
              />
              <Form.Input width="3"
                placeholder='Gameseries e.g. Mario Kart'
                name='series'
                value={this.state.series}
                onChange={this.onChangeSeries}
              />
            </Form.Group>
            <Label>Song Information</Label>
            <Form.Group>
            <Form.Input width="4"
                placeholder='Songname e.g. Main Theme'
                name='songName'
                value={this.state.songname}
                onChange={this.onChangeSongName}
              />
              <Form.Input width="3"
                placeholder='Youtube ID e.g. UC_U0l2E-Rs'
                name='link'
                value={this.state.link}
                onChange={this.onChangeLink}
              />
              <Form.Input width="4"
                placeholder='Composers e.g. Koji Kondo, Toby Fox'
                name='composers'
                value={this.state.composers}
                onChange={this.onChangeComposers}
              />
            </Form.Group>
           <Label>Game Developer Information</Label>
            <Form.Group>
            
            <Form.Input width="3"
                placeholder='Publisher e.g. Nintendo'
                name='publisher'
                value={this.state.publisher}
                onChange={this.onChangePublisher}
              />
              <Form.Input width="3"
                placeholder='Developer e.g. Level-5'
                name='developer'
                value={this.state.developer}
                onChange={this.onChangeDeveloper}
              />


            </Form.Group>
            <Label>additional Game Information</Label>
            <Form.Group>
            <Form.Input width="3"
                placeholder='genres e.g. Action, Adventure'
                name='genres'
                value={this.state.genres}
                onChange={this.onChangeGenres}
              />
              <Form.Input width="3"
                placeholder='platforms e.g. PC, PS4'
                name='platforms'
                value={this.state.platforms}
                onChange={this.onChangePlatforms}
              />


            </Form.Group>
            <Form.Button content='Submit' color='green'/>

          </Form>
        </div>
      )
  }
}