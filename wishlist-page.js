document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('wishlistPageGrid');

  if (!grid) return;

  const locationData = {
    'Sigiriya': {
      image: 'images/Sigiriya1.jpg',
      rating: '4.9',
      reviews: '2.4k'
    },

    'Ella': {
      image: 'images/Ella1.jpg',
      rating: '4.8',
      reviews: '1.8k'
    },

    'Galle Fort': {
      image: 'images/gallfort1.jpg',
      rating: '4.7',
      reviews: '3.1k'
    },

    'Yala National Park': {
      image: 'images/Yala1.jpg',
      rating: '4.8',
      reviews: '1.2k'
    },

    'Nuwara Eliya': {
      image: 'images/NuwaraEliya1.jpg',
      rating: '4.6',
      reviews: '1.5k'
    },

    'Mirissa Beach': {
      image: 'images/Mirissa1.jpg',
      rating: '4.8',
      reviews: '2.1k'
    }
  };


  function getWishlist() {
    try {
      const saved =
        localStorage.getItem('roamly_home_wishlist');

      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Unable to read wishlist:', error);
      return [];
    }
  }


 function saveWishlist(wishlist) {
  localStorage.setItem(
    'roamly_home_wishlist',
    JSON.stringify(wishlist)
  );

  if (typeof window.refreshWishlistBadge === 'function') {
    window.refreshWishlistBadge();
  }
}


  function renderWishlist() {
    const wishlist = getWishlist();

    grid.innerHTML = '';

    if (!Array.isArray(wishlist) || wishlist.length === 0) {
      grid.innerHTML = `
        <div class="wishlist-empty-state">

          <div class="wishlist-empty-icon">
            <i class="fa-regular fa-heart"></i>
          </div>

          <h2>No saved places yet</h2>

          <p>
            Explore Sri Lanka and save the places
            you would love to visit.
          </p>

          <a
            href="index.html"
            class="wishlist-explore-btn"
          >
            <i class="fa-solid fa-compass"></i>
            Explore Locations
          </a>

        </div>
      `;

      return;
    }


    wishlist.forEach((locationName) => {
      const data = locationData[locationName] || {};

      const card = document.createElement('article');

      card.className =
        'wishlist-destination-card';


      /* IMAGE SECTION */

      const media =
        document.createElement('div');

      media.className =
        'wishlist-card-media';


      const image =
        document.createElement('img');

      image.src =
        data.image ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600';

      image.alt = locationName;


      /* HEART BUTTON */

      const removeButton =
        document.createElement('button');

      removeButton.type = 'button';

      removeButton.className =
        'wishlist-card-heart active';

      removeButton.setAttribute(
        'aria-label',
        `Remove ${locationName} from wishlist`
      );

      removeButton.innerHTML =
        '<i class="fa-solid fa-heart"></i>';


      removeButton.addEventListener(
        'click',
        (event) => {
          event.stopPropagation();

          const updatedWishlist =
            getWishlist().filter(
              (name) => name !== locationName
            );

          saveWishlist(updatedWishlist);

          renderWishlist();
        }
      );


      media.appendChild(image);
      media.appendChild(removeButton);


      /* CARD CONTENT */

      const content =
        document.createElement('div');

      content.className =
        'wishlist-card-content';


      const savedLabel =
        document.createElement('span');

      savedLabel.className =
        'wishlist-saved-label';

      savedLabel.innerHTML = `
        <i class="fa-solid fa-heart"></i>
        Saved
      `;


      const title =
        document.createElement('h3');

      title.textContent = locationName;


      const meta =
        document.createElement('div');

      meta.className =
        'wishlist-card-meta';

      meta.innerHTML = `
        <span class="wishlist-rating">
          <i class="fa-solid fa-star"></i>
          ${data.rating || '4.8'}
        </span>

        <span>
          ${data.reviews || '1k'} reviews
        </span>
      `;


      const explore =
        document.createElement('a');

      explore.className =
        'wishlist-card-action';

      explore.href =
        `destination-detail.html?name=${encodeURIComponent(locationName)}`;

      explore.innerHTML = `
        Explore Destination
        <i class="fa-solid fa-arrow-right"></i>
      `;


      content.appendChild(savedLabel);
      content.appendChild(title);
      content.appendChild(meta);
      content.appendChild(explore);

      card.appendChild(media);
      card.appendChild(content);

      grid.appendChild(card);
    });
  }


  renderWishlist();
});