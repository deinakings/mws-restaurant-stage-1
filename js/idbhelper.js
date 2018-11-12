/**
 * IndexedDB Helper.
 */
 
class IDBHelper {
    
    constructor() {
        //open db here
        this.dbPromise = idb.open('mws-restaurant-idb', 4, upgradeDB => {
            switch(upgradeDB.oldVersion) {
                case 0:
                    const restaurantsStore = upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
                case 1:
                    const reviewsStore = upgradeDB.createObjectStore('reviews', {keyPath: 'restaurantId'});
                case 2:
                    const reviewsToUpdateStore = upgradeDB.createObjectStore('reviews-to-update', {keyPath: 'updatedAt'});
                case 3:
                    const favoritesToUpdateStore = upgradeDB.createObjectStore('favorites-to-update', {keyPath: 'id'});
                    
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
    
    addReviewToUpdateList(review) {
        return this.dbPromise.then(db => {
            const tx = db.transaction('reviews-to-update', 'readwrite');
            const reviewsToUpdateStore = tx.objectStore('reviews-to-update');
            reviewsToUpdateStore.put(review);
            return tx.complete;
        });
    }

    getReviewUpdateList() {
        return this.dbPromise.then(db => {
            const tx = db.transaction('reviews-to-update');
            const reviewsToUpdateStore = tx.objectStore('reviews-to-update');
            return reviewsToUpdateStore.getAll();
        });
    }

    removeReviewFromUpdateList(reivew) {
        return this.dbPromise.then(db => {
            const tx = db.transaction('reviews-to-update', 'readwrite');
            const reviewsToUpdateStore = tx.objectStore('reviews-to-update');
            reviewsToUpdateStore.delete(reivew.updatedAt);
            return tx.complete;
        });
    }

    addFavoriteToUpdateList(restaurant) {
        return this.dbPromise.then(db => {
            const tx = db.transaction('favorites-to-update', 'readwrite');
            const reviewsToUpdateStore = tx.objectStore('favorites-to-update');
            reviewsToUpdateStore.put(restaurant);
            return tx.complete;
        });
    }

    getFavoritesUpdateList() {
        return this.dbPromise.then(db => {
            const tx = db.transaction('favorites-to-update');
            const favoritesToUpdateStore = tx.objectStore('favorites-to-update');
            return favoritesToUpdateStore.getAll();
        });
    }

    removeReviewFromUpdateList(restaurant) {
        return this.dbPromise.then(db => {
            const tx = db.transaction('favorites-to-update', 'readwrite');
            const favoritesToUpdateStore = tx.objectStore('favorites-to-update');
            favoritesToUpdateStore.delete(restaurant.id);
            return tx.complete;
        });
    }
}
