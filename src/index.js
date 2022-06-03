import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css';
import reportWebVitals from './reportWebVitals';

import pkg from 'semantic-ui-react/package.json'

import Navbar from "./Navbar";
import Home from "./Sites/Home"
import Game from "./Sites/Game"
import Multiplayer from "./Sites/Multiplayer"
import ApiForm from "./Sites/ApiForm";
import AddSong from "./Sites/AddSong"



// SemanticUI css Einbindung
const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

export default function Routing() {
  return (       
      
   <Router>
     <Navbar />
   <Routes> 
          
          <Route index element={<Home/>} />
          <Route path='/singleplayer' element={<Game />} />
          <Route path='/multiplayer' element={<Multiplayer />} />
          <Route path='/addsong' element={<AddSong />} />
          <Route path='/addgame' element={<ApiForm />}   />
    </Routes>
   </Router>
  );
}

//Elemente werden auf html geladen
ReactDOM.render(
  <React.StrictMode>
    <Routing />
  </React.StrictMode>,
  
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
