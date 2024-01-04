import React from 'react';
import "../css/Game.css"
import "../css/CreateJoin.css"

export default function Game(){

    return(
        <div className='cont_to_align'>
            <div className='create_join_container'>
                <div className='create_join_buttons_container'>
                    <div id='create_div'>
                        <button id='create' className='create_join_btn'>Create a party</button> 
                    </div>
                    <div id='join_div' className='highlight'>
                        <button id='join' className='create_join_btn highlighted_btn'>Join a party</button>
                    </div>
                    
                </div>
                
                <h2>Hello</h2>
                
            </div>
            </div>
    )
}