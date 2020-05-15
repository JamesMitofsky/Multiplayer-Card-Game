function showMainGame() {


    hideAllElements()


    console.log('main game view')
    // shows judge & local cards
    let content = document.getElementById('judge-card-wrapper')
    content.classList.add('show-element')
    let newPlayerContainer = document.getElementById('local-cards-wrapper')
    newPlayerContainer.classList.add('show-element')
}

function newUserView() {


    hideAllElements()

    
    console.log('new user view')
    // show intro screen
    let content = document.getElementById('name-form')
    content.classList.add('show-element')
}


function waitingRoomView() {


    hideAllElements()

    
    console.log('waiting room view')
    // show intro screen
    let waitingRoom = document.getElementById('waiting-room')
    waitingRoom.classList.add('show-element')
}


// function gameRoom() {

//     hideAllElements()

//     // show intro screen
//     let judgeCard = document.getElementById('judge-card-wrapper')
//     judgeCard.classList.add('show-element')
// }


// view change --> called by submit-btn or server says user is judge
function showSubmittedCards() {


    hideAllElements()


    console.log('submitted cards view')
    // show judge & submitted
    let judgeCard = document.getElementById('judge-card-wrapper')
    judgeCard.classList.add('show-element')
    let submittedCards = document.getElementById('submitted-cards-wrapper')
    submittedCards.classList.add('show-element')
}





// if elements exist, remove their show property
function hideAllElements() {

    console.log('All elements hidden')

    // new player & subfields
    let nameForm = document.getElementById('name-form')
    if (nameForm) {
        nameForm.classList.remove('show-element')
    }
    let waitingRoom = document.getElementById('waiting-room')
    if (waitingRoom) {
        waitingRoom.classList.remove('show-element')
    }



    // judge card
    let judgeCard = document.getElementById('judge-card-wrapper')
    if (judgeCard) {
        judgeCard.classList.remove('show-element')
    }



    // submissions
    let submittedCards = document.getElementById('submitted-cards-wrapper')
    if (submittedCards) {
        submittedCards.classList.remove('show-element')
    }

    // local cards
    let localCards = document.getElementById('local-cards-wrapper')
    if (localCards) {
        localCards.classList.remove('show-element')
    }
}
