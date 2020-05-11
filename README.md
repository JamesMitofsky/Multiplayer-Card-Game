# Bryan's-Card-Game
little app for family taskmaster


# Things I'm Learning




## Writing Data
- When writing, you can give documents specific names, but if you'd rather a [random serialization](https://firebase.google.com/docs/firestore/manage-data/add-data#add_a_document), use ```.add()``` rather than ```.doc().set()```. Behind the scenes, these are equivilent, but the latter lets you initialize a document in your code without necessarily having to write to it immediately.
- ```.set()``` will overwrite any already existing data.
- Because ```.get()``` returns a promise, we can await that in an async function to avoid unseenly nesting
- **doc.update() is not a function**: Since (I think) you can't iterate these returned objects, the workaround I've been using is access a collection, then get the current **document id** of the loop, and plug that in as the doc field of your query. From there, you can run a normal update request. 


### Batching
Why do it?
- Batching is important to avoid inconsistent data through multiple access points. If two people are trying to reach two data groups which should experience simultanious state changes, batch these to avoid confusion.

Caution:
- This almost goes without saying, but when batching, be sure to declare and call your batch from **outside** of the loop you're saving changes from. Otherwise it will create/call unique instances for each loop, defeating the point of batching.

## Initial Data Import
- If you have to import data before handling normal user requests, it's worth knowing Firestore's free tier is limited to 500 writes per request. Each field edit is considered a write.


## Queries
- All queries to locate by evaluation are done with ```.where()``` and must be followed by ```.get()``` to contact the server. This second method returns a promise, so be sure to await it.

**Tracking total number of records**
- Counting every record is possible but very resource heavy. Instead, consider implimenting an [incrementor document](https://firebase.googleblog.com/2019/03/increment-server-side-cloud-firestore.html) which solely serves to track the total number of docs.


## Firestore Permissions
- Initially, Firebase prevents all read and write actions, but you can change those [rules](https://firebase.google.com/docs/firestore/security/get-started#allow-all) to let anyone read and write. This is bad practice outside of production, but fine for now.


## Misc.
- Field names are case sensitive, so respect them when calling from you code as a document property.
- Firebase uses **Optimistic Updates**, so if you're updating a value in your app which is also rendered there, Firestore will employ a form of latency compensation. By using a realtime listener, it updates independent of a server callback, assuming the send will complete.


# Examples

## Changing documents from inside a loop

This is batched as best practice, but here, we're interested in the obscure access of documents from within loops. Declaring collection paths and accessing those collections as objects is recommended for loops because, now, we're able to identify any document using custom query criteria. This approach is made especially useful since Firestore doesn't allow ```!=``` (for reasons to do with an internal index and database speed).

*Collections which have been called cannot be read as collection paths.*

**Example:**
```js
// trash used cards

    let collectionPath = db.collection('submittedCards')
    let submittedCollection = await collectionPath.get()

    let batch = db.batch()
    submittedCollection.forEach(submission => {

        // if card is not collection preserver, delete it
        if (submission.id != 'preserveCollection') {
            batch.delete(collectionPath.doc(submission.id))        
        }

    })
    await batch.commit()

```