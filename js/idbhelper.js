
// const dbPromise = idb.open('mws-restaurant-idb', 1, upgradeDB => {
//     // handle different versions of the db
//     switch(upgradeDB.oldVersion) {
//         case 0: 
//             const keyValueStore = upgradeDB.createObjectStore('keyValueStore');
//             keyValueStore.put('hellow', 'myKey');
//         case 1: 
//             const restaurantsStore = upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
//     }
   
// });

// dbPromise.then(db => {
//     const transaction = db.transaction('keyValueStore');
//     const keyValueStore = transaction.objectStore('keyValueStore');
//     return keyValueStore.get('myKey');
// }).then(value => console.log(value));

// dbPromise.then(db => {
//     const transaction = db.transaction('keyValueStore', 'readwrite');
//     const keyValueStore = transaction.objectStore('keyValueStore');
//     keyValueStore.put('myValue!?', 'secondKey');
//     return transaction.complete;
// })
// .then(() => console.log('Successfully added "myValue" to db'))
// .catch(err => console.log('It failed :( with error:', err));

class IDBHelper {
    
    constructor() {
        //open db here
        this.dbPromise = idb.open('mws-restaurant-idb', 1, upgradeDB => {
            switch(upgradeDB.oldVersion) {
                case 0:
                    const restaurantsStore = upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
            }
        });
    }
    
    saveRestaurants(restaurants) {
        return this.dbPromise.then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            const restaurantsStore = tx.objectStore('restaurants');
            restaurants.forEach(restaurant => {
                restaurantsStore.put(restaurant);
            });
            return tx.complete;
        });
    }
    
    getRestaurants() {
        return this.dbPromise.then(db => {
            const tx = db.transaction('restaurants');
            const restaurantsStore = tx.objectStore('restaurants');
            return restaurantsStore.getAll();
        });
    }
}