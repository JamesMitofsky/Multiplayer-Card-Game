document.addEventListener("DOMContentLoaded", async (event) => {

    // window.alert('Welcome! Deal yourself a card!')
    // console.log('proof')

    // grab card from database
    currentJudgeCard()

    getAdjudicator()




});



// gets cards which haven't yet been used
async function dealCard() {


    // open database
    const db = firebase.firestore();

    // make sure cards are available
    let incrementorPath = db.collection('incrementors').doc('playerCardsIncrementor')
    let cardCollectionPath = db.collection('playerCards')
    await cardsRemaining(incrementorPath, cardCollectionPath)


    // limit the query so we only get one card
    let query = cardCollectionPath.where('isUsed', '==', false).limit(1)
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
        let innerDeleteButton = document.createElement('span')
        innerDeleteButton.innerText = 'x'
        deleteButton.appendChild(innerDeleteButton)

        // add data to the card wrapper
        cardElement.appendChild(deleteButton)
        cardElement.appendChild(dbContent)

        // push to the DOM
        document.getElementById('cards-wrapper').appendChild(cardElement)

        cardCollectionPath.doc(card.id).update({
            isUsed: true
        })

        // assign location and plus minus value
        changeCardCount(1, incrementorPath)

        console.log('Card drawn & marked used')


    })

}


function deleteCard(element) {
    console.log('Detected: delete click!')

    // get card text
    let cardText = element.nextElementSibling.textContent

    element.parentElement.remove()
}

// resets incrementors
async function recycleAllCards(incrementorPath, cardCollectionPath, element) {


    // access the database
    const db = firebase.firestore();

    // if called from HTML click, know it's recycling
    if (typeof (element) != 'undefined' && element != null) {
        console.log('Recycle Function Called Manually')
        incrementorPath = db.collection('incrementors').doc('playerCardsIncrementor')
        cardCollectionPath = db.collection('playerCards')
    }



    // clear incrementor of cards in play
    let incrementorDoc = await incrementorPath.update({
        active_cards: 0
    })


    // get collection of all used cards
    let discardedCards = await cardCollectionPath.where('isUsed', '==', true).get()

    // refresh discards, marking them as not used
    let batch = db.batch()
    discardedCards.forEach(card => {

        // add this card to the batch queue
        batch.update(cardCollectionPath.doc(card.id), { isUsed: false })

    })
    await batch.commit()



    console.log('Recycled: all cards are now available.')
}


// purely listens to database for new card
async function currentJudgeCard() {

    // open database
    const db = firebase.firestore();
    const judgeCards = db.collection('judgeCards');


    judgeCards.doc('currentJudgeCard')
        .onSnapshot(function (doc) {
            let activeCard = doc.data().active_judgeCard
            console.log('Judge-Card updated:', activeCard)
            document.getElementById('judge-card-content').innerText = activeCard
        })
}





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

        // temp console log
        console.log('Local request for a new card:', card.data().content)


        // copy card's content to the single doc which transiently holds this active content
        let judgeCardContent = card.data().content
        judgeCards.doc('currentJudgeCard').set({
            active_judgeCard: judgeCardContent
        })

        // increase incrementor TODO


        let number = 1
        let incrementorLocation = db.collection('incrementors').doc('judgeCardsIncrementor')
        changeCardCount(number, incrementorLocation)




        // finally, move this card to the used group
        judgeCards.doc(card.id).update({
            isUsed: true
        })
    })
}




// increment card total counter --> recycle if necessary
async function cardsRemaining(incrementorPath, cardCollectionPath) {

    let incrementorDoc = await incrementorPath.get()
    // get document so we can read all fields
    let data = incrementorDoc.data()

    // compare fields
    let currentlyUsed = data.active_cards
    let totalDocs = data.total_cards
    console.log(totalDocs - currentlyUsed, "cards before deck recycle")

    // if the total exceeds or matches the total number of saved docs, reset
    if (currentlyUsed >= totalDocs) {
        await recycleAllCards(incrementorPath, cardCollectionPath)
    }



}


function changeCardCount(number, incrementorLocation) {

    // set incrementor to 1
    let changeByValue = firebase.firestore.FieldValue.increment(number);

    incrementorLocation.update({
        active_cards: changeByValue
    })


}


function devTools() {

    // handle recycle button
    let recycleBtn = document.getElementById('recycle-btn')
    if (recycleBtn.style.display == 'none') {
        recycleBtn.style.display = 'block'
    } else {
        recycleBtn.style.display = 'none'
    }

    // handle judge card button
    let judgeCardBtn = document.getElementById('judge-card-btn')
    if (judgeCardBtn.style.display == 'none') {
        judgeCardBtn.style.display = 'block'
    } else {
        judgeCardBtn.style.display = 'none'
    }


}


