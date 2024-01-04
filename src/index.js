// React imports 
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useState, createContext } from 'react';

// Util imports
import { User } from "./util/User";

// CSS imports
import './index.css';
import "./pages/css/Container.css";

// Internal components imports
import CreateJoin from './pages/js/CreateJoin';
import Header from './components/Header'
import Footer from './components/Footer'
import AskVerify from './pages/js/AskVerify'
import LoginForm from './pages/js/LoginForm'
import Game from './pages/js/Game';
import Lobby from './pages/js/Lobby';

// Firebase imports and initialization
const { getAuth, onAuthStateChanged } = require ("firebase/auth");
const { initializeApp} = require('firebase/app');
const firebaseConfig = {
  apiKey: "AIzaSyClxxLL9qH2rM5h69I-_kncLqvArhjmC-w",
  authDomain: "estimathon1108.firebaseapp.com",
  databaseURL: "https://estimathon1108-default-rtdb.firebaseio.com",
  projectId: "estimathon1108",
  storageBucket: "estimathon1108.appspot.com",
  messagingSenderId: "502153014712",
  appId: "1:502153014712:web:308f48d0eef2a404f1734d",
  measurementId: "G-9WH4LD63LC"
};
initializeApp(firebaseConfig);

export const userContext = createContext();
export const gameContext = createContext();
export const pageContext = createContext();

function App(){
  const [user, setUser] = useState();
  const [curComponent, changeComponent] = useState("CREATEJOIN");
  const [curGame, changeGame] = useState(); // curGame is an array of an "infoInput" object and a "party" object

  async function onSignInStatusChange(newUser){
    if(newUser){
      if(!user || (newUser.uid !== user._uid)){
        let myUser = new User({});
        await myUser.initializeUser();
        setUser(myUser);
      }
    }
    else{
      if(user){
        setUser(newUser);
      }
    }


    let newScreen;
    if(user){
      console.log(curGame)
      if(!user._emailVerified){
        newScreen = "ASKVERIFY";
      }
      else if(user._userInGame){
        newScreen = "GAME";
      }
      else if(curGame){
        if(curGame.infoInput){
          newScreen = "LOBBY";
        }
      }
      else{
        newScreen = "CREATEJOIN";
      }
    }
    else if(curComponent !== "LOGINFORM" && curComponent !== "CREATEJOIN"){
      newScreen = "LOGINFORM";
    }
    
    if(newScreen && newScreen !== curComponent){
      changeComponent(newScreen);
    }
    else if(!curComponent){
      changeComponent("CREATEJOIN")
    }
  }

  // Handle auth changes -- Ensures that "signedIn" and "user" is always up to date
  onAuthStateChanged(getAuth(), async (newUser) => {
    await onSignInStatusChange(newUser);
  });
  
  useEffect(
    () => {
      console.log(curComponent)
    },
    [curComponent]
  )


  return(
    <div className='container'>
      <pageContext.Provider value = {[curComponent, changeComponent]}>
        <gameContext.Provider value = {[curGame, changeGame]}>
          <userContext.Provider value = {[user, setUser]}>
            <Header/>

              <div>
                {
                  {
                    "CREATEJOIN": <CreateJoin/>,
                    "LOBBY":      <Lobby/>,
                    "GAME":       <Game/>,
                    "ASKVERIFY":  <AskVerify/>,
                    "LOGINFORM":  <LoginForm/>
                  }[curComponent]
                }
              </div>

            <Footer/>
          </userContext.Provider>
        </gameContext.Provider>
      </pageContext.Provider>

    </div>

  )

}


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <App/>
);