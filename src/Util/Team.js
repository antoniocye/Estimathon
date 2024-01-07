const { getDatabase, ref, set, push, onValue, get, remove} = require('firebase/database');

class Team{
    _name = "";
    _teamId = "";
    _attemptsLeft = 0;
    _gameId = "";
    _numbQuestionsInSet = 0;
    _isReady;

    _attemptsMatrix = [];
    _attemptsRef = "";

    _membersRef = "";
    _members = [];

    _teamsRef = "";
    _teamRef = "";

    /* If name is non null:
     - Client should check that the name is not taken by an existing team before calling 
     - Both teamId and name should not be null (if name is null, we attempt to find an existing team using the id)
     */

    constructor({name = "", teamId = "", attempts = 0, gameId = "", numbQuestionsInSet = 0, isReady = false}){
        if(gameId === ""){
            throw new Error("No gameId was provided");
        }
        this._database = getDatabase();
        this._gameId = gameId;
        this._teamsRef = ref(this._database, "Games/" + this._gameId+"/Teams");
        this._numbQuestionsInSet = numbQuestionsInSet;
        this._isReady = isReady;

        if(name === ""){
            if(teamId === ""){
                throw new Error("Attempting to find team with empty id");
            }
            else{
                // Here we try to retrieve the information for an existing team from firebase
                this._teamId = teamId;
                this._teamRef = ref(this._database, "Games/" + this._gameId + "/Teams/" + this._teamId);

                try{
                    let teamSnapshot = get(this._teamRef);
                    this._name = teamSnapshot.name.val();
                    this._attemptsLeft = teamSnapshot.attemptsLeft.val();
                }
                catch(error){
                    console.error("Error finding team information", error);
                }
            }
            
        }
        else{
            // Here, we are creating a new team
            this._name = name;
            this._attemptsLeft = attempts;

            this._teamRef = push(this._teamsRef);
            this._teamId = this._teamRef.key;
        }

        this._membersRef = ref(this._database, "Games/" + this._gameId + "/Teams/" + this._teamId + "/Members");
        this._attemptsRef = ref(this._database, "Games/" + this._gameId + "/Teams/" + this._teamId + "/Attempts");
    }


    async initializeTeam(){
        await set(this._teamRef, {
            // send some data to firebase
            isReady: this._isReady,
            attemptsLeft: this._attemptsLeft,
            name: this._name,
        })
        .then(() => {
            // create listener for list of members in the team
            onValue(this._membersRef, (snapshot) => {this.updateMembers(snapshot)});
            onValue(this._attemptsRef, (snapshot) => {this.updateAttempts(snapshot)});
        })
        .catch( (error) => {
            console.error("Error initializing data:", error);
        });
    }


    async updateMembers(snapshot){
        this._members = [];
        snapshot.forEach(childSnapshot => {
            const memberId = childSnapshot.val();
            this._members.push(memberId);
        });
    }


    updateAttempts(snapshot){
        this._attemptsMatrix = new Array();
        snapshot.forEach(childSnapshot => {
            let attemptsForQ = new Array();
            childSnapshot.forEach(attempt => {
                attemptsForQ.push(attempt.val());
            })

            this._attemptsMatrix.push(attemptsForQ);
        });
    }


    async addMember(memberId) {
        try{
            await push(this._membersRef, memberId);
        }
        catch(error){
            console.error('Error adding member:', error);
        }
    }


    async removeMember(memberId) {
        const memberIndex = this._members.indexOf(memberId);
        if (memberIndex !== -1) {
            this._members.splice(memberIndex, 1);

            await set(this._membersRef, this._members)
            .catch((error) => {
                console.error('Error removing member:', error);
            });
        }
    }


    async addAttempt(questionIndex, memberId, attempt) {
        if(this._attemptsLeft > 0){
            // check whether the questionIndex is in bounds and whether the member is allowed to addAttempt
            if (questionIndex >= 0 && questionIndex < this._numbQuestionsInSet) {
                if (!this._members.includes(memberId)) {
                console.error('Member not found in the team.');
                return;
            }
    
            if (!this._attemptsMatrix[questionIndex]) {
                this._attemptsMatrix[questionIndex] = [];
            }
    
            this._attemptsMatrix[questionIndex].push({ memberId, attempt });
    
            await set(this._attemptsRef, this._attemptsMatrix)
            .then( async () => {
                this._attemptsLeft -= 1;
                await set(
                    ref(this._database, "Games/" + this._gameId + "/Teams/" + this._teamId + "/attemptsLeft"), 
                    this._attemptsLeft);
                    
                if(this._attemptsLeft === 0){
                    // TODO: make it known to DOM that we are done with attempts for this team
                }
            })
            .catch((error) => {
                console.error('Error adding attempt:', error);
            });
            } 
            
            else {
                console.error('Invalid question index.');
            }
        }
    }


    getAttemptsForQuestion(questionIndex){
        return this._attemptsMatrix[questionIndex];
    }


    getLastAttempt(questionIndex){
        let allAttemptsForQuestion = this.getAttemptsForQuestion(questionIndex);
        if(allAttemptsForQuestion){
            let numbAttempts = allAttemptsForQuestion.length;
            return allAttemptsForQuestion[numbAttempts-1];
        }
        return 0;
    }

}

module.exports = Team;