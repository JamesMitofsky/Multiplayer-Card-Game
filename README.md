# Cards Against ~~Humanity~~ Covid
little app for family taskmaster

# Things I'm Learning

## Read & Write Data
- When writing, you can give documents specific names, but if you'd rather a [random serialization](https://firebase.google.com/docs/firestore/manage-data/add-data#add_a_document), use ```.add()``` rather than ```.doc().set()```. Behind the scenes, these are equivilent, but the latter lets you initialize a document in your code without necessarily having to write to it immediately.
- Inherently, ```.set()``` will create a document or overwrite pre-existing data, but this latter overwriting feature can be disabled by passing ```{merge: true}``` as an argument following the assignment parameter.
- Because ```.get()``` returns a promise, we can await that in an async function to avoid unseenly nesting
- ```doc.update()``` is **not a function**: Since (I think) you can't iterate these returned objects, the workaround I've been using is access a collection, then get the current **document id** of the loop, and plug that in as the doc field of your query. From there, you can run a normal update request.
- **Update if doesn't exist:** {merge: true}
- It's very important to await functions as you call them, even if you're awaiting all of the server calls inside any given function.


### Batching
- Why do it? Batching is important to avoid inconsistent data through multiple access points. If two people are trying to reach two data groups which should experience simultanious state changes, batch these to avoid confusion.
- Caution: This almost goes without saying, but when batching, be sure to declare and call your batch from **outside** of the loop you're saving changes from. Otherwise it will create/call unique instances for each loop, defeating the point of batching.

### Write limit
- If you have to import data before handling normal user requests, it's worth knowing Firestore's free tier is limited to 500 writes per request. Each field edit is considered a write.


### Queries
- All queries to locate by evaluation are done with ```.where()``` and must be followed by ```.get()``` to contact the server. This second method returns a promise, so be sure to await it.
- Documents which only contian a specific field can be accessed by passing the field name to the ```.orderBy()``` method.


- **Order by time:** You can access timestamp documents using Firebase's internal clock by invoking ```firebase.firestore.FieldValue.serverTimestamp()```. Then, you can serve the most recently added document through ```.orderBy('TIME_FIELD_NAME', desc)```. This is especially powerful when paired with ```.limit(1)```, serving up only the very most recent change.
    - Be warned, though! The serverTimestamp takes a moment to run, meaning any snapshot listening to that data will run twice! Explanation from [Stack Overflow](https://stackoverflow.com/questions/49972173/firestore-onsnapshot-executing-twice).

### Collections
- Will not continue to exist if empty. There must always be at least one document, but document do seem able to exist without field content.


## Firestore Permissions
- Initially, Firebase prevents all read and write actions, but you can change those [rules](https://firebase.google.com/docs/firestore/security/get-started#allow-all) to let anyone read and write. This is bad practice outside of production, but fine for now.


## Misc.

**Field names**
- Field names are case sensitive, so respect them when calling from you code as a document property.

**Local value updates**
- Firebase uses *Optimistic Updates*, so if you're changing a variable from inside your app which is also visible there, Firestore will employ a form of latency compensation. By using a realtime listener, it updates independent from and earlier than the server, not requiring a callback since it assumes the send will complete. However, I think this can be disabled simply by awaiting the promise of a change.

**Tracking total number of documents**
- Counting every record is possible but may needlessly consume read events. Instead, consider implimenting an [incrementor document](https://firebase.googleblog.com/2019/03/increment-server-side-cloud-firestore.html) which solely serves to track the total number of docs.


# Examples

## Changing documents from inside a loop

This example is batched as best practice, but we're really interested in the obscure access of documents from within loops.

Declaring collection paths and accessing those collections as objects is recommended for loops because we're able to identify any document using custom query criteria. This approach is made especially useful since Firestore doesn't allow ```!=``` (for reasons to do with an internal index that promotes database speed).

*Collections which have been called cannot be read as collection paths.*

**Example:**
```js
async function example() {
    const db = firebase.firestore()

    // retrieve path & object
    let collectionPath = db.collection('COLLECTION_NAME')
    let submittedCollection = await collectionPath.get()

    // loop through OBJECT
    submittedCollection.forEach(submission => {

        // negative evalutator to avoid document
        if (submission.id != 'DOCUMENT_NAME') {

            // executed code here
        }
    })
}
```


## Snapshots

Snapshots are listeners applied to the server, executing code when the field(s) targeted change.

```js
const db = firebase.firestore()

// filter which documents we're listening to
db.collection("cities").where("state", "==", "CA")
    .onSnapshot(returnedDocs => {
        
        // iterate documents that changed
        returnedDocs.forEach(doc => {

            // executed code here
        });
        
        
    });
```


# TODO
- [ ] Let users identify themselves on load. Then, dynamically rotate through them as Judge
- [ ] Only one card recycle allowed per turn. Hide delete button after one click until submit is pressed
