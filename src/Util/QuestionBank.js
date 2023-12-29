const { getDatabase, update, ref, set, push, get, remove} = require('firebase/database');


/*
This class contains methods to accessing the bank of questions for an estimathon game,
and create a set of questions for a specific game.
*/

class QuestionBank{
  _database = "";
  _questionBankRef = "";
  _numbQuestions = 0;

  constructor() {
      this._database = getDatabase();
      this._questionBankRef = ref(this._database, "QuestionBank");
  }

  async initializeQuestionBank(){
    await this.setNumberOfQuestionsFromFirebase();
  }

  async addQuestion(question, answer, time=120) {
    const newQuestion = {
      question: question,
      answer: answer,
      time: time
    };

    const newQuestionRef = push(this._questionBankRef);
    const newQuestionId = newQuestionRef.key;

    set(newQuestionRef, newQuestion)
    .then(() => {
      console.log("Question added to the QuestionBank successfully!");
      console.log("Question ID", newQuestionId);
      console.log(this._numbQuestions);
      this._numbQuestions ++;
      this.updateNumberQuestions(this._numbQuestions)
    })
    .catch((error) => {
      console.error("Error adding the question to the QuestionBank:", error);
    });

    return newQuestionId;
  }


  async removeQuestion(questionId){
    if(questionId.length == 0){
      console.error("The id given is null");
      return;
    }

    const questionRef = ref(this._database, "QuestionBank/" + questionId);
    remove(questionRef)
    .then(() => {
      console.log("Question successfully deleted from QuestionBank");
      this._numbQuestions --;
      this.updateNumberQuestions(this._numbQuestions)
    })
    .catch((error) => {
      console.error("Error occurred while deleting question:", error);
    })
  }

  
  async findQuestion(questionId){
    const questionRef = ref(this._database, "QuestionBank/" + questionId);
    const questionVal = (await get(questionRef)).val();
    if(questionVal != null){
      let quest = {
        questionId: questionId,
        question: questionVal.question,
        answer: questionVal.answer,
        time: questionVal.time,
      };
      return quest;
    }
    else{
      console.error("No question with the corresponding ID found");
    }
  }


  async printAllQuestions(){
    const qBankSnapshot = await get(this._questionBankRef);
    if(qBankSnapshot.exists()){
      const qBankData = qBankSnapshot.val();
      let count = 1;
      for(let questionKey in qBankData){
        if(questionKey != "count"){
          let question = qBankData[questionKey];
          count ++;
        }
      }
    }
    else{
      console.error("This question bank is empty");
    }
  }


  /* This function will build a set of questions from the question bank
    The user provides the number of questions wanted in the set.
    If this number is greater than 30, an error is thrown.
  */
  async buildQuestionSet(setQNumb){
    if(setQNumb < 5){
      console.error("The number of questions in a set should be more than or equal to 5");
    }
    if(setQNumb>30){
      console.error("The number of questions in a set should not exceed 30.");
    }
    else if(setQNumb >= this._numbQuestions){
      console.error("The number of questions requested is too big. It exceeds the number of questions in the Question Bank!");
    }
    else{
      const mySet = new Set();

      while(mySet.size < setQNumb){
        const randomIndex = Math.floor(Math.random() * this._numbQuestions);
        mySet.add(randomIndex);
      }

      let myQuestionSet = new Array();
      let parent  = this._questionBankRef;

      try{
        const snapshot = await get((parent));
        const questionKeys = Object.keys(snapshot.val());
        for (let index of mySet) {
          myQuestionSet.push(questionKeys[index]);
        }
        return myQuestionSet;
      }
      catch(error) {
        console.error("Error occurred while retrieving questions from QuestionBank to build the set:", error)
      }
    }
  }
  
  async updateNumberQuestions(newCount){
    const countRef = ref(this._database, "QuestionBank/count");
    await update(countRef, {value: newCount})
    .then(() => {
      console.log("Count successfully updated:", newCount);
    })
    .catch((error) => {
      console.error("Error occurred while updating count:", error);
    });
  }


  async setNumberOfQuestionsFromFirebase(){
    try {
      let numbQuestions = 0;
      const qBankSnapshot = await get(this._questionBankRef);
      if(qBankSnapshot.exists()){
        const qBankData = qBankSnapshot.val();
        numbQuestions = qBankData.count.value;
      }
      this._numbQuestions = numbQuestions;

    } catch (error) {
      console.error("Error getting number of children:", error);
      throw error;
    }
  }
}

module.exports = QuestionBank;