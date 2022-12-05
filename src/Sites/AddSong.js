import React, { Component } from 'react'
import { Form, GridRow, Label, Grid, Dropdown, Table, Button } from 'semantic-ui-react'
import axios from 'axios';



export default class AddSong extends Component {
  constructor(props) {
      super(props)

      //Initialisierung der Funktionen um den Input zu akzeptieren
      this.onChangeSongName = this.onChangeSongName.bind(this);
      this.onChangeLink = this.onChangeLink.bind(this);
      this.onChangeComposers = this.onChangeComposers.bind(this);
      this.onChangeDropdown = this.onChangeDropdown.bind(this);
      this.onSubmit = this.onSubmit.bind(this);

      //Deklaration der einzelnen Datenbank Variablen und anderer Variablen
      this.state = {
          musicData: [],
          //Daten von der Datenbank werden in ein eigenes Objekt für das Dropdown gespeichert
          dropdownData: [],
          //Standard Form, damit das Dropdown es erkennt
          dropdownOptions:[],
          game: '',
          songname: '',
          link:'',
          composers:'',

          songs: [
         ],
         video: ""

      }


//Einzelne Set Funktionen
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


//Funktion um die Tabelle zu aktualisieren, damit die richtigen Songs angezeigt werden
onChangeDropdown(e) {

  this.setState((currentState) =>{
    //Songs die angezeigt werden sollen
  const newSongs = [];
  //Spiel das ausgewählt wird
  const game = e.target.textContent;

  //For Schleife, die für jedes vorhandene Spiel Objekt ausgeführt wird, bis das ausgewählte gefunden wurde
  this.state.musicData.forEach((data) =>{
    if(data.game == game){
      //For Schleife, die für jedes vorhandene Musik Objekt im ausgewählten Spiel ausgeführt wird
         data.songs.forEach((song, index) =>{
        newSongs.push({
          id: index+1,
          nr: index+1,
          songname: song.name,
          link: song.link,
          approved: song.songapproved
        })
      })
    }
  })
  return{
    //Um die Alten Daten zu behalten, falls bei der Auswahl eines neuen Spiels ein Fehler aufgetreten ist
    ...currentState,
    game,
    songs: newSongs,
  }
})
}


//Standard Funktion; wird aufgerufen bevor/während die Seite geladen wird
  componentDidMount(){
    //Get Request für alle Daten
    axios.get('https://vmq-production.up.railway.app/getAll')
    .then(res => {
      //Alle Daten werden in ein Objekt abgespeichert
        this.setState({ musicData: res.data });
        for(var i = 0; i < this.state.musicData.length; i++){
          //Namen der Spiele wird in DropdownData gespeichert
          this.state.dropdownData.push(this.state.musicData[i].game)

        }
        
        //DropdownOptions wird in die richtige Form gebracht und alle Daten hineingegeben
        for(var j = 0; j < this.state.dropdownData.length; j++){
          this.state.dropdownOptions.push({key: this.state.dropdownData[j], text: this.state.dropdownData[j], value: this.state.dropdownData[j]})
        }

        
    })
    .catch(function (error) {
        console.log(error);
    })

  }

  

  


  //Daten der Tabelle wird für das richtige Spiel gerendert
  renderTableData() {
    return this.state.songs.map((song, index) => {
       var { id, nr, songname, link, approved } = song 
       if(!approved){
        approved = "false"
      }else{
        approved = "true"
      }
       return (
          <Table.Row key={id}>
             <Table.Cell>{nr}</Table.Cell>
             <Table.Cell>{songname}</Table.Cell>
             <Table.Cell>{link}</Table.Cell>
             <Table.Cell>{approved}</Table.Cell>
          </Table.Row>
       )
    })
 }

  onSubmit(e){

    const songObject = {
      game: this.state.game,
      songs: 
        {
          name: this.state.songname,
          link: this.state.link,
          composers: this.state.composers.split(", "),
          songapproved: false
        }
      
  };
  //Update Endpoint wird aufgerufen und die eingegebenen Daten übergeben
  axios.post('https://vmq-production.up.railway.app/update', songObject)
          .then((res) => {
              console.log(res.data)
          }).catch((error) => {
              console.log(error)
          });

    this.setState({songname:'', link:'', composers:''})
  }



  render() {
    
      return (
        <div>
          {/* Abstand zu Navbar */}
          <br></br>

          <Form>
            <Form.Dropdown 
            placeholder='Select Game'
            fluid
            selection
            options={this.state.dropdownOptions}
            onChange={this.onChangeDropdown}
            >
            
            </Form.Dropdown>

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

            <Grid>
              <Grid.Row>
                <Grid.Column>
                <Form.Button onClick={this.onSubmit} content='Submit' color='green'/>
                </Grid.Column>
                
              </Grid.Row>
            </Grid>
          </Form>

          <Table>
           <Table.Header>
               <Table.Row>
                  <Table.HeaderCell width={1}>Nr</Table.HeaderCell>
                  <Table.HeaderCell width={2}>Songname</Table.HeaderCell>
                  <Table.HeaderCell width={1}>Link</Table.HeaderCell>
                  <Table.HeaderCell width={1}>approved</Table.HeaderCell>
               </Table.Row>
           </Table.Header>
           {this.renderTableData()}
        </Table>
          
        </div>
      )
  }
}