const { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, sendEmailVerification, createUserWithEmailAndPassword, updateProfile } = require ("firebase/auth");
const { getDatabase, ref, get, set} = require('firebase/database');


/*
This class contains methods for managing users for an estimathon game

The constructor either signs in or creates a new User instance
    Any client should check:
    1. @password should be at least 6 characters
    2. @email should be in the correct format (obviously non null)
    3. @config should be a standard firebase config with all info needed
    Before passing them on. Otherwise, errors will be thrown.
*/



export async function emailInUse(email){
    let inUse = false;
    try{
        let snapshot = await get(ref(getDatabase(), "Users"))
        if(snapshot.exists()){
            snapshot.forEach( (userSnapshot) => {
                if(email === userSnapshot.val().email){
                    inUse = true;
                }
            });
            
        }
    }
    catch(error){
        console.error(error);
    }
    return inUse;
}


export async function resetEmail(email){
    sendPasswordResetEmail(getAuth(), email)
    .then(() => {
        // Password reset email sent!
        // ..
    });

    // error caught by client
}


    
 export class User{
    _name = "";
    _email = "";
    _auth = "";
    _user = "";
    _uid = "";
    _userInGame = false;
    _userInLobby = false;
    _curGameId = "";
    _curTeamId = "";
    _emailVerified = false;
    _database = "";
    _userRef = "";
    _password = "";

    constructor({email, password, username}){
        // Initialize the DB object
        this._database = getDatabase();

        // Initialize the Auth object
        this._auth = getAuth();
        this._user = this._auth.currentUser;
        this._name = username;
        this._password = password;
        this._email = email;
    }


    async initializeUser(){
        let email = this._email;
        let password = this._password;
        let username = this._name;

        if (!this._user || this._user === null){
            if(email && password){
                try{
                    await this.trySignInUser(email, password, username);
                }
                catch(error){
                    console.error("Error signing user in:", error);
                    throw error;
                }
            }
            else{
                // This is called when onAuthStateChanged automatically attempts initialization but user is undefined
                let error = new Error("Attempting to create user with null email or password");
                console.error(error);
                throw error;
            }
        }

        console.assert(this._user, "Something is wrong: signed in step was passed but user is undefined");

        this._uid = this._user.uid;
        if(!this._userRef){
            this._userRef = ref(this._database, "Users/"+this._uid);
        }

        // The user object has basic properties such as display name, email, etc.
        this._name = this._user.displayName;
        this._email = this._user.email;
        this._emailVerified = this._user.emailVerified;

        // Get the rest of the info from the realtime database
        await this.getUserDataFromRealtimeDB();
    }


    async getUserDataFromRealtimeDB(){
        const userData = (await get(this._userRef)).val();
        if(userData != null){
            this._userInGame = userData.userInGame;
            this._userInLobby = userData.userInLobby;
            this._curGameId = userData.curGameId;
            this._curTeamId = userData.curTeamId;
        }
        else{
            this._userInGame = false;
            this._userInLobby = false;
        }
    }


    async setDefaultUserDataOnRealtimeDB(){
        const userData = {
            email: this._email,
            userInGame: false,
            userInLobby: false,
            curGameId: "0",
            curTeamId: "0"
          };
      
        set(this._userRef, userData)
          .then(() => {
            console.log("Default user data successfully added");
          })
          .catch((error) => {
            console.error("Error adding data to DB:", error);
          });
    }


    async userConnectToNewGame(gameId, teamId){
        const userData = {
            userInLobby: false,
            userInGame: true,
            curGameId: gameId,
            curTeamId: teamId,
            email: this._email,
        };
    
        set(this._userRef, userData)
        .then(() => {
            this._userInLobby = false;
            this._userInGame = true;
            this._curGameId = gameId;
            console.log("User successfully connected to new game with id:", gameId);
        })
        .catch((error) => {
            console.error("Error connecting user to new game:", error);
        });
    }

    async userConnectToNewLobby(gameId){
        const userData = {
            userInLobby: true,
            userInGame: false,
            curGameId: gameId,
            email: this._email,
        };
    
        set(this._userRef, userData)
        .then(() => {
            this._userInLobby = true;
            this._userInGame = false;
            this._curGameId = gameId;
            console.log("User successfully connected to new lobby with id:", gameId);
        })
        .catch((error) => {
            console.error("Error connecting user to new lobby:", error);
        });
    }


    async userLeaveLobby(){
        const userData = {
            userInLobby: false,
            userInGame: false,
            curGameId: "",
            email: this._email,
        };
    
        set(this._userRef, userData)
        .then(() => {
            this._userInLobby = false;
            this._userInGame = false;
            this._curGameId = "";
            console.log("User successfully left lobby");
        })
        .catch((error) => {
            console.error("Error leaving lobby:");
        });
    }


    async trySignInUser(email, password, username) {

        try{
            console.log(await emailInUse(email))
            if(await emailInUse(email)){
                console.log("sign in route")
                await this.signInUser(email, password)
            }
            else{
                console.log("create route")
                await this.createNewUser(email, password, username)
            }
        }
        catch(error){
            throw error;
            // Client should handle this shit on their own or they're fucked
        }
    }
    

    async createNewUser(email, password, username) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this._auth, email, password);
            this._user = userCredential.user;
            await updateProfile(this._user, {displayName: username});
            await sendEmailVerification(this._user);
            this._uid = this._user.uid;
            this._userRef = ref(this._database, "Users/"+this._uid);
            await this.setDefaultUserDataOnRealtimeDB();
        } catch (error) {
            throw error;
        }
    }


    async signInUser(email, password){
        await signInWithEmailAndPassword(this._auth, email, password)
        .then((userCredential) => {
            this._user = userCredential.user;
            this._name = get(ref(this._database, "Users/" + this._user.uid + "/name"));
            console.log("User signed in!");
            if(this._user.emailVerified == false){
                sendEmailVerification(this._user)
                .then(() => {
                    console.log("Email verification sent!");
                    return;
                    // The property "user.emailVerified" tells us whether the email is verified or not
                })
                .catch((error) =>{
                    console.error("There was an error sending the verification email:", error);
                });
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(errorMessage, errorCode);
            throw error;
        });
    }


    async signOutUser(){
        const auth = getAuth();
        await signOut(auth).then(() => {
            // Sign-out successful.
        }).catch((error) => {
            console.log("An error happened while signing out", error);
            throw error;
        });
    }
    
}
