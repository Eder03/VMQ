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

      //this.updateTable = this.updateTable.bind(this)
      this.onSubmit = this.onSubmit.bind(this);

      //Deklaration der einzelnen Datenbank Variablen
      this.state = {
          musicData: [],
          dropdownData: [],
          dropdownOptions:[{
            key: '',
            text: '',
            value: ''
          }],
          game: '',
          songname: '',
          link:'',
          composers:'',



          songs: [
            { id: 1, nr: 1, songname: '', link: '', approved: false },
         ],
         video: ""

      }



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

onChangeDropdown(e) {

  this.setState((currentState) =>{
  const newSongs = [];
  const game = e.target.textContent;

  this.state.musicData.forEach((data) =>{
    if(data.game == game){
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
    ...currentState,
    game,
    songs: newSongs,
  }
})
}



  componentDidMount(){
    axios.get('https://vmq-server.herokuapp.com/getAll')
    .then(res => {
        this.setState({ musicData: res.data });
        for(var i = 0; i < this.state.musicData.length; i++){
          this.state.dropdownData.push(this.state.musicData[i].game)

        }
        

        this.state.dropdownOptions[0].key = this.state.dropdownData[0]
        this.state.dropdownOptions[0].text = this.state.dropdownData[0]
        this.state.dropdownOptions[0].value = this.state.dropdownData[0]
        for(var j = 1; j < this.state.dropdownData.length; j++){
          this.state.dropdownOptions.push({key: this.state.dropdownData[j], text: this.state.dropdownData[j], value: this.state.dropdownData[j]})
        }

        
    })
    .catch(function (error) {
        console.log(error);
    })

  }

  

  


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
  axios.post('https://vmq-server.herokuapp.com/update', songObject)
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
                
                {/*<Button color='instagram' onClick={this.updateTable}> Update Table</Button>*/}
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