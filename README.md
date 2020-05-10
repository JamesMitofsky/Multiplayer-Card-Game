# Bryan's-Card-Game
little app for family taskmaster


# Things I'm Learning




## Write & Read
- When writing, you can give documents specific names, but if you'd rather a [random serialization](https://firebase.google.com/docs/firestore/manage-data/add-data#add_a_document), use ```.add()``` rather than ```.doc().set()```. Behind the scenes, these are equivilent, but the latter lets you initialize a document in your code without necessarily having to write to it immediately.
- Because ```.get()``` returns a promise, we can await that in an async function to avoid unseenly nesting
- **doc.update() is not a function**: Since (I think) you can't iterate these returned objects, the workaround I've been using is access a collection, then get the current **document id** of the loop, and plug that in as the doc field of your query. From there, you can run a normal update request. 
- Batching is important to avoid inconsistent data through multiple access points. If two people are trying to reach two data groups which should experience simultanious state changes, batch these to avoid confusion.

## Initial Data Import
- If you have to import data before handling normal user requests, it's worth knowing Firestore's free tier is limited to 500 writes per request. Each field edit is considered a write.


## Queries
- Executed following ```.where()``` with ```.get()```.

**Tracking total number of records**
- Counting every record is possible but very resource heavy. Instead, consider implimenting an [incrementor document](https://firebase.googleblog.com/2019/03/increment-server-side-cloud-firestore.html) which solely serves to track the total number of docs.


## Firestore Permissions
- Initially, Firebase prevents all read and write actions, but you can change those [rules](https://firebase.google.com/docs/firestore/security/get-started#allow-all) to let anyone read and write. This is bad practice outside of production, but fine for now.





## Misc.
- Field names are case sensitive, so respect them when calling from you code as a document property.
- Firebase uses **Optimistic Updates**, so if you're updating a value in your app which is also rendered there, Firestore will employ a form of latency compensation. By using a realtime listener, it updates independent of a server callback, assuming the send will complete.