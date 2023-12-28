import React from 'react';
import ReactDOM from 'react-dom/client';
import "./Container.css";
import gitLogo from "../github.png";

export default function Container() {
    return(
        <div>
            
            <Header/>
            <div><h2>Hello!</h2></div>
            <Footer/>
        </div>
    )
}


function Header(){
    return(
        <div className='commonHeaderFooter header'>
            <h1 className='game_title'>Estimathon!</h1>
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