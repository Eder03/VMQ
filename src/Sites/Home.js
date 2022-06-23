import React, { Component } from 'react'
import { Segment, Form, GridRow, Label, Grid, Icon, Input, Message, Header, Button, Visibility, Image, GridColumn } from 'semantic-ui-react'
import { Link } from 'react-router-dom'



export default class ApiForm extends Component {
  constructor(props) {
      super(props)

      //Deklaration der einzelnen Datenbank Variablen
      this.state = {
      }
  }
  
  //Standard Funktion; wird aufgerufen bevor/während die Seite geladen wird
  componentDidMount(){
  }

  //Standard Funktion; wird aufgerufen nachdem die Seite geschlosse wird
  componentWillUnmount(){
  }


  render() {
      return (
        
        <div>
          {/* Abstand zu Navbar */}
          <br></br>


          <Image centered src='./VMQ_OMG_DAS_IST_DAS_BESTE_LOGO.png' size='large'/>
          <Segment textAlign='center'>
            <Grid textAlign='center'>
            <Grid.Row >
            <Button as={Link} to='/singleplayer'content='Play' color='green'></Button>
            </Grid.Row>
            <Grid.Row >
            <Button as={Link} to='/multiplayer'content='Multiplayer' color='green'></Button>
            </Grid.Row>
            </Grid>
          
          
          </Segment>
          
          
        </div>
      )
  }
}