document.addEventListener("DOMContentLoaded", event => {



    // access the database
    const app = firebase.app();
    const db = firebase.firestore();

    

    let newCards = getNewCards(db)


    updateHeaderText(db)


});




function getNewCards(db) {

    // find the collection
    const allCards = db.collection('cardCollection');
    
    // get cards which haven't been used
    const query = allCards.where('isUsed', '==', false)

    // retrieve all used cards
    query.get()
        .then(cards => {
            cards.forEach(card => {

                // grab data from this card
                data = card.data();

                // Create element with card information
                let cardElement = document.createElement('div')
                // add class for styles
                cardElement.classList.add('card')


                // get db information
                let dbContent = document.createElement('div')
                dbContent.innerText = data.content

                // add data to the card wrapper
                cardElement.appendChild(dbContent)

                // push to the DOM
                document.body.appendChild(cardElement)

            })
        })


    testArray = ['proof']


    // testArray.forEach(item => {
    //     allCards.add({
    //         content: item,
    //         timestamp: firebase.firestore.FieldValue.serverTimestamp()

    //     })
    // })
}


function updateHeaderText(db) {

    // grabs database document field and applies it to h2 tag
    const myPost = db.collection('posts').doc('firstpost');
    myPost.onSnapshot(doc => {
        console.log('detected change')
        const data = doc.data();
        document.querySelector('#title').innerHTML = data.title
    })
}



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