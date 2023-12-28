const QuestionBank = require("./QuestionBank.cjs");
const Team = require("./Team.cjs");

const { getDatabase, ref, set, push, onValue, get, remove} = require('firebase/database');

/*
    Note that in the following, the terms "Party" and "Game" are used interchangeably and pretty much mean the same thing.

    After creating an EstimationParty instance, specifically intialize it by calling initializeParty() and "await" for it to finish
    to ensure proper handling or else errors will be thrown.
*/

class EstimathonParty {
    _status = ""; 
    /*
    _status has the following flag values:
        1. "LIVE" (questions are out and the game is on), 
        2. "LOBBY" (teams are getting created and playing are joining), 
        3. "DEAD" (Game has ended) 
    */

    _listTeams = []; // This is the array of teams competing (their ids). Use Team.cjs utility functions to manipulate
    _numbTeams = 0;
    _numbQuestions = 0;
    _questionSet = []; // This is the array of questions (the ids of the questions). Use QuestionBank.cjs utility functions to manipulate
    _questionBank; // QuestionBank object to manipulate our backend QuestionBank!
    _endTime = ""; // This is a date object that will hold the end time of the game
    _totalDuration = ""; // Total duration, in seconds, of the game
    _attemptsPerTeam = 0;
    _partyId = "";

    // Firebare reference paths
    _allPartiesRef = "";
    _myPartyRef = "";

    _database = "";


    /*
    If @param partyId is not null, it should be made of 6 uppercase letters.
    This constructor will be called for 2 use cases: Creating a new party or joining an existing. The code handles both cases.
    When @param partyId is null, it is assumed that we want to create a new party, otherwise, we attempt to join the game of the given ID
    */
    constructor({partyId = "", numbQuestions, attemptsPerTeam}){
        if(partyId !== "" && !/^[A-Z]{6}$/.test(partyId)){
            throw new Error("The PartyId should be 6 uppercase letters");
        }

        this._numbQuestions = numbQuestions;
        this._attemptsPerTeam = attemptsPerTeam;

        this._database = getDatabase();
        this._allPartiesRef = ref(this._database, "Games");

        this._questionBank = new QuestionBank();
        this._partyId = partyId;
    }


    // Initialize the party. This needs to be specifically calld after creating a Party object to ensure that it's properly initialized
    async initializeParty(){
        await this._questionBank.initializeQuestionBank();

        if(this._partyId === ""){
            this._partyId = await this.createNewPartyId();

            this._questionSet = await this._questionBank.buildQuestionSet(this._numbQuestions);

            this._myPartyRef = ref(this._database, "Games/" + this._partyId);
            this._status = "LOBBY";

            this._totalDuration = await this.findTotalTime(this._questionSet);
            // Add info to database
            await set(this._myPartyRef, 
                {
                    numbTeams: 0, // The default number of teams is 4
                    numbQuestions: this._numbQuestions,
                    questionsSet: this._questionSet,
                    status: this._status,
                    totalDuration: this._totalDuration,
                    attemptsPerTeam: this._attemptsPerTeam,
                }
            )
            .then(() => {
                // TODO: do idk what, or delete if not needed
            })
            .catch((error) => {
                console.error("Error adding info of new party to database:", error);
            });
        }

        else if(await this.partyIdExists(this._partyId)){
            this._myPartyRef = ref(this._database, "Games/" + this._partyId);

            let partySnapshot = await get(this._myPartyRef);
            this._numbTeams = partySnapshot.numbTeams;
            this._numbQuestions = partySnapshot.numbQuestions;
            this._totalDuration = partySnapshot.totalDuration;
            this._attemptsPerTeam = partySnapshot.attemptsPerTeam;

            let allTeamsSnapshot = partySnapshot["Teams"];
            allTeamsSnapshot.forEach(teamSnapshot => {
                let team = new Team(
                    {
                        teamId: teamSnapshot.key,
                        gameId: this._partyId,
                        numbQuestionsInSet: this._numbQuestions,
                    }
                )
                this._listTeams.push(team);
            });

            this._status = getStatus();
        }

        else{
            throw new Error("The partyId given doesn't exist in the database");
        }


        if(this._status == "LIVE"){
            this.checkTheTime();
        }

    }


    async createNewPartyId(){
        // Create a candidate ID
        var candidateId = "";
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            candidateId += characters.charAt(randomIndex);
        }

