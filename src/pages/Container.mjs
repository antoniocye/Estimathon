import React from 'react';
import ReactDOM from 'react-dom/client';
import "./Container.css";
import gitLogo from "../github.png";
import { set } from 'firebase/database';
import { useState } from 'react';

import User from '../util/User.cjs';

export default function Container({ signedIn, setSignedInStatus }) {
    return(
        <div className='container'>
            
            <Header signedIn = {signedIn} setSignedInStatus = {setSignedInStatus} />

            <div>
                {
                    signedIn?
                    <div><h2>normal block to be shown</h2></div>:
                    <LoginForm setSignedInStatus = {setSignedInStatus} />
                }
            </div>
            
            <Footer/>
        </div>
    )
}


function Header({ signedIn, setSignedInStatus}){
    return(
        <div className='commonHeaderFooter header'>
            <h1 className='game_title'>Estimathon!</h1>
            {
                !signedIn ? 
                
                <div>
                    <h3>Connected as 'Antonio'</h3> 
                    <button className='logout_button'>Logout here...</button>
                </div>
                :
                <button className='login_button'>Login Now!</button>
                
             }
            
        </div>
    )
}


function Footer(){
    return(
        <div className='commonHeaderFooter footer'>
            <h3>Code and design by Antonio Kambiré</h3>
            <div className='git_cont'>
                <h3>Check out on</h3>
                <a
                href='https://github.com/antoniocye/Estimathon'
                target='_blank'
                >
                    <img className="git_logo" src={gitLogo}/>
                </a>
            </div>
        </div>
    )
}

function LoginForm({setSignedInStatus}){
    const [errorEmail, setErrorEmail] = useState("(required)");
    const [errorPassword, setErrorPassword] = useState("(required, 6 characters minimum)");
    const [errorUsername, setErrorUsername] = useState("(required only if creating new account");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function loginUser(){
        if(email === ""){
            setErrorEmail("Error: The email address should not be empty!");
        }
        if(password === ""){
            setErrorPassword("Error: The password should not be empty!");
        }
        else if(email !== ""){
            if(password.length < 6){
                setErrorPassword("Error: The password should contain more than 6 characters");
            }
            if(!isValidEmail(email)){
                setErrorEmail("Error: The email address is not in the correct format")
            }
            else if(password.length > 6){
                console.log(User);
                console.log(Object.prototype.toString.call(User))
                let user = new User({email, password});
                setSignedInStatus(true);
                console.log(user);
            }
        }
    }

    return(
        <div className='login_form_container'>
            <div className='login_form'>
                <div className='login_title'>
                    <h2>Login</h2>
                    <h4>Welcome to <span className='estimathon_style'>Estimathon!</span>,</h4>
                    <h4>the Party Game for Nerds</h4>
                </div>

                <div className='login_fields'>
                    <div className='login_field'>
                        <h4>Email Address</h4>
                        <h5>{errorEmail}</h5>
                        <input name='email' autoComplete='email' onChange={(e) => {setEmail(e.target.value)}}></input>
                    </div>
                    <div className='login_field'>
                        <h4>Your swaggy username</h4>
                        <h5>{errorUsername}</h5>
                        <input name ='username' autoComplete='nickname' onChange={(e) => {setUsername(e.target.value)}}></input>
                    </div>
                    <div className='login_field'>
                        <h4>Password</h4>
                        <h5>{errorPassword}</h5>
                        <input name ='password' autoComplete='new-password' onChange={(e) => {setPassword(e.target.value)}}></input>
                    </div>
                </div>

                <button onClick={loginUser}>Hop on!</button>
            </div>
        </div>

    )
}