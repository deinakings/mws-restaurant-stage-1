/**
 * IndexedDB Helper.
 */
 
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
    
    /**
     * Save all restaurants to IDB.
     * @returns {Promise} a promise.
     */
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

    /**
     * Save a restaurants to IDB.
     * @returns {Promise} a promise.
     */
    updateRestaurant(restaurant) {
        return this.dbPromise.then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            const restaurantsStore = tx.objectStore('restaurants');
            restaurantsStore.put(restaurant);
            return tx.complete;
        });
    }
    
    /**
     * Get all restaurants from IDB.
     * @returns {Promise} a promise.
     */
    getRestaurants() {
        return this.dbPromise.then(db => {
            const tx = db.transaction('restaurants');
            const restaurantsStore = tx.objectStore('restaurants');
            return restaurantsStore.getAll();
        });
    }
}
