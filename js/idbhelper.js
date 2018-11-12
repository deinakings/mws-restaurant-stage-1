/**
 * IndexedDB Helper.
 */
 
class IDBHelper {
    
    constructor() {
        //open db here
        this.dbPromise = idb.open('mws-restaurant-idb', 2, upgradeDB => {
            switch(upgradeDB.oldVersion) {
                case 0:
                    const restaurantsStore = upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
                case 1:
                    const reviewsStore = upgradeDB.createObjectStore('reviews', {keyPath: 'restaurantId'});
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
     * Save restaurant review to IDB.
     * @returns {Promise} a promise.
     */
    saveReviewsByRestaurant(restaurantId, reviews) {
        const reviewsToSave = {
            restaurantId: restaurantId,
            reviews: reviews
        };
        return this.dbPromise.then(db => {
            const tx = db.transaction('reviews', 'readwrite');
            const reviewsStore = tx.objectStore('reviews');
            reviewsStore.put(reviewsToSave);
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

    /**
     * Get reviews by restaurant from IDB.
     * @returns {Promise} a promise.
     */
    getReviews(restaurantId) {
        return this.dbPromise.then(db => {
            const tx = db.transaction('reviews');
            const restaurantsStore = tx.objectStore('reviews');
            return restaurantsStore.get(restaurantId);
        });
    }
    
}
