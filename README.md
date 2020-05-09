# Bryan's-Card-Game
little app for family taskmaster


# Things I'm Learning


## Misc.
- Field names are case sensitive, so respect them when calling them as a document property.

## Write & Read
- When writing, you can give documents specific names, but if you'd rather a [random serialization](https://firebase.google.com/docs/firestore/manage-data/add-data#add_a_document), use ```.add()``` rather than ```.doc().set()```. Behind the scenes, these are equivilent, but the latter lets you initialize a document in your code without necessarily having to write to it immediately.

## Firestore Permissions
- Initially, Firebase prevents all read and write actions, but you can change those [rules](https://firebase.google.com/docs/firestore/security/get-started#allow-all) to let anyone read and write. This is bad practice outside of production, but fine for now.


## Optimistic Updates
If you're updating a value visible locally, Firestore uses optimistic updates (aka latency compensation), involving a realtime listener which updates locally rather than necessarily waiting for a callback from the server.