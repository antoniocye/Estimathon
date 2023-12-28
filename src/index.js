import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Container from './pages/Container.js'
import { useState } from 'react';
import { User } from "./util/User";
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
let auth = getAuth();
let user = null;
let isSignedIn = false;


function App(){
  const [signedIn, setSignInStatus] = useState(isSignedIn);

  // Handle auth changes
  onAuthStateChanged(auth, (newUser) => {
    if(newUser){
      isSignedIn = true;
      if(!user || !(newUser.uid === user.uid)){
        user = new User({});
      }
    }
    else{
      isSignedIn = false;
    }
    console.log("isSignedIn", isSignedIn)
    setSignInStatus(isSignedIn)
  });

  return(
    <Container signedIn={signedIn} setSignInStatus = {setSignInStatus} user = { user }/>
  )

}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <App/>
);