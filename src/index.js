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
let isSignedIn = false;


function App(){
  const [signedIn, setSignInStatus] = useState(isSignedIn);
  const [user, setUser] = useState(null);

  // Handle auth changes
  onAuthStateChanged(auth, async (newUser) => {
    if(newUser){
      console.log("user in auth state changed", user)
      isSignedIn = true;
      if(!user || (newUser.uid !== user._uid)){
        // Here, the user is already signed in but the User object is not updated so we need to do it!
        let myUser = new User({});
        await myUser.initializeUser();
        setUser(myUser);
      }
    }
    else{
      isSignedIn = false;
    }
    setSignInStatus(isSignedIn)
  });

  return(
    <Container signedIn={signedIn} setSignInStatus = {setSignInStatus} user = { user } setUser = { setUser }/>
  )

}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <App/>
);