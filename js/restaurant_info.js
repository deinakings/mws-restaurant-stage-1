let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.newMap = L.map('map', {
                center: [restaurant.latlng.lat, restaurant.latlng.lng],
                zoom: 16,
                scrollWheelZoom: false
            });
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
                mapboxToken: 'pk.eyJ1IjoiZGVpbmFraW5ncyIsImEiOiJjamtyaHJwZjIwNThlM3BwanE4MnYwaHdhIn0.nVy5emZV82Q7kkSWFRdVGg',
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox.streets'
            }).addTo(newMap);
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
        }
    });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        dbHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const formId = document.getElementById('restaurant_id');
    formId.setAttribute('value', restaurant.id);

    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img'
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = "Image of the restaurant " + restaurant.name;

    const favoriteIcon = document.getElementById('favorite-icon');
    if (stringToBoolean(restaurant['is_favorite'])) {
        favoriteIcon.classList.add('favorite');
        favoriteIcon.setAttribute('aria-label', `Remove from favorites restaurant ${restaurant.name}`);
    } else {
        favoriteIcon.classList.remove('favorite');
        favoriteIcon.setAttribute('aria-label', `Add to favorites restaurant ${restaurant.name}`);
    }

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const reviewHeader = document.createElement('div');
    const name = document.createElement('p');

    name.innerHTML = review.name;
    name.className = 'name';
    reviewHeader.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = review.date;
    date.className = 'date';
    reviewHeader.appendChild(date);

    reviewHeader.className='review-header';
    li.appendChild(reviewHeader);

    const rating = document.createElement('p');
    rating.className = 'rating';
    const ratingSpan = document.createElement('span');
    ratingSpan.innerHTML = `Rating: ${review.rating}`;
    rating.appendChild(ratingSpan);
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// add listener for favorite icon
document.getElementById('favorite-icon').addEventListener('click', event => {
    const isFavorite = stringToBoolean(self.restaurant['is_favorite'])
    self.restaurant['is_favorite'] = !isFavorite;

    if (self.restaurant['is_favorite']) {
        event.target.classList.add('favorite');
    } else {
        event.target.classList.remove('favorite');
    }
    // @TODO make post call
    // @TODO if error revert state
    dbHelper.updateFavorite(self.restaurant);
});

document.getElementById('add-review-button').addEventListener('click', event => {
    event.preventDefault();
    const form = document.getElementById('review-form');
    const formElements = form.elements;
    const newReview = {
        'restaurant_id': formElements['restaurant_id'].value,
        'name': formElements['name'].value,
        'rating': formElements['rating'].value,
        'comments': formElements['comments'].value     
    }
    dbHelper.addReview(newReview).then(() => {
        form.reset();
    });
    console.log(event);
});
