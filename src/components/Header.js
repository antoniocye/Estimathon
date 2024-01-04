import React from 'react';
import { useContext } from 'react';
import { userContext, pageContext } from '..';

export default function Header(){
    const [user, setUser] = useContext(userContext);
    const [curComponent, changeComponent] = useContext(pageContext);

    return(
        <div className='commonHeaderFooter header'>
            <h1 onClick={() => { changeComponent("CREATEJOIN") }} className='game_title'>Estimathon!</h1>
            {
                !user && curComponent === "CREATEJOIN" &&
                <div>
                    <button onClick={ () => { changeComponent("LOGINFORM") } } className='login_button'>Login Now!</button>
                </div>  
            }
            {
                user 
                
                && 
                
                <div>
                    <h3>Signed in as '{ user._name }' { user._emailVerified ? ":)" : "(unverified user)"}</h3> 
                    <button onClick={ async () => {await user.signOutUser();}} className='logout_button'>Logout here...</button>
                </div>  
             }
            
        </div>
    )
}

