import React, { Component } from 'react'
import { Form, GridRow, Label, Grid, Icon, Input, Message, Header, Button, Visibility, Card, Image, GridColumn, Segment } from 'semantic-ui-react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import axios from 'axios';
import "../Timer.css";


export default class ApiForm extends Component {
  constructor(props) {
    super(props)

    //Initialisierung der Funktionen um den Input zu akzeptieren

    //Deklaration der einzelnen Datenbank Variablen
    this.state = {
      musicData: [],
      iconcolor: 'grey',
      icon: 'checkmark',
      video: '',
      userGuess: 'ratio',
      dropdownData: [],
      dropdownOptions: [{
        key: '',
        text: '',
        value: ''
      }],
      currentGame: '',
      gameBefore: '',
      songBefore: '',
      points: 0,
      timer: 20,
      totalSongs: 0,
      guessingRate: 0,
      countdownPlaying: false,
      checkRemainingTime: false,
      skin: 0
    }
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeDropdown = this.onChangeDropdown.bind(this);
  }

  componentDidMount() {
    this.setState({ skin: "./skins/" + Math.floor(Math.random() * (4 - 1) + 1) + ".png" })
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
        this.randomSong()
        //this.intervalID = setInterval(e => this.randomSong(), 25000)
        //this.timerInterval = setInterval(e => this.changeTimer(), 1000)

      })
      .catch(function (error) {
        console.log(error);
      })




  }

  componentWillUnmount() {
    clearInterval(this.intervalID)
    this.setState({ points: 0, userGuess: 'ratio', game: '', musicData: [], countdownPlaying: false })
    this.timerInterval = 0;
    this.intervalID = 0;
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time)
    )
  }

  changeTimer() {
    this.setState({ timer: this.state.timer - 1 })

    if (this.state.timer == 0) {
      this.setState({ countdownPlaying: false })
      this.setState({ timer: 25 })
    }
  }

  intervalID = 0;
  timerInterval = 0;
  randomSong = () => {
    console.log(this.state.skin)
    var k = Math.floor(Math.random() * this.state.musicData.length);
    var p = Math.floor(Math.random() * this.state.musicData[k].songs.length);
    this.setState({ video: "https://www.youtube.com/embed/" + this.state.musicData[k].songs[p].link + "?start=10&autoplay=1", currentGame: this.state.musicData[k], countdownPlaying: true })
    this.sleep(20000).then(() => {

      //console.log(this.state.userGuess)
      //console.log(this.state.currentGame.game)
      if (this.state.userGuess == this.state.currentGame.game) {
        this.setState({ points: this.state.points + 1 })
      }
      console.log("points: " + this.state.points)
      this.setState({ gameBefore: this.state.currentGame, songBefore: this.state.currentGame.songs[p].name, totalSongs: this.state.totalSongs + 1 })
      this.setState({ guessingRate: Math.round(((this.state.points / this.state.totalSongs) * 100 + Number.EPSILON) * 100) / 100 })
      this.setState({ iconcolor: 'grey', checkRemainingTime: true })

    })
  }

  renderResult() {
    return (
      <div>
        <Label>Last game info</Label>
        <Segment compact>
          Game: <b>{this.state.gameBefore.game}</b>
          <br></br>
          <br></br>
          Gameseries: <b>{this.state.gameBefore.series}</b>
          <br></br>
          <br></br>
          Song: <b>{this.state.songBefore}</b>
        </Segment>
      </div>
    )

  };


  onSubmit() {
    this.setState({ iconcolor: 'green' })
  }


  onChangeDropdown = (e, { value }) => this.setState({ userGuess: value })

  renderTime = ({ remainingTime }) => {

    if (remainingTime === 0) {
      return <div className="timer">Next song is loading...</div>;
    }
    /*if(remainingTime === 0 && this.state.checkRemainingTime == true){
      this.setState({countdownPlaying: false, checkRemainingTime: false})
    }*/

    return (
      <div className="timer">
        <div className="timertext">Remaining</div>
        <div className="value">{remainingTime}</div>
        <div className="timertext">seconds</div>
      </div>
    );
  };


  render() {

    let renderResult
    if (this.state.gameBefore != '') {

      renderResult = this.renderResult()
    }
    return (

      <div>
        {/* Abstand zu Navbar */}
        <br></br>
        <Grid>
          <Grid.Row columns={3}>
            <GridColumn></GridColumn>
            <GridColumn>
              <div className="timer-wrapper">
                <CountdownCircleTimer
                  isPlaying={this.state.countdownPlaying}
                  duration={20}
                  colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                  colorsTime={[10, 6, 3, 0]}
                  onComplete={() => {

                    this.sleep(5000).then(() => {
                      this.randomSong()

                    })
                    return { shouldRepeat: true, delay: 5 }

                  }}
                >
                  {this.renderTime}
                </CountdownCircleTimer>
              </div>
            </GridColumn>
          </Grid.Row>
          <Grid.Row columns={3}>
            <Grid.Column>

            </Grid.Column>
            <Grid.Column><Form onSubmit={this.onSubmit}>
              <Label>Guess Game</Label>
              <Form.Field

              ><Form.Dropdown
                placeholder='Select Game'
                fluid
                selection
                search
                icon={{ name: this.state.icon, color: this.state.iconcolor }}
                options={this.state.dropdownOptions}
                onChange={this.onChangeDropdown}
                selectOnNavigation={true}
              >

                </Form.Dropdown>

              </Form.Field>


            </Form>
            </Grid.Column>
            <Grid.Column></Grid.Column>
          </Grid.Row>
          <Grid.Row columns={5}>
            <Grid.Column>
              {renderResult}
            </Grid.Column>
            <Grid.Column>
            </Grid.Column>
            <Grid.Column verticalAlign='bottom'>
              <Card>
                <Image src={this.state.skin} size="medium" />
                <Card.Content>
                  <Card.Header>User 1</Card.Header>
                  <Card.Meta>Played a total of {this.state.totalSongs} songs in this round</Card.Meta>
                  <Card.Description>
                    <h2>You got {this.state.points} points</h2>
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <a>
                    <Icon name='game' />
                    Guessing rate: {this.state.guessingRate}%
                  </a>
                </Card.Content>
              </Card>

            </Grid.Column>
            <Grid.Column>
            </Grid.Column>
          </Grid.Row>
        </Grid>



        <iframe width="0" height="0" src={this.state.video} title="YouTube video player" frameborder="0" allow="autoplay; encrypted-media;" allowfullscreen></iframe>
      </div>
    )
  }
}