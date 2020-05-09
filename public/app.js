document.addEventListener("DOMContentLoaded", event => {


    const db = firebase.firestore();

    // find the collection
    const allCards = db.collection('cardCollection');


    // on button press, get one new card
    let singleCard = returnNewCard(allCards)


    // updateHeaderText(db)


});



// gets cards which haven't yet been used
async function returnNewCard() {


    const db = firebase.firestore();

    // find the collection
    const allCards = db.collection('cardCollection');


    // limit the query so we only get one card
    let query = allCards.where('isUsed', '==', false).limit(1)


    // await retrieving all cards
    let cards = await query.get()

    console.log("Total unused cards:", cards.size)



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
        document.body.appendChild(cardElement)

        allCards.doc(card.id).update({
            isUsed: true
        })

        console.log('Card drawn: marked as used.')


    })

}


function deleteCard(element) {
    console.log('Detected: delete click!')

    // get card text
    let cardText = element.nextElementSibling.textContent



    element.parentElement.remove()


}

// don't wanna change card on delete
// async function lookForCard(cardText) {

//     // access the database
//     const db = firebase.firestore();

//     // find the collection
//     const allCards = db.collection('cardCollection');


//     // look for this particular card
//     let query = allCards.where('content', '==', cardText)

//     // await retrieving all matching documents
//     let dbCard = await query.get()

//     // only expecting one document
//     dbCard.forEach(card => {

//         data = card.data()
//         console.log('Card now marked as "Used":', data.content)
        
//         console.log(card.id)

//         allCards.doc(card.id).update({
//             isUsed: true
//         })

//     })
// }


async function recycleAllCards() {
    // access the database
    const db = firebase.firestore();

    // find the collection
    const allCards = db.collection('cardCollection');

    let query = allCards.where('isUsed', '==', true)

    let usedCards = await query.get()

    usedCards.forEach(card => {
        let data = card.data()

        allCards.doc(card.id).update({
            isUsed: false
        })

    })

    

    location.reload()

    console.log('Cards Recycled: all cards are now available.')
}


// function updateHeaderText(db) {

//     // grabs database document field and applies it to h2 tag
//     const myPost = db.collection('posts').doc('firstpost');
//     myPost.onSnapshot(doc => {
//         console.log('detected change')
//         const data = doc.data();
//         document.querySelector('#title').innerHTML = data.title
//     })
// }


// called from onChange event in the app, this sends input to database
function updatePost(e) {
    // calls database
    const db = firebase.firestore();

    // finds correct document
    const myPost = db.collection('posts').doc('firstpost');

    // sends the text input to the database
    myPost.update({ title: e.target.value })
}


function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider).then(result => {

        const user = result.user;
        document.write(`Hello ${user.displayName}`)

        console.log(user)

    })



}


// one time execute to import CSV data
function writeCardsToDatabase() {

    // get db resources
    const db = firebase.firestore();
    const allCards = db.collection('cardCollection');
    const incrementor = db.collection('incrementors').doc('cardsIncrementor');

    // set incrementor to 1
    let increment = firebase.firestore.FieldValue.increment(1);



    incrementor.update({
        total_documents: increment
    })

    // testArray = ['proof']


    // testArray.forEach(item => {
    //     allCards.add({
    //         content: item,
    //         timestamp: firebase.firestore.FieldValue.serverTimestamp()

    //     })
    // })

    

   


}