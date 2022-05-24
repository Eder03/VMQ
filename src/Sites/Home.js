import React, { Component } from 'react'
import { Segment, Form, GridRow, Label, Grid, Icon, Input, Message, Header, Button, Visibility, Image, GridColumn } from 'semantic-ui-react'
import axios from 'axios';
import { Link } from 'react-router-dom'



export default class ApiForm extends Component {
  constructor(props) {
      super(props)

      //Initialisierung der Funktionen um den Input zu akzeptieren

      //Deklaration der einzelnen Datenbank Variablen
      this.state = {
      }
  }
  
  componentDidMount(){
  }

  componentWillUnmount(){
  }


  render() {
      return (
        
        <div>
          {/* Abstand zu Navbar */}
          <br></br>


          <Image centered src='C:\Users\Huawei\Desktop\VMQ\Umsetzung\React\vmq\frontend\src\static\VMQ_OMG_DAS_IST_DAS_BESTE_LOGO.png' size='large'/>
          <Segment textAlign='center'>
            <Grid textAlign='center'>
            <Grid.Row >
            <Button as={Link} to='/singleplayer'content='Play' color='green'></Button>
            </Grid.Row>
            <Grid.Row >
            <Button as={Link} to='/singleplayer'content='Multiplayer' color='green'></Button>
            </Grid.Row>
            </Grid>
          
          
          </Segment>
          
          
        </div>
      )
  }
}