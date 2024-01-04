import React from 'react';
import { userContext } from '../..';
import "../css/Lobby.css"
import "../css/CreateJoin.css"
import "../css/Container.css"

export default function Lobby(){

    function addTeams(){
        let teamList = [];
        for(let i = 0; i < 6; i ++){
            teamList.push(
                <div className='team' key={i}>
                    <h4 style={{color:"darkslateblue"}}>Team Name</h4>
                    <h4>Team {i+1}: <span>10 members</span></h4>
                    <p style={{fontSize:'12px'}}>Antonio, Ethan, Andres, Josh</p>               
                    <div>
                        <button>ready up</button>
                        <button>join team</button>
                    </div>
                </div>
            )
        }
        return (
            teamList            
        )
    }
    let items = new Array(10);
    return(
            <div className='column'>
                <h2><span style={{fontSize:"40px", fontWeight:"bold", margin: 0}}>Party ID: QXYZDE</span></h2>
                <h3 style={{color:"black"}}>(25 questions. Duration: 20 minutes)</h3>

                <div className='buttons_row'>
                    <button className='button_numb_questions'>ADD A TEAM</button>
                    <button className='button_numb_questions'>START GAME</button>
                </div>
               
                <div className='teams_container'>
                    {addTeams()}
                </div>
            </div>
    )
}