import { useState, useEffect, useContext } from 'react';
import { userContext, gameContext, pageContext } from '../..';

export default function CreateJoin() {

    // Handle changes in the current tab, between "Create" and "Join"
    const [isCreate, setIsCreate] = useState(true);

    useEffect(() => {
        let createBtn = document.getElementById("create"); 
        let createDiv = document.getElementById("create_div"); 

        let joinBtn = document.getElementById("join"); 
        let joinDiv = document.getElementById("join_div"); 

        if((isCreate && !createBtn.classList.contains("highlighted_btn")) || (!isCreate && createBtn.classList.contains("highlighted_btn"))){
            createBtn.classList.toggle("highlighted_btn");
            createDiv.classList.toggle("highlight");

            joinBtn.classList.toggle("highlighted_btn");
            joinDiv.classList.toggle("highlight");
        }

      }, [isCreate]); 


    return(
        <div className='cont_to_align'>
            <div className='create_join_container'>
                <div className='create_join_buttons_container'>
                    <div id='create_div'  onClick={() => {setIsCreate(true)}}>
                        <button id='create' className='create_join_btn'>Create a party</button> 
                    </div>
                    <div id='join_div' className='highlight' onClick={() => {setIsCreate(false)}}>
                        <button id='join' className='create_join_btn highlighted_btn'>Join a party</button>
                    </div>
                    
                </div>

                {
                    isCreate ?
                    <Create /> :
                    <Join />
                }
                
            </div>
        </div>
    )
}

function Create(){
    const [numbQuestions, changeNumbQuestions] = useState(10);

    const [curGame, changeGame] = useContext(gameContext);
    const [curComponent, changeComponent] = useContext(pageContext)
    const [user, changeUser] = useContext(userContext);

    useEffect(() => {
        document.getElementById('numbQuestions').value = numbQuestions;
      }, [numbQuestions]); 


    useEffect(
        () => {
            console.log("jhey");
            console.log(curGame)
        },
        [curGame]
    )

    function updateNumberQuestions(numbQs){
        if(numbQs <= 30 && numbQs > 5){
            changeNumbQuestions(numbQs);
        }
    }

    function goToNextPage(){
        changeGame(
            {
                infoInput: {
                    numbQuestions: numbQuestions,
                    partyId: ""
                }
            }
        );
        if(user){
            changeComponent("LOBBY");
        }
        else{
            changeComponent("LOGINFORM")
        }
    }
    return(
        <form 
        onSubmit={(event) => {
            event.preventDefault();
            goToNextPage();
        }}
        className='create_form'>
            <div className='numb_questions_container'>
                <div className='questions_part'>
                    <h4>NUMBER OF QUESTIONS: </h4>
                    <input id="numbQuestions" className='numb_questions' defaultValue={numbQuestions} readOnly ></input>
                </div>
                
                <div>
                    <button type='button' onClick={() => {updateNumberQuestions(numbQuestions+1)}} className='button_numb_questions'>+</button>
                    <button type='button' onClick={() => {updateNumberQuestions(numbQuestions-1)}} className='button_numb_questions'>-</button>
                </div>
                <button type='submit' className='start_game_btn'><h4>START GAME</h4></button>
            </div>
            
            

            <div className='exp_text'>
                <h1>Description:</h1>
                <p>
                    Estimathon is a captivating estimation game that invites players to flex their mental muscles and embrace the thrill of precision guessing. Teams dive into a thought-provoking Question Bank, spanning diverse categories, and collaborate to provide the most accurate estimates. From mathematical challenges to general knowledge queries, Estimathon offers a dynamic and engaging experience. The game's real-time scoring keeps the excitement alive as teams strive to outsmart their opponents. Perfect for game nights, corporate events, or educational settings, Estimathon promises an immersive adventure filled with strategy, teamwork, and, above all, the joy of a well-estimated answer. Gather your team and embark on a journey where intuition meets intellect in the ultimate estimation challenge!
                </p>
            </div>
            
        </form>
    )
}


function Join(){

    const [curGame, changeGame] = useContext(gameContext);
    const [curComponent, changeComponent] = useContext(pageContext)
    const [user, changeUser] = useContext(userContext);

    function afterInputChange(e){
        let value = e.target.value;
        value = value.toUpperCase();
        e.target.value = value;
        let numb = parseInt(e.target.id.slice(-1));
        if(!value){
            if(numb > 1){
                numb -= 1;
                document.getElementById("input" + numb).focus();
            }
        }
        else if(value.match(/[A-Z]/)){
            if(numb < 6){
                numb += 1;
                document.getElementById("input" + numb).focus();
            }
        }
        else{
            e.target.value = "";
        }
    }

    async function joinGame(){
        let gameId = "";
        for(let i = 1; i < 7; i++){
            let valueInput = document.getElementById("input"+i).value;
            if(valueInput){
                gameId += valueInput;
                changeGame(
                    {
                        infoInput: {
                            gameId: gameId,
                            numbQuestions: 0
                        }
                    });

                if(user){
                    changeComponent("LOBBY");
                }
                else{
                    changeComponent("LOGINFORM")
                }
            }
        }
    }
    return (
        <form 
        onSubmit={async (event) => { 
            event.preventDefault();
            await joinGame()} 
        } 
        className='create_form join'>
            <label htmlFor='gameId'>
                <h1>Type a Party ID to join!</h1>
            </label>
            
            <div className="uppercase-input" id="uppercase-input">
                <input onChange={(e) => {afterInputChange(e)}} id="input1" type="text" maxLength="1" pattern="[A-Z]" title="Enter an uppercase letter" required autoFocus></input>
                <input onChange={(e) => {afterInputChange(e)}} id="input2" type="text" maxLength="1" pattern="[A-Z]" title="Enter an uppercase letter" required></input>
                <input onChange={(e) => {afterInputChange(e)}} id="input3" type="text" maxLength="1" pattern="[A-Z]" title="Enter an uppercase letter" required></input>
                <input onChange={(e) => {afterInputChange(e)}} id="input4" type="text" maxLength="1" pattern="[A-Z]" title="Enter an uppercase letter" required></input>
                <input onChange={(e) => {afterInputChange(e)}} id="input5" type="text" maxLength="1" pattern="[A-Z]" title="Enter an uppercase letter" required></input>
                <input onChange={(e) => {afterInputChange(e)}} id="input6" type="text" maxLength="1" pattern="[A-Z]" title="Enter an uppercase letter" required></input>
            </div>
            <button className='start_game_btn' type="submit"><h4>JOIN</h4></button>
        </form>
    )
}