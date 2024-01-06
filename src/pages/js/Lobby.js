import { React, useContext, useState, useEffect } from 'react';
import { gameContext, pageContext, userContext } from '../..';
import "../css/Lobby.css"
import "../css/CreateJoin.css"
import "../css/Container.css"
import backArrow from "../../arrow.png"
import EstimathonParty from '../../util/EstimathonParty';
import LoadingIcons from 'react-loading-icons'


export default function Lobby(){

    const [curGame, changeGame] = useContext(gameContext);
    const [curComponent, changeComponent] = useContext(pageContext);
    const [user, setUser] = useContext(userContext);

    const [gameId, changeGameId] = useState("");
    const [qsPerTeam, changeQsPerTeam] = useState(25);

    const [overlayStatus, changeOverlayStatus] = useState(false);


    useEffect(
        () => {
            async function doStuff(){
                let myGame;
                let infoInput;
                if(!curGame && !user._userInLobby){
                    changeComponent("CREATEJOIN");
                }
                else{
                    console.log(user._userRef, "userRef")

                    if(curGame && curGame.hasOwnProperty("infoInput")){ // This checks whether inputed info from the user was given by the previous screen
                        console.log("here")

                        try{ // Trying to create the game and see if it's okay
                            infoInput = curGame.infoInput;
                            if(infoInput.partyId !== ""){
                                myGame = new EstimathonParty({partyId: infoInput.gameId})
                            }
                            else if(infoInput.numbQuestions !== 0){
                                myGame = new EstimathonParty({numbQuestions: infoInput.numbQuestions, attemptsPerTeam: qsPerTeam});
                            }
        
                            await myGame.initializeParty();
                        }
                        catch(error){
                            console.error(error);
                            window.alert("There was an error creating this party. Try again!");
                            changeGame({
                                infoInput: null,
                                game: null
                            });
                            changeComponent("CREATEJOIN");
                            return;
                        }

                        if((curGame.hasOwnProperty("game") && myGame._partyId != curGame.game._partyId) || !curGame.hasOwnProperty("game")){
                            changeGame({
                                infoInput: infoInput,
                                game: myGame
                            });
                        }
                        
                        await user.userConnectToNewLobby(myGame._partyId);
                    }
                    else if(user._userInLobby){
                        console.log("here2")

                        try{
                            myGame = new EstimathonParty({partyId: user._curGameId});
                            await myGame.initializeParty();
                            console.log(myGame)
                        }
                        catch(error){
                            console.error(error);
                            window.alert("There was an error joining this party. Try again!");
                            user.setDefaultUserDataOnRealtimeDB();
                            changeComponent("CREATEJOIN");
                            return;
                        }
                        changeGame({
                            game: myGame
                        });
                        console.log(curGame, "curGame")

                                                
                    }
                }
            }
            doStuff();
            
        },
        []
    )

    useEffect(
        () => {
            if(curGame && curGame.hasOwnProperty("game")){
                changeGameId(curGame.game._partyId);
                changeQsPerTeam(curGame.game._numbQuestions + 5)
            }
        },
        [curGame]
    )

    useEffect(() => {
        if(gameId){
            document.getElementById('numbQuestions').value = qsPerTeam;
        }
        
      }, [qsPerTeam]); 

    function updateQsPerTeam(qs){
        if(qs >= curGame.game._numbQuestions && qs <= (curGame.game._numbQuestions * 3)){
            changeQsPerTeam(qs);
        }
    }

    function addTeams(){
        let teams = curGame.game._listTeams;
        let teamDivs = [];

        if(!teams || teams.length < 1){

        }
        else{
            for(let i = 0; i < 10; i ++){
                teamDivs.push(
                    <div className='team' key={i}>
                        <h4 style={{color:"darkslateblue"}}>Team Name</h4>
                        <h4>Team {i+1}: <span>10 members</span></h4>
                        <p style={{fontSize:'12px'}}>Antonio, Ethan, Andres, Josh</p>               
                        <div>
                            <button>Ready up</button>
                            <button>Join team</button>
                        </div>
                    </div>
                )
            }
        }
        return (
            teamDivs.length > 0 ?
            <div className='teams_container'>
                teamDivs   
            </div> :
            <div style={{height:"230px", display:"flex", alignItems:"center"}}>
                <h2>No teams yet! Add them to start the fun :)</h2>
            </div>     
        )
    }
    let items = new Array(10);
    return(
            <div className='column'>

                {
                    ( gameId !== "") ?
                    
                    <>

                        <div>
                            <img alt='Back Arrow' style={{width:"50px", position:"absolute", left:"50px", top:"170px"}} 
                            onClick={async () => {
                                await user.userLeaveLobby();
                                changeGame();
                                changeComponent("CREATEJOIN");
                                }} 
                            src={backArrow}/>
                        </div>
                        <h2><span style={{fontSize:"40px", fontWeight:"bold", margin: 0}}>Party ID: {gameId}</span></h2>

                        <div className='info'>
                            <div className='questions border'>
                                <h3 style={{color:"black"}}>{curGame && curGame.game._numbQuestions} questions. Duration: {curGame && (curGame.game._totalDuration / 60)} minutes</h3>
                            </div>

                            <div className='questions border'>
                                <h3 style={{color:"black"}}>Attempts per team: </h3>

                                <div className='action_questions'>
                                    <input id="numbQuestions" className='numb_questions' defaultValue={qsPerTeam} readOnly ></input>
                                    <div>
                                        <button type='button' onClick={() => {updateQsPerTeam(qsPerTeam-1)}} className='button_numb_questions'>-</button>
                                        <button type='button' onClick={() => {updateQsPerTeam(qsPerTeam+1)}} className='button_numb_questions'>+</button>
                                    </div>
                                </div>
                                
                                
                            </div>

                        </div>


                        <div className='buttons_row'>
                            <button className='button_numb_questions' onClick={() => {changeOverlayStatus(!overlayStatus)}}>ADD A TEAM</button>
                            <button className='button_numb_questions'>START GAME</button>
                        </div>
                    
                        {addTeams()}

                        {overlayStatus && <GetTeamInfo changeOverlayStatus={ changeOverlayStatus }/>}
                    </> :

                    <LoadingIcons.Bars strokeWidth={"50px"} fill='darkslateblue'  />

                }
            </div>
    )
}



const GetTeamInfo = ({ changeOverlayStatus }) => {
  const [teamName, setTeamName] = useState('');
  const [joinStatus, setJoinStatus] = useState(false);

  const handleSubmit = () => {

    // Validate form fields if needed
    // Submit the form data
    //onSubmit({ teamName, teamDescription });
    // Close the overlay
    //onClose();
  };

  return (
    <div className="overlay-container">
      <div className="overlay-content">
        <h2>Add a New Team</h2>
        <label>
          Team Name:
          <input
            type="text"
            value={teamName}
            onChange={(e) => {setTeamName(e.target.value)}}
          />
        </label>
        <label>
          Join this team:
          <input type='checkbox' onChange={(e) => {
            setJoinStatus(e.target.checked);
        }}/>
        </label>
        <div className="button-container">
          <button onClick={handleSubmit}>Create Team</button>
          <button onClick={() => {changeOverlayStatus(false)}}>Cancel</button>
        </div>
      </div>
    </div>
  );
};