
// button click: actively retrieves new card
async function updateJudgeCard() {


    // open database
    const db = firebase.firestore();

    // before we enter a loop, make sure there's at least one new card
    // make sure cards are available
    let incrementorPath = db.collection('incrementors').doc('judgeCardsIncrementor')
    let judgeCards = db.collection('judgeCards');
    await cardsRemaining(incrementorPath, judgeCards)




    // on click, get new judge card --> write document ID to incrementor list so we can read that to everyone
    let dbCards = await judgeCards.where('isUsed', '==', false).limit(1).get()
    // start loop to access document
    dbCards.forEach(card => {




        // copy card's content to the single doc which transiently holds this active content
        let judgeCardContent = card.data().content
        judgeCards.doc('currentJudgeCard').set({
            active_judgeCard: judgeCardContent
        })
        console.log('New judge card assigned in Firestore.')


        // increment current active judge card counter
        let number = 1
        let incrementorLocation = db.collection('incrementors').doc('judgeCardsIncrementor')
        changeCardCount(number, incrementorLocation)


        // mark used to prevent repeat access
        judgeCards.doc(card.id).update({
            isUsed: true
        })



    })
}






// submit card to server --> submit-btn click
async function submitThisCard(submitButton) {

    // get submission text
    let cardContent = submitButton.previousElementSibling.innerText


    // send this submission to the server
    const db = firebase.firestore();
    let submittedCollection = db.collection('submittedCards')

    submittedCollection.add({
        submitted_content: cardContent,
        timestamp: new Date().getTime()
    })

    // after submitting, delete the card
    deleteCard(submitButton)


    // move to submissions view - on submit click
    showSubmissions()

}




// user is judge --> judge-btn click
function userIsJudge() {
    showSubmissions()
}



// view change --> called by judge-btn & submit-btn
function showSubmissions() {
    console.log('View change: submitted cards')
    // show submissions
    document.getElementById('submitted-cards-wrapper').classList.add('reveal-element')
    // hide personal cards
    document.getElementById('local-cards-wrapper').classList.add('hide-element')
}



// reveals custom dev tools --> dev btn click
function devTools() {

    // handle recycle button
    let recycleBtn = document.getElementById('recycle-btn')
    if (recycleBtn.style.display == 'none') {
        recycleBtn.style.display = 'block'
    } else {
        recycleBtn.style.display = 'none'
    }
}