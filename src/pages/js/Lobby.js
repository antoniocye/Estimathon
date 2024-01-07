import { React, useContext, useState, useEffect } from 'react';
import { gameContext, pageContext, userContext } from '../..';
import "../css/Lobby.css"
import "../css/CreateJoin.css"
import "../css/Container.css"
import backArrow from "../../arrow.png"
import closeTeam from "../../close.png"
import EstimathonParty from '../../util/EstimathonParty';
import LoadingIcons from 'react-loading-icons'


export default function Lobby(){

    const [curGame, changeGame] = useContext(gameContext);
    const [curComponent, changeComponent] = useContext(pageContext);
    const [user, setUser] = useContext(userContext);

    const [gameId, changeGameId] = useState("");
    const [qsPerTeam, changeQsPerTeam] = useState(25);

    const [overlayStatus, changeOverlayStatus] = useState(false); // A boolean
    const [teamMemberNames, changeTeamMemberNames] = useState([]); // An array of strings
    const [teamJoined, changeTeamJoined] = useState(); // An integer index
    const [forceReRender, changeForceRerender] = useState(1) // Dummy state to force rerender of effects depending on it when I need to

    // Here we properly instanciate EstimathonParty objects needed to display the lobby
    // Ran once after render

    useEffect(
        () => {
            async function doStuff(){
                let myGame;
                let infoInput;
                if(!curGame && !user._userInLobby){
                    changeComponent("CREATEJOIN");
                }
                else{
                    if(curGame){
                        if(!curGame.game && curGame.hasOwnProperty("infoInput")){ // This checks whether inputed info from the user was given by the previous screen
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
                    }
                    else if(user._userInLobby){
                        try{
                            myGame = new EstimathonParty({partyId: user._curGameId});
                            await myGame.initializeParty();
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
                    }
                }
            }

            doStuff();
        },
        []
    )

    // Here we take care that updates in team members names and gameIds are properly synced up
    // whenever the Game changes

    useEffect(
        () => {
            if(curGame && curGame.hasOwnProperty("game")){
                async function doStuff(){
                    let allTeamNamesTemp = [];

                    for (let p = 0; p < curGame.game._listTeams.length; p++) {
                        const team = curGame.game._listTeams[p];
                        let forThisTeam = "";
                
                        for (let i = 0; i < team._members.length; i++){
                            const memberId = team._members[i];
                            if(memberId === user._uid){
                                changeTeamJoined(p);
                            }
                            forThisTeam += await user.findNameFromId(memberId);
                            if(i !== (team._members.length-1)){
                                forThisTeam += ",";
                            }
                        }

                        allTeamNamesTemp.push(forThisTeam);
                    }
                    changeTeamMemberNames(allTeamNamesTemp);
                }

                doStuff();
                
            }
        },
        [curGame, teamJoined, forceReRender]
    )

    useEffect(() => {
        if(curGame && curGame.hasOwnProperty("game")){
            if(gameId !== curGame.game._partyId){
                changeGameId(curGame.game._partyId);
            }
        }
    }, [curGame])

    useEffect(() => {
        if(curGame && curGame.hasOwnProperty("game")){
            changeQsPerTeam(curGame.game._numbQuestions + 5);
        }
    }, [curGame && curGame.hasOwnProperty("game")])

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


    // This constructs one team!

    function OneTeam({teams, i}){
        const [error, changeError] = useState();
        async function joinTeam(i){
            if(!(teamJoined && teamJoined !== -1 && teams[teamJoined]._isReady)){
                for(let j = 0; j < teams.length; j++){
                    if(j != i){
                        if(teams[j]._members.includes(user._uid)){
                            await teams[j].removeMember(user._uid);
                        }
                    }
                    else{
                        if(!teams[j]._members.includes(user._uid)){
                            await teams[j].addMember(user._uid);
                        }
                    }
                }
                changeTeamJoined(i);
            }
        }

        async function leaveTeam(i){
            await teams[i].removeMember(user._uid);
            changeTeamJoined();
        }

        return (
            <div className={teamJoined === i ? 'team joined' : 'team'}>
                <img alt={'Close Team Number ' + i} 
                className='close_team'

                    onClick={async () => {
                        await curGame.game.removeTeam(i);
                        
                        if(teamJoined > i){
                            changeTeamJoined(teamJoined-1);
                        }
                        else if(teamJoined === i){
                            changeTeamJoined(-1);
                        }
                        else{
                            changeForceRerender(forceReRender+1);
                        }
                    }}
                    src={closeTeam}/>

                <h4 style={{color:"darkslateblue"}}>{teams[i]._name}</h4>
                <h4>Team {i+1}: <span>{teams[i]._members.length} {teams[i]._members.length > 1 ? "members" : "member"} </span></h4>
                <p style={{fontSize:'12px'}}>{teamMemberNames[i]}</p> 
                <p style={{fontSize:'12px', color:"red"}}>{error}</p>              
                <div>

                    {
                        
                        teams[i]._isReady ?

                        <button style={{backgroundColor:"red"}}
                            onClick={async () => {
                                await teams[i].unReady();
                                changeForceRerender(forceReRender+1);
                            }
                        }>
                            Ready!
                        </button>

                        :

                        <button 
                            onClick={async () => {
                                if(teams[i]._members.length > 0){
                                    await teams[i].readyUp();
                                    changeForceRerender(forceReRender+1);
                                }
                                else{
                                    changeError("Can't readyUp a team with no members!")
                                }
                            }
                        }>
                            Ready up
                        </button>

                    }

                    {
                    
                        teamJoined === i ?

                        <button style={{backgroundColor:"red"}}
                            onClick={async () => {
                                if(!teams[i]._isReady){
                                    await leaveTeam(i);
                                }
                            }
                        }>
                            Leave team
                        </button>

                        :

                        <button
                            onClick={async () => {
                                if(!teams[i]._isReady){
                                    await joinTeam(i);
                                }
                            }
                        }>
                            Join team
                        </button>

                    }
                    
                </div>
            </div>
        )
    }

    // This constructs the "list of teams" part of the lobby

    function Teams(){
        let teams = curGame.game._listTeams;
        let teamDivs = [];

        

        if(teams && teams.length > 0){
            for(let i = 0; i < teams.length; i ++){
                let error = "";


                teamDivs.push(
                    <OneTeam key={i} teams = {teams} i = {i}/>
                )
            }
        }
        return (
            teamDivs.length > 0 ?
            <div className='teams_container'>
                { teamDivs }
            </div> :
            <div style={{height:"230px", display:"flex", alignItems:"center"}}>
                <h2>No teams yet! Add them to start the fun :)</h2>
            </div>     
        )
    }


    // Main return for lobby!

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
                            <button className='button_numb_questions'
                            onClick={() => {
                                let weGood = true;
                                for(let team of curGame.game._listTeams){
                                    if(!team._isReady){
                                        weGood = false;
                                    }
                                }
                                if(weGood){
                                    changeComponent("GAME");
                                }
                                else{
                                    window.alert("Please make sure all teams are ready before the start of the game!");
                                }
                            }}
                            >START GAME</button>
                        </div>
                    
                        <Teams/>

                        {overlayStatus && <GetTeamInfo changeOverlayStatus={ changeOverlayStatus } changeTeamJoined={ changeTeamJoined }/>}
                    </> :

                    <LoadingIcons.Bars strokeWidth={"50px"} fill='darkslateblue'  />

                }
            </div>
    )
}



