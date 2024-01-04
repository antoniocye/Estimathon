import React from 'react';
import { useState } from 'react';

export default function AskVerify(){
    return (
        <div className='login_form_container'>
            <div className='login_form verify_email '>
                <h1>Email Verification</h1>
                <h2>Hey nerd,</h2>
                <h2>You received a verification message at the email address you provided while creating your account.</h2>
                <h2>Please click on the latest verification link that you received in order to gain access to the platform! (You may need to refresh this page)</h2>
            </div>
        </div>
    )
}