        // Check if that candidate ID already exists
        if(await this.partyIdExists(candidateId)){
            // If it does, restart from step 1!
            return this.createNewPartyId();
        }
        else{
            // Else, we're good!
            return candidateId;
        }
    }



    async partyIdExists(candidateId) {
        const snapshot = await get(this._allPartiesRef);

        return false;
    }


    // The next functions handle team building / delition logic

    isTeamNameOk(name){
        if(name === ""){
            return false;
        }
        for(let team in this._listTeams){
            if(name === team._name){
                return false;
            }
        }
        return true;
    }


    async addTeam(name){
        if(this.isTeamNameOk(name)){
            let team = new Team ({
                    name: name,
                    gameId: this._partyId, 
                    attempts: this._attemptsPerTeam,
                    numbQuestionsInSet: this._numbQuestions
                }
            );
            await team.initializeTeam();
            this._listTeams.push(team);
            return team;
        }
        return false;
    }


    async removeTeam(team){
        const teamIndex = this._listTeams.indexOf(team);

        if (teamIndex !== -1) {
            this._listTeams.splice(teamIndex, 1);

            let teamRef = team._teamRef;
            await remove(teamRef)
            .catch((error) => {
                console.error("Error removing team:", error);
            });
        }
    }

    
    removeTeamWithName(name){
        for(let team in this._listTeams){
            if(team._name === name){
                this.removeTeam(team);
                return;
            }
        }
        throw new Error("No team found with the given name");
    }


    // Get team given a user id! This is used when a user is logging into a "LIVE" status game
    // @return {Team} team - The team to which the user belongs
    getTeam(uid){
        for(let team in this._listTeams){
            if(team._members.includes(uid)){
                return team;
            }
        }
    }
    

    // The next functions will handle the time / status dynamic of the app
    
    
    // Finds the total time that a party will last by adding up all the durations of individual questions
    async findTotalTime(questionSet){
        let totalTime = 0;
        let qBankRef = ref(this._database, "QuestionBank");
        let snapshot = await get(qBankRef)
        .catch((error) => {
            console.error("Error encountered while finding total game duration:", error);
        });

        for(let i = 0; i < questionSet.length; i++){
            let questionKey = questionSet[i];
            let question = snapshot.child(questionKey).val();
            let time = question.time;
            totalTime += time;
        }
        return totalTime;
    }


    async getStatus(){
        let statusRef = ref(this._database, "Games/" + this.partyId + "/status");
        let status = (await get(statusRef)).val();
        return status;
    }


    async changeStatus(newStatus){
        if(newStatus !== "LOBBY" && newStatus != "LIVE" && newStatus !== "DEAD"){
            throw new Error("Attempting to change game status to non standard value");
        }
        else{
            if(this._status === "DEAD"){
                console.error("Uh, tryna revive the dead?");
            }
            let statusRef = ref(this._database, "Games/" + this.partyId + "/status");
            await set(statusRef, newStatus)
            .then(() => {
                this._status = newStatus;
                if(this._status == "LIVE"){
                    let curTime = new Date();
                    this._endTime = curTime.getSeconds() + this._totalDuration;
                    this.checkTheTime();
                }
            })
            .catch((error) => {
                console.error("Error changing the status on firebase");
            })
        }
    }

    changeDuration(newTime){
        if(this._status == "LOBBY"){
            let durationRef = ref(this._database, "Games/" + this._partyId + "/totalDuration");
            set(durationRef, newTime).then(() => {
                this._totalDuration = newTime;
            }).catch((error) => {
                console.error("Error changing game duration on firebase:", error);
            })
        }
        else{
            throw new Error("Attempting to change time while game is out of lobby");
        }
    }


    checkTheTime(endTime, whenTimeOver) {
        // Once this is called, the time will be checked every second and "whenTimeOver" will be called when endTime is reached
        const intervalId = setInterval(() => {
            const currentTime = new Date();

            if (currentTime >= endTime) {
                whenTimeOver();
                clearInterval(intervalId);
            }
        }, 1000); // checking the time every second
    }
    

    whenTimeOver(){
        changeStatus("DEAD");
    }
    

    start(){
        this.changeStatus("LIVE");
    }


    // Handle points logic

    /*
        @return {number, boolean} - The number of points for this question and whether the question is Answered or not
    */
    async getNumbPointsForQuestion(questionIndex, team){
        let max = 0;
        let min = 0;
        let pointsForQuestion = 0;

        let response = team.getLastAttempt(questionIndex).attempt;
        if(response !== 0){
            let answer = (await this._questionBank.findQuestion(this._questionSet[questionIndex])).answer;
            if(response > answer){
                max = response;
                min = answer;
            }
            else{
                max = answer;
                min = response;
            }

            pointsForQuestion = Math.floor(max / min);
        }

        let isAnswered = (response != undefined && !(response === 0))
        return {points: isAnswered ? response : 0, isAnswered: isAnswered};
    }


    async computeTotalPoints(team){
        let total = 0;
        let numberUnanswered = 0;
        for(let i = 0; i < this._numbQuestions; i++){
            let pointsForQ = await this.getNumbPointsForQuestion(i, team);
            total += pointsForQ.points;
            if(!pointsForQ.isAnswered){
                numberUnanswered ++;
            }
        }
        total += 10;

        total *= Math.pow(2, numberUnanswered - 1);
        return total;
    }

}

module.exports = EstimathonParty;




// ( async () => {
//     let myParty = new EstimathonParty({
//         config: firebaseConfig,
//         numbQuestions: 10,
//         attemptsPerTeam: 15,
//     });

//     await myParty.initializeParty();

//     let team = await myParty.addTeam("TeamUSA!");

//     await team.addMember("antonio");
//     await team.addAttempt(0, "antonio", 50);
//     console.log((await myParty.getNumbPointsForQuestion(0, team)).points);
//     console.log(await myParty.computeTotalPoints(team));
// })()