const GetTeamInfo = ({ changeOverlayStatus, changeTeamJoined }) => {
    const [curGame, changeGame] = useContext(gameContext);
    const [teamName, setTeamName] = useState('');
    const [error, changeError] = useState();
    const [joinStatus, setJoinStatus] = useState(false);
    const [user, setUser] = useContext(userContext);


    function validate(){
        if(teamName && teamName.length > 0){
            if(teamName.length < 15){
                return true;
            }
            else{
                changeError("Error: Please keep team name under 15 characters");
            }
        }
        else{
            changeError("Error: The proposed team name is empty");
        }
        return false;
    }

    async function createTeam(){

        if(validate()){
            let teamResult = await curGame.game.addTeam(teamName);
            if(teamResult != false){ // please look at the addTeam function before changing this
                if(joinStatus){
                    let teams = curGame.game._listTeams;

                    for(let j = 0; j < (teams.length - 1); j++){
                        if(teams[j]._members.includes(user._uid)){
                            await teams[j].removeMember(user._uid);
                        }
                    }
                    if(!teams[teams.length-1]._members.includes(user._uid)){
                        await teams[teams.length-1].addMember(user._uid);
                    }
                    changeTeamJoined(curGame.game._listTeams.length)
                }
                changeOverlayStatus(false);
            }
            else{
                changeError("The team name is already taken");
            }
        }
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
                autoFocus={true}
                onChange={(e) => {setTeamName(e.target.value)}}
            />
            </label>
            <label>
            Join this team:
            <input type='checkbox' onChange={(e) => {
                setJoinStatus(e.target.checked);
            }}/>
            </label>
            <p style={{color:"red", fontSize:"13px"}}>{error}</p>
            <div className="button-container">
            <button onClick={async () => {await createTeam()}}>Create Team</button>
            <button onClick={() => {changeOverlayStatus(false)}}>Cancel</button>
            </div>
        </div>
        </div>
    );
};