import React from 'react';
import { useState } from 'react';
import { User, emailInUse, resetEmail} from "../../util/User";


export default function LoginForm(){
    const [errorEmail, setErrorEmail] = useState("(required)");
    const [errorPassword, setErrorPassword] = useState("(required, 6 characters minimum)");
    const [errorUsername, setErrorUsername] = useState("(required only if creating new account");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    const [resetPassword, setStatusReset] = useState(false);
    const [emailForPasswordReset, setEmailForPasswordReset] = useState("");
    const [errorResetEmail, setErrorResetEmail] = useState("(required)");

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async function loginUser(){
        if(email === ""){
            setErrorEmail("Error: The email address should not be empty!");
        }
        if(password === ""){
            setErrorPassword("Error: The password should not be empty!");
        }
        else if(email !== ""){
            console.log(await emailInUse(email))

            if(password.length < 6){
                setErrorPassword("Error: The password should contain more than 6 characters");
            }
            if(!isValidEmail(email)){
                setErrorEmail("Error: The email address is not in the correct format");
            }
            else if(password.length >= 6){
                let usernameGood = true;
                if(!(await emailInUse(email))){
                    if(!username || username.length === 0){
                        setErrorUsername("Error: When creating an account, please add a username!");
                        usernameGood = false;
                    }
                    else if(username.length > 15){
                        setErrorUsername("Error: Please keep your username under 15 characters");
                        usernameGood = false;
                    }
                }
                if(usernameGood){
                    try{
                        let myUser = new User({email: email, password: password, username: username});
                        await myUser.initializeUser();
                    }
                    catch(error){
                        window.alert("Wrong credentials. Please try again.")
                    }
                }
            }
        }
    }

    async function sendPasswordResetEmail(email){
        if(email === ""){
            setErrorResetEmail("Error: The email address should not be empty!");
        }
        else if(!isValidEmail(email)){
            setErrorResetEmail("Error: The email address is not in the correct format");
        }
        else{
            if(await emailInUse(email)){
                try{
                    resetEmail(email);
                    setStatusReset(false);
                    alert("Reset email sent! Please log in with your new credentials.")
                }
                catch(error){
                    setErrorResetEmail("Error: There was an error sending the reset email. Please try again.")
                }
            }
            else{
                setErrorResetEmail("There was an error sending the reset email. Are you sure this email is linked to an account?")
            }
        }
    }

    return(
        <div className='login_form_container'>
            
            { resetPassword ?

                <form 
                    onSubmit={async (event) => { 
                        event.preventDefault();
                        await sendPasswordResetEmail(emailForPasswordReset)} 
                    } 
                    className='login_form'>

                    

                    <div className='login_title'>
                        <h2>Reset your password</h2>
                    </div>

                    <div className='login_fields'>
                        <div className='login_field'>
                            <h4>Email Address</h4>
                            <h5>{errorResetEmail}</h5>
                            <input name='email' autoComplete='email' onChange={(e) => {setEmailForPasswordReset(e.target.value)}}></input>
                        </div>
                    </div>
                    <button type='submit'>Send reset email!</button>
                    
                </form>

                :

                <form 
                    onSubmit={async (event) => { 
                        event.preventDefault();
                        await loginUser()} 
                    } 
                    className='login_form'>

                    

                    <div className='login_title'>
                        <h2>Login to Join the Fun!</h2>
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
                            <div className='password'>
                                <input type='password' id='password' name ='password' autoComplete='new_password' onChange={(e) => {setPassword(e.target.value)}}></input>
                                <input
                                 type='checkbox' 
                                    onClick={(e) => {
                                        let passwordElem = document.getElementById("password");
                                        if(e.target.checked){
                                            passwordElem.type = "text";
                                        }
                                        else{
                                            passwordElem.type = "password"
                                        }
                                    }} 
                                    className='password_visibility_checkbox'></input>
                            </div>
                            
                        </div>
                    </div>
                    <span onClick={() => {setStatusReset(true)}} className='reset'>(Or reset password here)</span>
                    <button type='submit'>Hop on!</button>
                    
                </form>
            }
        </div>

    )
}