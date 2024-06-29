import React, { Component } from 'react';
import { Card, Form, Grid, Image, Modal, Button, Label, Input, Segment } from 'semantic-ui-react';
import axios from 'axios';
import { io } from 'socket.io-client';

export default class ApiForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userGuess: '',
      musicData: {},
      dropdownData: [],
      video: '',
      selectedsong: {},
      guessedSong: '',
      AllPlayerPoints: {},
      roundCount: 0,

      dropdownOptions: [],
      roomName: 'public_server',
      connectionError: false,
      points: 0,
      clients: 0,
      timerinterval: 0,
      username: '',
      showUsernamePopup: true,
      connectedClients: [],
      showModal: false,
      winnerUsernames: '',
      winnerPoints: 0,
      skin: 0,
      countdownPlaying: false,
      remainingTime: 20,
      loadingNextSong: false,
      timerInterval: null,
      timerStart: 20,
      circleProgress: 0, // Neue Zustand für die Kreisanimation
      isPaused: false, // Neue Zustand für den Pause-Status
      currentRound: 0,
      maxRounds: 0,
      gameBefore: '',
      songBefore: '',
      guesses:{},
      showStartButton: true, 
      winners: [],
      winnerInfo: ''
    };

    this.socket = io('https://vmq-server.onrender.com:5001');
    this.startGame = this.startGame.bind(this);
    this.handleUsernameSubmit = this.handleUsernameSubmit.bind(this);
  }

  componentDidMount() {
    axios.get('https://vmq.onrender.com/getAll')
      .then(res => {
        this.setState({ musicData: res.data });

        for (let i = 0; i < this.state.musicData.length; i++) {
          this.state.dropdownData.push(this.state.musicData[i].game);
        }

        for (let j = 0; j < this.state.dropdownData.length; j++) {
          this.state.dropdownOptions.push({ key: this.state.dropdownData[j], text: this.state.dropdownData[j], value: this.state.dropdownData[j] });
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    this.socket.on('updatePoints', (clients) => {
      this.setState({ connectedClients: clients });
    });

    this.socket.on('updateClients', (clients) => {
      this.setState({ connectedClients: clients });
      this.setState({ clients: this.state.connectedClients.length });
    });

    this.socket.on('gameStarted', (selectedSong, maxRounds) => {
      if(Object.keys(this.state.selectedsong).length != 0){
        this.setState({gameBefore: this.state.selectedsong.currentGame})
        this.setState({songBefore: this.state.selectedsong.currentSong.name})
      }
      
      this.setState({ selectedsong: selectedSong, loadingNextSong: false });
      this.setState({maxRounds: maxRounds});
      this.setState(prevState => ({
        roundCount: prevState.roundCount + 1
      }));
      this.resetGuesses()
      this.resetDropdown();
    });

    this.socket.on('nextSongLoaded', (selectedSong) => {
      
      this.setState({ selectedsong: selectedSong, loadingNextSong: false });
      this.setState(prevState => ({
        roundCount: prevState.roundCount + 1
      }));
      this.resetGuesses()
      this.resetDropdown();
    });

    this.socket.on('winnerAnnounced', (winners) => {
      // Überprüfe, ob winners ein Array ist und lege es gegebenenfalls fest
      if (!Array.isArray(winners)) {
        winners = [winners];
      }
    
      // Extrahiere nur die Benutzernamen der Gewinner
      const winnerNames = winners.map(winner => winner.username);
    
      // Extrahiere die Punkte des ersten Gewinners (falls es mehrere gibt, haben sie die gleiche Punktzahl)
      const points = winners.length > 0 ? winners[0].points : 0;
    
      // Setze den Zustand, um das Modal anzuzeigen und die Gewinnerinformationen zu speichern
      if (winners.length === 1) {
        this.setState({ 
          showModal: true,
          winnerInfo: `Der Gewinner ist ${winnerNames[0]} mit ${points} Punkten${winners.length > 1 ? 'en' : ''}!`,
          showStartButton: true 
        });
      } else {
        this.setState({ 
          showModal: true,
          winnerInfo: `Die Gewinner sind ${winnerNames.join(', ')} mit ${points} Punkt${winners.length > 1 ? 'en' : ''}!`,
          showStartButton: true 
        });
      }
    });
    
    

    this.socket.on('startTimer', ({ remainingTime }) => {
      this.setState({ remainingTime, countdownPlaying: true });
      this.startTimerAnimation();
      this.resetGuesses()
      this.resetDropdown();
    });

    this.socket.on('updateTimer', ({ remainingTime }) => {
      this.setState({ remainingTime });
    });

    this.socket.on('timerFinished', () => {
      this.setState({ countdownPlaying: false, loadingNextSong: true });
      this.guessSong();
      this.sendPoints();
    });

    this.socket.on('nextSongLoading', () => {
      this.setState({ remainingTime: 5 });
      setTimeout(() => {
        this.setState({ countdownPlaying: true });
      }, 5000);
    });

    this.socket.on('updateGuesses', ({ username, guess, isCorrect }) => {
      this.updateGuesses(username, guess, isCorrect);
    });

    this.socket.on('resetGameState', () => {
      this.resetGameState();
    });

    this.socket.on('hideStartButton', () => {
      this.setState({ showStartButton: false });
    });

    this.socket.on('resetPoints', () => {
      this.resetPoints();
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.timerInterval);
  }

  updateGuesses = (username, guess, isCorrect) => {
    this.setState(prevState => ({
      guesses: {
        ...prevState.guesses,
        [username]: { guess, isCorrect }
      }
    }));
  };

  resetGuesses = () => {
    this.setState({ guesses: {} });
  };

  resetDropdown = () => {
    this.setState({ userGuess: '' });
  };
  

  startTimerAnimation = () => {
    const { timerStart } = this.state;
    const intervalDuration = 1000 / timerStart; // Intervalldauer berechnen basierend auf der Startzeit
  
    const timerInterval = setInterval(() => {
      const { remainingTime, countdownPlaying } = this.state;
  
      if (countdownPlaying && remainingTime > 0) {
        // Aktualisierten Kreisfortschritt berechnen
        const timePercentage = (remainingTime / timerStart) * 100;
        const circleProgress = 2 * Math.PI * 45 * (1 - timePercentage / 100);
        this.setState({ circleProgress });
      } else {
        // Wenn Countdown nicht mehr läuft oder Zeit abgelaufen ist, Animation stoppen und Kreis vollständig anzeigen
        clearInterval(timerInterval);
        this.setState({ circleProgress: 2 * Math.PI * 45 });
      }
    }, intervalDuration);
  
    this.setState({ timerInterval });
  };
  loadNextSong = () => {
    this.socket.emit('loadNextSong');
  }

  guessSong = () => {
    const { userGuess, selectedsong, username } = this.state;
    const isCorrect = userGuess === selectedsong.currentGame.game;
  
    if (isCorrect) {
      this.setState(prevState => ({
        points: prevState.points + 1
      }), () => {
        this.sendPoints(); // Send points after state update
      });
    } else {
      this.sendPoints(); // Also send points if guess is incorrect
    }
  
  
    this.setState({gameBefore: this.state.selectedsong.currentGame})
    this.setState({songBefore: this.state.selectedsong.currentSong.name})

    // Guesses aktualisieren
    this.updateGuesses(username, userGuess, isCorrect);
    
    // Informiere den Server über den Guess
    this.socket.emit('userGuess', { username, guess: userGuess, isCorrect });
  };

  sendPoints = () => {
    const points = this.state.points;
    this.socket.emit('sendPoints', { points });
  }


  

  handleUsernameSubmit(e) {
    this.setState({ showUsernamePopup: false });
    this.socket.emit('setUsername', this.state.username, this.state.points);
  }

  onChangeDropdown = (e, { value }) => this.setState({ userGuess: value });

  onSubmit(e) { }

   startGame(e) {
    this.socket.emit('resetGameAndPoints');
    this.socket.emit('startGameAndHideButton');
    this.socket.emit('startGame');
    this.setState({ showStartButton: false });
  }

  resetGameState = () => {
    this.setState({
      userGuess: '',
      guessedSong: '',
      AllPlayerPoints: {},
      roundCount: 0,
      points: 0,
      timerinterval: 0,
      countdownPlaying: false,
      remainingTime: 20,
      loadingNextSong: false,
      timerInterval: null,
      circleProgress: 0,
      isPaused: false,
      guesses: {},
      showModal: false,
      selectedsong: {}
    });
    this.sendPoints();
  }

  resetPoints = () => {
    this.setState({
      points: 0
    });
    this.sendPoints();
  }

  renderResult() {
    return (
      <div style={{ marginTop: '5px', width: '300px' }}>
        <Segment compact>
          <Label>Last game info</Label>
          <br />
          <br />
          <b>Game: </b> {this.state.gameBefore.game}
          <br />
          <br />
          <b>Gameseries: </b> {this.state.gameBefore.series}
          <br />
          <br />
          <b>Song: </b> {this.state.songBefore}
        </Segment>
      </div>
    );
  }
  
  
  
  

  render() {
    const { winners, winnerInfo, guesses, clients, points, countdownPlaying, remainingTime, loadingNextSong, selectedsong, connectedClients, showModal, winnerUsernames, winnerPoints, circleProgress, isPaused, roundCount, maxRounds } = this.state;
  
    const svgStyle = {
      width: '100px',
      height: '100px',
    };
  
    const circleStyle = {
      transition: 'stroke-dashoffset 1s ease-in-out',
      strokeDasharray: `${2 * Math.PI * 45}`,
      strokeDashoffset: circleProgress,
      transform: 'rotate(-90deg)',
      transformOrigin: 'center',
    };
  
    const textStyle = {
      fontSize: '14px',
      dominantBaseline: 'middle',
      textAnchor: 'middle',
      fill: '#000',
    };
  
    const roundInfoStyle = {
      position: 'absolute',
      top: '60px',  // Adjusted top value to add space between navbar and round info
      right: '10px',
      zIndex: 1000,
    };
  
    const resultStyle = {
      position: 'absolute',
      top: '50px',
      left: '10px',
      padding: '10px',
      backgroundColor: 'white',
      zIndex: 1000,
      width: '300px',
    };
  
    let renderResult;
    if (this.state.gameBefore != '') {
      renderResult = this.renderResult();
    }
  
    if (this.state.showUsernamePopup) {
      return (
        <Modal open={true} size="tiny">
          <Modal.Header>Bitte geben Sie Ihren Benutzernamen ein:</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Field>
                <Input
                  placeholder="Benutzername"
                  value={this.state.username}
                  onChange={(e) => this.setState({ username: e.target.value })}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button primary onClick={this.handleUsernameSubmit}>
              Bestätigen
            </Button>
          </Modal.Actions>
        </Modal>
      );
    } else {
      if (this.state.connectionError) {
        return <div>Error: Der Socket.IO-Server konnte nicht erreicht werden.</div>;
      } else {
        return (
          <div>
            <br />
  
            <div style={roundInfoStyle}>
              {roundCount > 0 && (
                <Label>Round {roundCount} of {maxRounds}</Label>
              )}
            </div>
  
            <Grid centered>
              <Grid.Row>
                <Grid.Column width={8} textAlign="center">
                  <svg style={svgStyle} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#ddd" strokeWidth="10"></circle>
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#21ba45"
                      strokeWidth="10"
                      strokeLinecap="round"
                      style={circleStyle}
                    ></circle>
                    <text x="50" y="50" style={textStyle}>
                      {countdownPlaying && !isPaused ? remainingTime : 'Paused'}
                    </text>
                  </svg>
                </Grid.Column>
              </Grid.Row>
  
              <Grid.Row>
                <Grid.Column width={8}>
                  <Form onSubmit={this.onSubmit}>
                    <Form.Dropdown
                      placeholder="Select Game"
                      fluid
                      selection
                      search
                      icon={{ name: this.state.icon, color: this.state.iconcolor }}
                      options={this.state.dropdownOptions}
                      value={this.state.userGuess} // Bindung des Dropdowns an den Zustand
                      onChange={this.onChangeDropdown}
                      selectOnNavigation={true}
                      style={{ minWidth: '400px' }}
                    />
                  </Form>
                </Grid.Column>
              </Grid.Row>
  
              <Grid.Row style={{ marginTop: '20px' }}>
              {connectedClients.map((client, index) => (
            <Card.Group centered key={index} style={{ margin: '12px' }}>
              <Card style={{ width: '250px' }}>
                <div style={{ height: '250px', overflow: 'hidden' }}>
                  <Image src={client.skin} style={{ width: '250px', height: '250px', objectFit: 'cover' }} />
                </div>
                <Card.Content>
                  <Card.Header>{client.username}</Card.Header>
                  <Card.Meta>Spieler</Card.Meta>
                  <Card.Description>
                    <h2>Punkte: {client.points}</h2>
                  </Card.Description>
                </Card.Content>
                {guesses[client.username] && (
                  <Label
                    pointing
                    color={guesses[client.username].isCorrect ? 'green' : 'red'}
                  >
                    {guesses[client.username].guess}
                  </Label>
                )}
              </Card>
            </Card.Group>
          ))}
              </Grid.Row>
  
              {this.state.showStartButton && (
                <Grid.Row>
                  <Form>
                    <Form.Button content="Start" color="green" onClick={this.startGame} />
                  </Form>
                </Grid.Row>
              )}
            </Grid>
  
            <iframe id="youtube-video" width="0" height="0" src={this.state.selectedsong.video} title="YouTube video player" frameBorder="0" allow="autoplay; encrypted-media;" allowFullScreen></iframe>
  
            <Modal open={showModal} onClose={() => this.setState({ showModal: false })}>
              <Modal.Header>Spiel beendet</Modal.Header>
              <Modal.Content>
                <p>{winnerInfo}</p>
              </Modal.Content>
              <Modal.Actions>
                <Button onClick={() => this.setState({ showModal: false })}>Schließen</Button>
              </Modal.Actions>
            </Modal>
  
            {renderResult && (
              <div style={resultStyle}>
                {renderResult}
              </div>
            )}
          </div>
        );
      }
    }
  }
  
  
  
  
  
  
  
  
  
}
