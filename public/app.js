document.addEventListener("DOMContentLoaded", event => {

    // window.alert('Welcome! Deal yourself a card!')



});



// gets cards which haven't yet been used
async function dealCard() {


    // open database
    const db = firebase.firestore();
    const allCards = db.collection('cardCollection');

    // make sure there are cards available
    await cardsRemaining(db)

    // limit the query so we only get one card
    let query = allCards.where('isUsed', '==', false).limit(1)


    // await retrieving all cards
    let cards = await query.get()



    cards.forEach(card => {

        // grab data from this card
        data = card.data();

        // Create element with card information
        let cardElement = document.createElement('div')
        // add class for styles
        cardElement.classList.add('card')


        // get db information
        let dbContent = document.createElement('p')
        dbContent.innerText = data.content

        // create delete button
        let deleteButton = document.createElement('div')
        deleteButton.classList.add('delete-button')
        deleteButton.setAttribute('onclick', 'deleteCard(this)')
        deleteButton.innerText = "❌"

        // add data to the card wrapper
        cardElement.appendChild(deleteButton)
        cardElement.appendChild(dbContent)

        // push to the DOM
        document.getElementById('cards-wrapper').appendChild(cardElement)

        allCards.doc(card.id).update({
            isUsed: true
        })

        changeActiveCardCount(1)

        console.log('Card drawn: marked as used.')


    })

}


function deleteCard(element) {
    console.log('Detected: delete click!')

    // get card text
    let cardText = element.nextElementSibling.textContent



    element.parentElement.remove()


}


async function recycleAllCards() {

    // access the database
    const db = firebase.firestore();
    const allCards = db.collection('cardCollection');
    

    // clear incrementor of cards in play
    let incrementorDoc = await db.collection('incrementors').doc('cardsIncrementor').update({
        currently_used: 0
    })

    let discardedCards = await db.collection('cardCollection').where('isUsed', '==', true).get()


    
    // declare batch group
    let batch = db.batch()

    // look for all old cards
    discardedCards.forEach(card => {
     
        // add this card to the batch queue
        batch.update(allCards.doc(card.id), {isUsed: false})


        // allCards.doc(card.id).update({
        //     isUsed: false
        // })

    })

    await batch.commit()



    console.log('Cards Recycled: all cards are now available.')
}


// async function resetTheDeck(db) {




// }

// check to make sure we haven't used the last card yet
async function cardsRemaining(db) {

    let incrementorDoc = await db.collection('incrementors').doc('cardsIncrementor').get()

    let data = incrementorDoc.data()

    let currentlyUsed = data.currently_used
    let totalDocs = data.total_documents

    console.log(totalDocs - currentlyUsed, "remaining")
    if (currentlyUsed == totalDocs) {
        await recycleAllCards()
    }

   

}







function changeActiveCardCount(number) {

    // get db resources
    const db = firebase.firestore();
    const allCards = db.collection('cardCollection');
    const incrementor = db.collection('incrementors').doc('cardsIncrementor');

    // set incrementor to 1
    let changeByValue = firebase.firestore.FieldValue.increment(number);

    incrementor.update({
        currently_used: changeByValue
    })

   
}




 // testArray = ['proof']


    // testArray.forEach(item => {
    //     allCards.add({
    //         content: item,
    //         timestamp: firebase.firestore.FieldValue.serverTimestamp()

    //     })
    // })