import React, { Component } from 'react'
import { Menu, Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export default class MenuExampleContentProp extends Component {
  state = {}

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state

    return (
      //Navbar mit Elementen
    <Menu attached='top' style={{backgroundColor: "#18181B"}}  inverted>
      <Menu.Item as={Link} to='/'
          
          active={activeItem === 'Game'}
          icon='home'
          onClick={this.handleItemClick}
        />
        {/*Dropdown in der Navbar*/}
      <Dropdown text='API' item icon='wrench' simple className='right' closeOnBlur >
            {/*Elemente im Dropdown, as Link = Routing*/}
            <Dropdown.Menu className='left' closeOnChange closeOnBlur closeOnEscape>
              <Dropdown.Item as={Link} to='/addgame'>Add Game</Dropdown.Item>
              <Dropdown.Item as={Link} to='/addsong'>Add Song</Dropdown.Item>
            </Dropdown.Menu>
        
      </Dropdown>
      
    </Menu>
    
   
    )
  }
}