const express = require('express');
const app = express();
const http = require('http');
const axios = require("axios");




const Koa = require("koa");
const { createServer } = require("http");
const { Server } = require("socket.io");

const server = new Koa();

const httpServer = createServer(server.callback());



const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

let musicData = [];
let clients = [];
const countdownDuration = 20;
const pauseDuration = 7;
let timer = null;
let currentRound = 0;
const maxRounds = 20;

let playedSongs = [];

const port = process.env.PORT || 5002;

httpServer.listen(port, () => {
  console.log('listening on ' + port);

  
});

function sendSelectedSong() {
  if (playedSongs.length === musicData.reduce((total, game) => total + game.songs.length, 0)) {
    console.log('All songs have been played.');
    return;
  }

  let selectedSong;
  let isUnique = false;

  while (!isUnique) {
    const k = Math.floor(Math.random() * musicData.length);
    const p = Math.floor(Math.random() * musicData[k].songs.length);
    const songId = `${musicData[k].name}_${musicData[k].songs[p].link}`; // Create a unique identifier for the song

    if (!playedSongs.includes(songId)) {
      selectedSong = {
        video: `https://www.youtube.com/embed/${musicData[k].songs[p].link}?start=10&autoplay=1&showinfo=0&loop=1`,
        currentGame: musicData[k],
        currentSong: musicData[k].songs[p]
      };
      playedSongs.push(songId); // Add the song to the played list
      isUnique = true;
    }
  }

  io.emit('gameStarted', selectedSong, maxRounds);
}

function resetPlayedSongs() {
  playedSongs = [];
}

function updateConnectedClients() {
  io.emit('updateClients', clients);
}

function startTimer() {
  if (timer) {
    clearInterval(timer);
  }
  let remainingTime = countdownDuration;
  io.emit('startTimer', { remainingTime });

  timer = setInterval(() => {
    remainingTime--;
    io.emit('updateTimer', { remainingTime });

    if (remainingTime <= 0) {
      clearInterval(timer);
      io.emit('timerFinished');
      currentRound++;

      if (currentRound < maxRounds) {
        setTimeout(() => {
          io.emit('nextSongLoading');
          setTimeout(() => {
            sendSelectedSong();
            startTimer();
          }, pauseDuration * 1000);
        }, 0);
      } else {
        setTimeout(()=>{
          announceWinner();
        }, 500
        )
        
      }
    }
  }, 1000);
}

function announceWinner() {
  const allPoints = clients.map(client => client.points);
  const maxPoints = Math.max(...allPoints);
  const winners = clients.filter(client => client.points === maxPoints);
  io.emit('winnerAnnounced', winners);
}

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('setUsername', (username, points) => {
    const skin = "https://raw.githubusercontent.com/Eder03/vmq_skins/main/skins/" + Math.floor(Math.random() * (24 - 1) + 1) + ".gif";
    clients.push({ id: socket.id, username: username, points: points, skin: skin });
    updateConnectedClients();
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clients = clients.filter(client => client.id !== socket.id);
    updateConnectedClients();
  });

  socket.on('startGame', () => {
    console.log("start game");
    currentRound = 0;

    axios.get('https://vmq.onrender.com/getAll')
    .then(res => {
      musicData = res.data;
    });

    
    resetPlayedSongs();
    sendSelectedSong();
    startTimer();
  });

  socket.on('sendPoints', ({ points }) => {
    const clientId = socket.id;
    const clientIndex = clients.findIndex(client => client.id === clientId);
    if (clientIndex !== -1) {
      clients[clientIndex].points = points;
      io.emit('updatePoints', clients);
    }
  });

  socket.on('loadNextSong', () => {
    sendSelectedSong();
    startTimer();
  });

  socket.on('sendWinner', (winner) => {
    io.emit('winnerAnnounced', winner);
  });

  // Beispiel: Server-seitige Logik zum Senden der Guesses an alle Clients
socket.on('userGuess', ({ username, guess, isCorrect }) => {
  io.emit('updateGuesses', { username, guess, isCorrect });
});

socket.on('resetGameAndPoints', () => {
  io.emit('resetGameState'); // An alle Clients senden
  io.emit('resetPoints'); // An alle Clients sende
});

socket.on('startGameAndHideButton', () => {
  io.emit('hideStartButton'); // An alle Clients senden
});

 // Chat-Nachrichten
 socket.on('sendMessage', (message) => {
  io.emit('receiveMessage', message);
});


});