// send local value out to server
function changeJudgeName(e) {

    // open database
    const db = firebase.firestore();

    // make sure cards are available
    let currentJudge = db.collection('incrementors').doc('currentJudge')


    currentJudge.update({
        current_judge: e.target.value
    })

    console.log('Sent out judge name-change')

}


function getAdjudicator() {

    // open database
    const db = firebase.firestore();
    const judgeCards = db.collection('incrementors');


    judgeCards.doc('currentJudge')
        .onSnapshot(function (doc) {

            let serverIndicatedJudge = doc.data().current_judge
            console.log('Current judge indicated by server:', serverIndicatedJudge)

            // document.getElementById('judge-card-content').innerText = activeCard




            // read about this HTML select solution here: https://thisinterestsme.com/change-select-option-javascript/
            let selectElement = document.getElementById('select');

            let selectOptions = selectElement.options

            for (var opt, j = 0; opt = selectOptions[j]; j++) {
                //If the option of value is equal to the option we want to select.
                if (opt.value == serverIndicatedJudge) {
                    //Select the option and break out of the for loop.
                    selectElement.selectedIndex = j;
                    break;
                }
            }


        })
}















// UNENROLLED FUNCTIONS BELOW -------------------------------------------------------------------------------------------------------


async function loadExelValues() {

    // call the database
    const db = firebase.firestore();
    // name directories
    let judgeCards = 'judgeCards'
    let playerCards = 'playerCards'
    // call one directory
    let activeDirectory = db.collection(judgeCards);

    // convert string from Ryan to array
    let playerCardString = `
    "Just spit it in a napkin."|
    "He's about three pancakes short of a stack."|
    "The last time I saw something that looked like that, the cat covered it up."|
    "I wish my preacher could talk to you."|
    "It's going to take a Shop-Vac to clean up this mess!""|
    "Does this smell funny to you?"|
    "I'm on the highway to hell."|
    "I'm naked under my clothes!"|
    "I might have done it one too many times."|
    "Mine looks like that, but it's not green."|
    "I cleaned it up last time. It's your turn."|
    "If I'm not back in ten minutes, call the police!"|
    "Does that thing hurt as bad as it looks?"|
    "He kind of looks like a turtle."|
    "What the hell is wrong with you?"|
    "I should have faked my own death and moved to Mexico."|
    "Whose feet stink?"|
    "That thing has seen better days."|
    "I've been probed by aliens."|
    "I'm going to go ahead and warn you… I ate way too many burritos at lunch."|
    "Is it me or is his head unusually big?"|
    "How about putting some teeth in that hole?"|
    "You are going to put somebody's eye out with that."|
    "You remind me of the fella on the evolutionary chart."|
    "Somebody didn't use deodorant."|
    "Has anybody seen my pants?"|
    "If that's not a crime, it should be."|
    "Have you always had just one eyebrow? Has anybody seen my false teeth?"|
    "Is that a baby or a monkey?"|
    "I've seen a lot of them and that is not normal!"|
    "You might want to put some ice on that."|
    "Give me a paper towel! It's leaking again!"|
    "You have a crusty in your left nostril."|
    "I'll see you in hell."|
    "Cornhole!!!"|
    "I can't get the taste out of my mouth."|
    "You can still eat it."|
    "That kid's eyes are way too close together."|
    "The last time I saw something that looked like that, it was caught in a trap."|
    "I can never remember, which one is the glass eye?"|
    "Do my pits stink?"|
    "Is that thing loaded?"|
    "I had to have been drunk when I said yes."|
    "I wouldn't go in there if I were you."|
    "Hello heartburn!"|
    "Try the salad bar."|
    "What are you looking at?"|
    "Is that supposed to be hanging out?"|
    "I need a dip."|
    "You are on my last nerve."|
    "Bless her heart. That's not normal."|
    "You expect me to eat this?"|
    "I do and do for you, and this is the thanks I get?"|
    "Oh my aching ass!"|
    "The one that smelt it dealt it!"|
    "The deviled eggs have turned."|
    "That's the last time I try to bathe a cat!"|
    "I once dreamed of being a dancer."|
    "You have hash browns on your shirt."|
    "There's a weird smell in the laundry room."|
    "How did you cram all of that in there?"|
    "The last time I saw a shirt like that it was on a scarecrow!"|
    "He ain't good-looking, but he sure is stupid."|
    "If those are real, I'll kiss a good man's ass."|
    "If the police come around asking questions, you and I were fishing last night."|
    "Who wants to play cornhole?"|
    "What is that? A booger?"|
    "I smell something burning!"|
    "I have sinned and it sure was fun!"|
    "You are about a moron."|
    "That baby is never going to amount to anything."|
    "Do you see anything in my ear?"|
    "Has anybody thought about calling an exorcist?"|
    "Somebody's breath smells like cat litter."|
    "I'm not wearing any underwear."|
    "I wouldn't put any weight on it."|
    "Just cut off the burnt parts and eat it."|
    "I will be in my room with the door locked."|
    "Why does he walk funny?"|
    "Those damn squirrels are driving me crazy!"|
    "I thought it would be longer."|
    "I need a Gas-X tablet."|
    "I'm going outside to smoke a cigarette!"|
    "Just close your eyes and try to think of something happy."|
    "I'm so, so sorry."|
    "Bean-O saved my marriage!"|
    "He's a dreamer… unfortunately he dreams about Honey Buns."|
    "You make me feel better about my own life."|
    "Can somebody take me to the emergency room?"|
    "I knew after the first time I did it that I was going to do it again every chance I got."|
    "I am voting you off the island!"|
    "The stain on your couch is disturbing."|
    "If it has a hole at either end, I don't want it."|
    "That thing on your nose is getting bigger."|
    "I need a taco!"|
    "Don’t take this wrong, but you are full of crap."|
    "I hope that this is like Haley's Comet and I only have to see it once in my lifetime."|
    "You are special! But not in a good way."|
    "If he is the question, the answer is no."|
    "All of my sex ends with an apology."|
    "He's in the basement doing whatever he does down there."|
    "If you were drunk, it doesn't count!"|
    "Do me a favor and go pull the plungers off his butt cheeks."|
    "I could really disappoint her."|
    "Somebody's been hitting the bong."|
    "Has anybody seen my Vienna Sausage?"|
    "Would you please excuse me for a minute? I am not sure that was a fart."|
    "There's a possum in our toilet!"|
    "It tastes like chicken!"|
    "I saw something like that once at the fair."|
    "Please tell me that is a Halloween mask."|
    "Have you suffered some type of head injury?"|
    "If you would just stick a pin in it, the swelling would go down."|
    "That is the opposite of good!"|
    "There is no excuse for that."|
    "You mark my words, they are going to end up living in our basement!"|
    "I am going to pray for his teacher."|
    "I'm having plumbing problems."|
    "He's a mouth breather."|
    "I can't take you seriously while you're wearing that wig."|
    "That thing on your forehead is so distracting!"|
    "I don't trust anybody that has ears like an elf."|
    "Just so you know, the police are on the way."|
    "If you love me, you will stop wearing stretch pants."|
    "That middle kid looks a little like a baboon."|
    "I know you need encouragement, but I can't think of anything positive to say."|
    "I'm so thankful I don't have to do his laundry."|
    "You have two chances for a happy life. Slim and none!"|
    "I eat lightning and crap thunder!"|
    "If you were a car, the check engine light would be on."|
    "He must have money. There is no other explanation."|
    "Her teeth are so big she can't closer her mouth."|
    "I have a spastic colon."|
    "You were much more fun when you were a drunk."|
    "I want a do-over."|
    "Let's try playing the 'no talking' game!"|
    "Please just make it stop!"|
    "This is why nobody likes you."|
    "Lock his ass up!"|
    "Have you ever heard of a toothbrush?"|
    "You take all the joy out of everything."|
    "I've been looking for love in all the wrong places."|
    "The answer is no."|
    "I apologize. I should have washed it."|
    "I'm quitting school and joining the circus!"|
    "Ewwwwww! It's got bugs all over it!"|
    "Will you take a look at this thing on my back?"|
    "Somebody took a trip to the land of bad decisions."|
    "I will pay you ten bucks to put your shoes back on."|
    "Your breath could knock a buzzard off of a gut wagon."|
    "Was that you or the dog?"|
    "If I had my pocket knife, we could cut that off."|
    "Tell me that don't stink!"|
    "Don't panic! It ain't my blood!"|
    "I have an itch that I can't scratch."|
    "I fee like a cat turd rolled in cracker crumbs."|
    "I truly believe my underwear is haunted."|
    "That smell ain't going away."|
    "Help me get my pants off!"|
    "I refuse to touch it without wearing gloves."|
    "It's hard to explain, but it makes me tingle."|
    "It's not my fault! It just popped out!"|
    "That smells like bottled ass!"|
    "There's regular sized and then there's that."|
    "The sun don't shine on the same dog's ass all the time."|
    "If he says one word, I am popping him right in the mouth."|
    "The last time I saw something that looked like that, it was in a medical pamphlet."|
    "Don't look at me, it was the dog!"|
    "If I had to do it all over again, I would have had myself sterilized."|
    "Give him a break… he just got out of jail!"|
    "I feel pretty today!"|
    "I don’t think that is chocolate."|
    "The chickens are back in the house!"|
    "I can't find the boa constrictor!"|
    "I've seen him before on Cops."|
    "That stain ain't coming out."|
    "Call the TV station! I've found Bigfoot!"|
    "I've got something I'd like you to see."|
    "Welcome to an episode of the Walking Dead."|
    "That is just nasty."|
    "He eats crayons, and that's not normal."|
    "Take a picture of that and send it to me."|
    "If ignorance is bliss, you must be very, very happy."|
    "You are very brave to wear that."|
    "You are acting crazier than a sprayed roach."|
    "I have mold in my crawl space."|
    "You are going to hell on a full scholarship."|
    "What can I do to help you leave?"|
    "My thighs are burning."|
    "If anybody needs me, I will be on the toilet."|
    "It was a false alarm."|
    "You have a booger on your shirt."|
    "I think there's week in the brownies."|
    "You might want to zip your pants up."|
    "FREEBIRD!"|
    "Do you own a mirror?"|
    "I need to get my groove on."|
    "Winner winner, chicken dinner!"|
    "After seeing that, I need a cup of coffee to settle my nerves."|
    "I used to be young and fun, now I'm just old and fun."|
    "The only thing stopping him from going on a nine-state killing spree is lack of gas money."|
    "That boy ain't right in the head."|
    "That's not a Slim Jim!"|
    "Could you please cover that up? We're trying to eat."|
    "Do me a favor and go jiggle the handle."|
    "Does anybody know where I can buy arsenic?"|
    "There's a new invention called soap. You should try it!"|
    "I personally watched him double dip the guacamole."|
    "If that's not a wig, her hairdresser should be shot."|
    "You really should wear underwear with those shorts."|
    "I just wet my pants a little bit."|
    "That story does not have a happy ending."|
    "So what's the story with the giant tattoo?"|
    "Who taught you how to put on makeup? A clown?"|
    "I bet somebody is offering a reward for his capture."|
    "Why don't you try saying no?"|
    "We should start a band!"|
    "On second thought, I'm not hungry."|
    "Have you ever thought about washing your hair?"|
    "Hygiene is not just a greeting."|
    "This is the beginning of something big!"|
    "I've been to prison. Did you know that?"|
    "Your shirt is on wrong side out."|
    "I had a dress like that back when they were in style."|
    "Why do you hate me so much?"|
    "You're trying to kill me, aren't you?"|
    "Well I can die happy now."|
    "His elevator doesn't go all the way to the top floor."|
    "I'm not amused in the least."|
    "You're the worst thing that ever happened to me."|
    "Is it just me or did the potato salad taste funny?"|
    "You're about as sharp as a marble."|
    "I am wanted in seven states!"|
    "We talk about you when you're not here."|
    "I think I hear the ice cream truck!"|
    "It's hard to look at you without laughing."|
    "Who wants a free kitten?"|
    "I bet he could entertain himself for hours with a fly swatter."|
    "If you punched him in the nose, you'd probably break his finger."|
    "All my dreams went down the toilet."|
    "He may not be handsome, but he's lazy!"|
    "I'm too blessed to get dressed."`;
    let judgeCardString = `As the family sat around discussing my brother's new girlfriend, my mother said…|
    My wife walked up to the ladies on the prayer committee and said…|
    When Uncle Roland came out of the coma, the first thing he said was…|
    When my cousin introduced her new husband to the family, my Uncle Harold said…|
    When my sister started listing all her problems at the dinner table, my dad looked at her and said…|
    Dad asked his brother about his new son-in-law and Marvin simply said…|
    Right before he went to bed, my brother announced…|
    As soon as they walked out the front door, my mother said…|
    Upon seeing my cousin's kids, my brother leaned over to me and whispered…|
    When they walked into the hotel room, my sister told her husband…|
    While I was on the phone with my mother, I could hear someone in the background saying…|
    Last Christmas, Gramma pulled me close and whispered…|
    When the judge asked my cousin Jessie if he had anything to say before he was to be sentenced, Jesse proudly said…|
    Christmas dinner was ruined when Uncle Roger announced…|
    While watching their nephew one afternoon, my sister commented to her husband…|
    When my Mom came back from the hair salon and asked, "What do you think? Her partner blurted out...|
    During the intervention my cousin Pete told the group…|
    When asked to sum up her life in one sentence, Grandma said…|
    My brother's favorite song is…|
    As the entire family sat around discussing my grandma, my mother made the comment…|
    I will never forget the day my grandpa said to me…|
    We were all shocked when MeeMaw said to the preacher's wife…|
    At the conclusion of the meal, Dad pushed his chair back from the table and said…|
    Our family's motto is…|
    The only thing I ever heard my dad say about my cousin Franny was…|
    When I asked Mom where the dog was, she answered…|
    While watching the kids play in the backyard, Grandma said to my sister about her youngest child…|
    The emergency room nurse walked up to us and said…|
    During karaoke night, my brother grabbed the microphone and shouted…|
    On the way home from the family reunion, Granny made the comment…|
    Dad walked in with blood all over his shirt and said…|
    When Uncle Carl asked, "Is my breath bad?" Mom staggered back a couple of steps and answered…|
    Right before she died, Aunt Lula sat straight up in bed and said…|
    Having no filter between her brain and her mouth, my aunt said to my sister…|
    Uncle Lester's motto was…|
    Right in the middle of dinner, my father said to my brother's new girlfriend… |
    Aunt Thelma could be blunt, such as the time she said to her husband…|
    Uncle Tucker had an unusual tombstone. It simply said…|
    Everyone was worried that something bad had happened to Uncle Howard when he burst through the door and shouted…|
    When Karla walked out to show the girls her wedding dress, Aunt Lavonda blurted out…|
    The social worker asked my five year old nephew, "How are you doing?" and he answered…|
    Cousin Melvin looked the judge in the face and said….|
    While watching the kids jump on the trampoline, my aunt told my mother…|
    At the bottom of the job application, in the additional comments section, Don wrote…|
    While in the hot tub Aunt Dotty told Kevin…|
    While visiting Uncle Cletus in the nursing home Aunt Lois casually said…|
    The first time I saw their new baby the only thing I could think to say was…|
    My brother-in-law got fired because he walked into his boss's office and said…|
    My daddy sat me down, took a deep breath and said…|
    As soon as the blessing was over my cousin Kenny started the dinner conversation by saying…|
    While walking past my brother's bedroom I heard him say…|
    I will never forget the night my uncle said to the preacher…|
    When the pediatrician was finished examining my nephew, he said…|
    After an hour in the bathroom Uncle Bruce shouted…|
    At the funeral home visitation we were shocked when my brother walked up to the Widow Douglass and said…|
    As they lay in bed smoking cigarettes, my Uncle Tony said to his wife…|
    While cleaning the kitchen together my Aunt Sue confided to my mother…|
    While giving his testimony in front of the congregation my Uncle Willard caused audible gasps when he said…|
    When my brother brought out his new baby to show the family, Granny blurted out…|
    While discussing my cousin Judy's fourth husband, all Uncle Norm would say was…|
    My mother-in-law didn't make any friends at the reception when she grabbed the microphone and said…|
    Right before we walked down the aisle Daddy leaned over to me and whispered…|
    Nobody could believe it when in the middle of Thanksgiving dinner Grampa started shouting…|
    After a few too many beers, my sister finally got up the courage to walk up to Aunt Rachel and say…|
    When my cousin Tina walked down the aisle, my brother leaned over to me and whispered…|
    When asked by my parents what he saw in his new girlfriend, my brother said…|
    While watching Papa dance around the living room, my Uncle Mitch said…|
    Nothing will ruin an Easter Brunch like your brother saying…|
    I will never forget the day my mother looked at me and said…|
    The headstone on my cousin Jackie's grave bore the words…|
    When Mama put dinner on the table my brother looked at her and said…|
    `
    let activeString = judgeCardString


    let tempArray = activeString.split('|')
    // trim whitespace from array items
    let finalArray = []
    tempArray.forEach(string => {
        finalArray.push(string.trim())
    })




    // declare batching
    let batch = db.batch()


    // WARNING: use finalArray
    finalArray.forEach(string => {


        // declaring location beforehand; auto-generated IDs can't be inline for batches
        let newDoc = activeDirectory.doc()
        // declare batch
        batch.set(newDoc, {
            content: string,
            isUsed: false,
        })



    })


    // commit all pending changes
    await batch.commit()

    console.log("CSV values imported.")


}


// identifies used card quantity
async function countCards() {

    // open database
    const db = firebase.firestore();
    const allCards = db.collection('playerCards');

    console.log('proof')

    let query = allCards.where('isUsed', '==', true)
    // await retrieving all cards
    let cards = await query.get()

    console.log(cards.size)
}


