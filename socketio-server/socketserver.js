const express = require('express');
const app = express();
const http = require('http');
const axios = require('axios');

const Koa = require('koa');
const { createServer } = require('http');
const { Server } = require('socket.io');

const server = new Koa();
const httpServer = createServer(server.callback());

const io = new Server(httpServer, {
  cors: {
    origin: '*',
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
const YOUTUBE_API_KEY = process.env.ytapi; // Füge hier deinen YouTube API-Schlüssel ein

httpServer.listen(port, () => {
  console.log('listening on ' + port);
});

async function getVideoDuration(videoId) {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        id: videoId,
        part: 'contentDetails',
        key: YOUTUBE_API_KEY
      }
    });
    const duration = response.data.items[0].contentDetails.duration;
    return parseISO8601Duration(duration);
  } catch (error) {
    console.error('Error fetching video duration:', error);
    return 10; // Fallback auf 240 Sekunden (4 Minuten)
  }
}

function parseISO8601Duration(duration) {
  const match = duration.match(/PT(\d+M)?(\d+S)?/);
  const minutes = parseInt(match[1] || '0', 10);
  const seconds = parseInt(match[2] || '0', 10);
  return (minutes * 60) + seconds;
}

async function sendSelectedSong() {
  try {
    const totalGames = musicData.length;

    // Wenn alle Spiele in der Runde gespielt wurden, zurücksetzen
    if (playedSongs.length === totalGames) {
      console.log('All games have been played in this round.');
      playedSongs = []; // Zurücksetzen der gespielten Spiele für die nächste Runde
    }

    let selectedGame;
    let isUniqueGame = false;

    // Wähle ein Spiel, das in dieser Runde noch nicht gespielt wurde
    while (!isUniqueGame) {
      const randomGameIndex = Math.floor(Math.random() * musicData.length);
      selectedGame = musicData[randomGameIndex];

      if (!playedSongs.includes(selectedGame.name)) {
        playedSongs.push(selectedGame.name); // Füge das Spiel zur Liste der gespielten Spiele hinzu
        isUniqueGame = true;
      }
    }

    // Wähle einen zufälligen Song aus dem ausgewählten Spiel
    const randomSongIndex = Math.floor(Math.random() * selectedGame.songs.length);
    const selectedSongData = selectedGame.songs[randomSongIndex];
    const songId = `${selectedGame.name}_${selectedSongData.link}`;

    const videoDuration = await getVideoDuration(selectedSongData.link);
    const maxStartTime = videoDuration - 30; // 30 Sekunden vor Ende
    const startTime = Math.floor(Math.random() * maxStartTime);

    const selectedSong = {
      video: `https://www.youtube.com/embed/${selectedSongData.link}?start=${startTime}&autoplay=1&showinfo=0&loop=1`,
      currentGame: selectedGame,
      currentSong: selectedSongData
    };

    console.log(selectedSong.video);
    io.emit('gameStarted', selectedSong, maxRounds);
  } catch (error) {
    console.log('Error in sendSelectedSong:', error);
  }
}

function resetPlayedSongs() {
  try {
    playedSongs = [];
  } catch (error) {
    console.log('Error in resetPlayedSongs:', error);
  }
}

function updateConnectedClients() {
  try {
    io.emit('updateClients', clients);
  } catch (error) {
    console.log('Error in updateConnectedClients:', error);
  }
}

function startTimer() {
  try {
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
          setTimeout(() => {
            announceWinner();
          }, 500);
        }
      }
    }, 1000);
  } catch (error) {
    console.log('Error in startTimer:', error);
  }
}

function announceWinner() {
  try {
    const allPoints = clients.map(client => client.points);
    const maxPoints = Math.max(...allPoints);
    const winners = clients.filter(client => client.points === maxPoints);
    io.emit('winnerAnnounced', winners);
  } catch (error) {
    console.log('Error in announceWinner:', error);
  }
}

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('setUsername', (username, selectedSkin) => {
    try {
      const skin = selectedSkin || "https://raw.githubusercontent.com/Eder03/vmq_skins/main/skins/1.gif";
      clients.push({ id: socket.id, username: username, points: 0, skin: skin });
      updateConnectedClients();
    } catch (error) {
      console.log('Error in setUsername:', error);
    }
  });

  socket.on('disconnect', () => {
    try {
      console.log('Client disconnected');
      clients = clients.filter(client => client.id !== socket.id);
      updateConnectedClients();
    } catch (error) {
      console.log('Error in disconnect:', error);
    }
  });

  socket.on('startGame', async () => {
    try {
      console.log('start game');
      currentRound = 0;

      const res = await axios.get('https://vmq.onrender.com/getAll');
      musicData = res.data;

      resetPlayedSongs();
      sendSelectedSong();
      startTimer();
    } catch (error) {
      console.log('Error in startGame:', error);
    }
  });

  socket.on('sendPoints', ({ points }) => {
    try {
      const clientId = socket.id;
      const clientIndex = clients.findIndex(client => client.id === clientId);
      if (clientIndex !== -1) {
        clients[clientIndex].points = points;
        io.emit('updatePoints', clients);
      }
    } catch (error) {
      console.log('Error in sendPoints:', error);
    }
  });

  socket.on('loadNextSong', () => {
    try {
      sendSelectedSong();
      startTimer();
    } catch (error) {
      console.log('Error in loadNextSong:', error);
    }
  });

  socket.on('sendWinner', (winner) => {
    try {
      io.emit('winnerAnnounced', winner);
    } catch (error) {
      console.log('Error in sendWinner:', error);
    }
  });

  socket.on('userGuess', ({ username, guess, isCorrect }) => {
    try {
      io.emit('updateGuesses', { username, guess, isCorrect });
    } catch (error) {
      console.log('Error in userGuess:', error);
    }
  });

  socket.on('resetGameAndPoints', () => {
    try {
      io.emit('resetGameState');
      io.emit('resetPoints');
    } catch (error) {
      console.log('Error in resetGameAndPoints:', error);
    }
  });

  socket.on('startGameAndHideButton', () => {
    try {
      io.emit('hideStartButton');
    } catch (error) {
      console.log('Error in startGameAndHideButton:', error);
    }
  });

  socket.on('sendMessage', (message) => {
    try {
      io.emit('receiveMessage', message);
    } catch (error) {
      console.log('Error in sendMessage:', error);
    }
  });
});
