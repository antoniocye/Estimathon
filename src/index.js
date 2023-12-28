import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Container from './pages/Container.mjs'
import { useState } from 'react';
const { getAuth } = require ("firebase/auth");
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
let user = auth.currentUser;
let isSignedIn = false;

if(user){
  isSignedIn = true;
}


function App(){
  const [signedIn, setSignInStatus] = useState(isSignedIn);

  return(
    <Container signedIn={signedIn} setSignInStatus = {setSignInStatus}/>
  )

}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <App/>
);