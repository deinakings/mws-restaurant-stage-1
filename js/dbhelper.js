/**
 * Common database helper functions.
 */
class DBHelper {
    
    constructor() {
        this.idbHelper = new IDBHelper();
    }

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        const port = 1337 // Change this to your server port
        const domain = 'localhost';
        const protocol = 'http';
        return `${protocol}://${domain}:${port}`;
    }

    /**
     * Fetch all restaurants.
     */
    fetchRestaurants(callback) {
        this.idbHelper.getRestaurants().then(restaurants => {
            if (restaurants) {
                // if we have restaurants in the DB return them fist
                callback(null, restaurants);
                // then call the restaurants endpoint for updates.
                this.fetchAndSaveRestaurants();
            } else {
                // if there is no data in DB call the restaurants endpoint.
                this.fetchAndSaveRestaurants(callback);
            }
        });
    }

    /**
     * Fetch all restaurants and save them in IDB.
     * @param {Function} callback - a callback function.
     */
    fetchAndSaveRestaurants(callback) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${DBHelper.DATABASE_URL}/restaurants`);
        xhr.onload = () => {
            if (xhr.status === 200) { // Got a success response from server!
                const json = JSON.parse(xhr.responseText);
                const restaurants = json;
                this.idbHelper.saveRestaurants(restaurants)
                    .then(() => console.log('restaurants saved to indexedDB!'))
                    .catch(err => console.error('error saving to indexedDB:', err));
                if (callback) {
                    callback(null, restaurants);
                }
            } else { // Oops!. Got an error from server.
                const error = (`Request failed. Returned status of ${xhr.status}`);
                if (callback) {
                    callback(error, null);
                }
            }
        };
        xhr.send();
    }

    /**
     * Fetch a restaurant by its ID.
     */
    fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        this.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    this.getReviews(restaurant.id)
                        .then(response => {
                            restaurant.reviews = response;
                            callback(null, restaurant);
                        })
                        .catch(err => {
                            console.error('Error getting reviews: ', err);
                            callback(null, restaurant);
                        });
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        this.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        this.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        this.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    fetchNeighborhoods(callback) {
        // Fetch all restaurants
        this.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    fetchCuisines(callback) {
        // Fetch all restaurants
        this.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        let photograph = restaurant.photograph;
        if (!photograph) {
            photograph = restaurant.id;
        }
        return (`/img/${photograph}.jpg`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        // https://leafletjs.com/reference-1.3.0.html#marker  
        const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
            {
                title: restaurant.name,
                alt: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant)
            })
        marker.addTo(newMap);
        return marker;
    }

    /**
     * update a restaurant to idb
     * @param {object} restaurant
     * @returns {Promise} a promise.
     */
    updateRestaurant(restaurant) {
        // update local db
        return this.idbHelper.updateRestaurant(restaurant)
            .then(() => console.log('restaurant updated'))
            .catch(err => console.log('error while updating the restaurant', err));
    }

    /**
     * Update favorite state of a restaurant.
     * @param {object} restaurant 
     * @returns {Promise} a promise.
     */
    updateFavorite(restaurant) {
        // update local db
        this.updateRestaurant(restaurant);
        return fetch(
            `${DBHelper.DATABASE_URL}/restaurants/${restaurant.id}/?is_favorite=${restaurant['is_favorite']}`,
            { method: 'PUT' }
        ).then()
        .catch(err => {
            //@TODO: if offline retry when offline.
            //@TODO: if other error remove from cache.
        });
    }

    /**
     * Add a restaurant review
     * @param {Object} review 
     * @returns {Promise} a promise.
     */
    addReview(review) {
        `${DBHelper.DATABASE_URL}/restaurants`
        
        return fetch(`${DBHelper.DATABASE_URL}/reviews/`,
            {
                method: 'POST',
                body: JSON.stringify(review)
            })
            .then(response => response.json())
            .then(response => {
                const restaurantId = Number(response['restaurant_id']);
                this.idbHelper.getReviews(restaurantId)
                    .then(reviewObj => {
                        const reviews = reviewObj.reviews || [];
                        reviews.push(response);
                        this.idbHelper.saveReviewsByRestaurant(restaurantId, reviews);
                    });
                return response;
            });
    }

    /**
     * Get the reviews for a restaurant.
     * First return the local idb copy and then
     * updates with the call to the services.
     * @param {object} restaurantId 
     * @returns {Promise} a promise.
     */
    getReviews(restaurantId) {
        return this.idbHelper.getReviews(restaurantId)
            .then(response => {
                if (response) {
                    // call real endpoint to get updated data
                    // and save it
                    this.getReviewsByRestaurant(restaurantId);
                    return response.reviews;
                } else {
                    // there is no data in idb so call to get updated data.
                    return this.getReviewsByRestaurant(restaurantId);
                }
            });
    }

    /**
     * Get reviews by restaurant.
     * @param {string} restaurantId 
     * @returns {Promise} a promise.
     */
    getReviewsByRestaurant(restaurantId) {
        return fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${restaurantId}`)
            .then(response => response.json())
            .then(response => {
                this.idbHelper.saveReviewsByRestaurant(restaurantId, response);
                return response;
            })
            .catch(err => console.error('There was an error getting reviews: ', err));
    }

    /* static mapMarkerForRestaurant(restaurant, map) {
      const marker = new google.maps.Marker({
        position: restaurant.latlng,
        title: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
        map: map,
        animation: google.maps.Animation.DROP}
      );
      return marker;
    } */
}
