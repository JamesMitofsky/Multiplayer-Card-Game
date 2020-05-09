# Bryan's-Card-Game
little app for family taskmaster


# Things I'm Learning




## Write & Read
- When writing, you can give documents specific names, but if you'd rather a [random serialization](https://firebase.google.com/docs/firestore/manage-data/add-data#add_a_document), use ```.add()``` rather than ```.doc().set()```. Behind the scenes, these are equivilent, but the latter lets you initialize a document in your code without necessarily having to write to it immediately.
- Because ```.get()``` returns a promise, we can await that in an async function to avoid unseenly nesting


## Queries
- Executed following ```.where()``` with ```.get()```.

**Tracking total number of records**
- Counting every record is possible but very resource heavy. Instead, consider implimenting an [incrementor document](https://firebase.googleblog.com/2019/03/increment-server-side-cloud-firestore.html) which solely serves to track the total number of docs.


## Firestore Permissions
- Initially, Firebase prevents all read and write actions, but you can change those [rules](https://firebase.google.com/docs/firestore/security/get-started#allow-all) to let anyone read and write. This is bad practice outside of production, but fine for now.





## Misc.
- Field names are case sensitive, so respect them when calling from you code as a document property.
- Firebase uses **Optimistic Updates**, so if you're updating a value in your app which is also rendered there, Firestore will employ a form of latency compensation. By using a realtime listener, it updates independent of a server callback, assuming the send will complete.