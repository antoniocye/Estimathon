import React from 'react';
import gitLogo from "../github.png";
import { useState } from 'react';

export default function Footer(){
    return(
        <div className='commonHeaderFooter footer'>
            <h3>Code and design by Antonio Kambiré</h3>
            <div className='git_cont'>
                <h3>Check out on</h3>
                <a
                href='https://github.com/antoniocye/Estimathon'
                target='_blank'
                rel='noreferrer'
                >
                    <img alt='GitHub Logo' className="git_logo" src={gitLogo}/>
                </a>
            </div>
        </div>
    )
}
