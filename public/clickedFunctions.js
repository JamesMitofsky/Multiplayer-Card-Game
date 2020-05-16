
// button click: actively retrieves new card
async function newRound() {

    // tell server to choose new judge
    await setJudge()

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
    dbCards.forEach(async card => {

        // push this card to server, which will then trigger update across devices
        let judgeCardContent = card.data().content
        judgeCards.doc('currentJudgeCard').set({
            active_judgeCard: judgeCardContent
        })


        // increment active judgeCard counter
        let incNum = 1
        changeCardCount(incNum, incrementorPath)


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
        // timestamp lets cards be served to devices in order they arrive
        timestamp: new Date().getTime()
    })

    // after submitting, delete card from HTML
    deleteCard(submitButton)


    // move to submissions view - on submit click
    showSubmittedCards()

}




// reveals custom dev tools --> dev btn click
function toggleAdminTools(devButton) {


    // getting siblings according to this super interesting article: https://gomakethings.com/an-es6-way-to-get-all-sibling-elements-with-vanilla-js/
    Array.prototype.filter.call(devButton.parentNode.children, function (sibling) {

        // if the dev button, skip this iteration
        if (sibling == devButton) { return }


        // make the style immediately understandable to if-statement
        let computedStyle = window.getComputedStyle(sibling, null).display

        if (computedStyle == 'none') {
            sibling.style.display = 'block'
        } else {
            sibling.style.display = 'none'
        }
    });
}



function submitNameByEnterKey(event) {
    // if enter key pressed, submit player name
    if (event.keyCode === 13) {
        submitPlayerName()
    }
}


async function submitPlayerName() {

    // get name at time of submit
    let localPlayer = document.getElementById('player-name').value
    // if blank value, don't continue
    if (localPlayer == '') { return false }

    // call server
    let db = firebase.firestore()
    let playerDirectory = db.collection('activePlayers')

    // add player to server --> using merge since this may be first invocation
    playerDirectory.add({
        name: localPlayer,
        waitingTurn: true
    })


    // record name in local storage
    localStorage.setItem('name', localPlayer)


    enterWaitingRoom()
}

function enterWaitingRoom() {

    // apply local name to greetings
    let name = localStorage.getItem('name')
    let greetingPrefixes = [`Howdy, ${name}!`, `What’s kicking, ${name}?`, `Howdy-doody, ${name}!`, `Hey there, ${name}!`, `Hi, ${name}!`, `Ahoy, ${name}!`, `Hiya, ${name}`, `Top of the morning to ya, ${name}!`, ` What’s crack'a lackin', ${name}?`, `GOOOOOD MORNING ${name}!`, `Wassup, ${name}?`, `*Ring, ring* Progresso. Call for ${name}`, `Yo, ${name}!`, `Whaddup, ${name}?`, `Greetings and salutations, ${name}.`, `‘Ello, ${name}.`, `Hiiiii, ${name}!`, `Yoooouhoooo! Fancy seeing you here, ${name}.`, `How you doin’ ${name}?`, `Que pasa, ${name}!`, `Bonjour monsieur ${name}!`, `Good day, ${name}!`, `Whatcha up to, ${name}?`, `Yo ${name}, where ya been?`, `What’s sizzling, ${name}?`, `Comment allez-vous, mon ami, ${name}?`, `Como estas, ${name}?`, `How farest thou, ${name}?`, `How is life sailing, ${name}?`]

    // get random number for greeting index
    min = Math.ceil(0);
    max = Math.floor(greetingPrefixes.length + 1);
    let randomNum = Math.floor(Math.random() * (max - min)) + min; //The minimum is inclusive and the maximum is exclusive 
    let randomGreeting = greetingPrefixes[randomNum]

    // add greeting card
    let greetingElem = document.getElementById('greeting')
    greetingElem.innerText = randomGreeting


    // view change: pre-game
    waitingRoomView()
}

// button click server --> forcing change across devices
function beginGame() {

    setJudge()

    // open database
    const db = firebase.firestore();

    // set game as active
    db.collection('incrementors').doc('gameBegun').set({
        isGameStarted: true
    })

}





// call on new round click & beginGame()
async function setJudge() {
    // access server
    let db = firebase.firestore()
    let playersDirectory = db.collection('activePlayers')

    // get one user who hasn't been judge yet
    let waitingPlayer = await playersDirectory.where('waitingTurn', '==', true).limit(1).get()

    // if all the players have been judges, reset their status
    if (waitingPlayer.size == 0) {
        await resetWaitingPlayers(db, playersDirectory)

        // create a new call for a waiting player
        waitingPlayer = await playersDirectory.where('waitingTurn', '==', true).limit(1).get()
    }

    // get player to be judge from server
    waitingPlayer.forEach(player => {

        // update judge in server
        let playerName = player.data().name
        playersDirectory.doc('currentJudge').set({
            current_judge: playerName
        })

        console.log('Judge pushed to server:', playerName)

        // mark player no longer waiting
        playersDirectory.doc(player.id).update({
            waitingTurn: false
        })
    })

}


// local eval, not click though
// view change if user is Judge
async function isUserJudge(serverProvidedName) {

    // get local name
    let localName = localStorage.getItem('name')

    // if user not judge, don't change view
    if (localName != serverProvidedName) { return false }

    console.log(`Server indicates this user, ${localName}, is the judge.`)

    // show submitted cards page
    //TODO: show judge view
    judgeView()

    return true
}





async function resetWaitingPlayers(db, playersDirectory) {

    let allPlayers = await playersDirectory.where('waitingTurn', '==', false).get()

    let batch = db.batch()

    // all players now waiting to be judge
    allPlayers.forEach(player => {
        batch.update(playersDirectory.doc(player.id), {
            waitingTurn: true
        })
    })

    await batch.commit()
}




// Dev tool --> clear players click
async function resetGame() {

    // get players path
    let db = firebase.firestore()
    let batch = db.batch()

    // TODO: attach .where(room_name == CURRENT_ROOM) to allow for scalability
    let playerPath = db.collection('activePlayers')
    let playerCollection = await playerPath.get()

    // slate players for deletion
    playerCollection.forEach(player => {

        // leave one document to keep collection alive
        // replacing preserver with currentJudge doc
        if (player.id == 'currentJudge') { return }
        batch.delete(playerPath.doc(player.id))
    })
    // delete players
    await batch.commit()


     // delete current judge on game end
     let judgePath = db.collection('activePlayers').doc('currentJudge')

     await judgePath.update({
         current_judge: ''
     })


    // set game status as ended --> do this last to set correct view trigger
    let gameStatus = await db.collection('incrementors').doc('gameBegun').set({
        isGameStarted: false
    })


    // clear local storage
    localStorage.removeItem('name')

    console.log('Local game reset.')

}

// deletes the parent of the given element
function deleteCard(element) {

    element.parentElement.remove()

    // indicate we want one card dealt
    let numOfCards = 1
    dealCard(numOfCards)

}