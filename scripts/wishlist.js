function togglePopularHeart(button) {
  const icon = button.querySelector('.heart-icon');
  const card = button.closest('.location-card');

  const locationName =
    card?.querySelector('.card-info h3')?.textContent.trim() || 'location';

  const isActive = button.classList.toggle('active');

  if (icon) {
   if (isActive) {
  icon.classList.remove('fa-regular');
  icon.classList.add('fa-solid');

  // Restart animation
  icon.style.animation = 'none';

  requestAnimationFrame(() => {
    icon.style.animation = '';
  });
 const buttonRect = button.getBoundingClientRect();

createHeartParticles(
  buttonRect.left + buttonRect.width / 2,
  buttonRect.top + buttonRect.height / 2
);

} else {
  icon.classList.remove('fa-solid');
  icon.classList.add('fa-regular');
}
  }

  button.setAttribute(
    'aria-label',
    isActive
      ? `Remove ${locationName} from wishlist`
      : `Add ${locationName} to wishlist`
  );

  saveHomeWishlistState(locationName, isActive);
  updateHomeWishlistBadge();

  if (isActive) {
    animateHeartToHeader(button);
  }
}

function animateHeartToHeader(sourceButton) {
  const headerWishlist =
    document.querySelector('.wishlist-btn') ||
    document.querySelector('.wishlist-icon') ||
    document.querySelector('[aria-label="Wishlist"]');

  if (!headerWishlist) return;

  const sourceRect = sourceButton.getBoundingClientRect();
  const targetRect = headerWishlist.getBoundingClientRect();

  const flyingHeart = document.createElement('span');

  flyingHeart.textContent = '♥';
  flyingHeart.className = 'flying-wishlist-heart';

 flyingHeart.style.left =
  `${sourceRect.left + sourceRect.width / 2}px`;

flyingHeart.style.top =
  `${sourceRect.top + sourceRect.height / 2 - 12}px`;
  document.body.appendChild(flyingHeart);

 const startX = sourceRect.left + sourceRect.width / 2;
const startY = sourceRect.top + sourceRect.height / 2 - 12;

const endX = targetRect.left + targetRect.width / 2;
const endY = targetRect.top + targetRect.height / 2;

const moveX = endX - startX;
const moveY = endY - startY;

flyingHeart.animate(
  [
    {
      transform: 'translate(-50%, -50%) scale(0.6)',
      opacity: 0
    },
    {
      transform: `
        translate(
          calc(-50% + ${moveX * 0.15}px),
          calc(-50% + ${moveY * 0.15 - 35}px)
        )
        scale(1.35)
        rotate(-10deg)
      `,
      opacity: 1,
      offset: 0.22
    },
    {
      transform: `
        translate(
          calc(-50% + ${moveX * 0.65}px),
          calc(-50% + ${moveY * 0.65 - 55}px)
        )
        scale(1)
        rotate(8deg)
      `,
      opacity: 1,
      offset: 0.65
    },
    {
      transform: `
        translate(
          calc(-50% + ${moveX}px),
          calc(-50% + ${moveY}px)
        )
        scale(0.35)
        rotate(15deg)
      `,
      opacity: 0
    }
  ],
  {
    duration: 1100,
    easing: 'cubic-bezier(.22,.8,.32,1)',
    fill: 'forwards'
  }
);

  setTimeout(() => {
    flyingHeart.remove();
  }, 1150);
}

function getHomeWishlist() {
  try {
    return JSON.parse(
      localStorage.getItem('roamly_home_wishlist')
    ) || [];
  } catch (error) {
    console.error('Unable to read home wishlist:', error);
    return [];
  }
}

function saveHomeWishlistState(locationName, isActive) {
  const wishlist = getHomeWishlist();

  const updatedWishlist = isActive
    ? [...new Set([...wishlist, locationName])]
    : wishlist.filter((name) => name !== locationName);

  localStorage.setItem(
    'roamly_home_wishlist',
    JSON.stringify(updatedWishlist)
  );
}

function restoreHomeWishlistState() {
  const wishlist = getHomeWishlist();

  document.querySelectorAll('.location-card').forEach((card) => {
    const locationName =
      card.querySelector('.card-info h3')?.textContent.trim();

    const button = card.querySelector('.popular-heart-btn');
    const icon = button?.querySelector('.heart-icon');

    if (!locationName || !button || !icon) return;

    const isSaved = wishlist.includes(locationName);

    button.classList.toggle('active', isSaved);

    if (isSaved) {
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
    } else {
      icon.classList.remove('fa-solid');
      icon.classList.add('fa-regular');
    }
  });
}

function updateHomeWishlistBadge() {
  const wishlist = getHomeWishlist();

  const badge = document.querySelector(
    '.icon-btn[aria-label="Wishlist"] .badge'
  );

  if (badge) {
    badge.textContent = wishlist.length;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  restoreHomeWishlistState();
  updateHomeWishlistBadge();
});
function createHeartParticles(x, y) {

  for (let i = 0; i < 8; i++) {

    const particle = document.createElement('span');
    particle.className = 'heart-particle';

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    document.body.appendChild(particle);

    const angle = (Math.PI * 2 / 8) * i;
    const distance = 25 + Math.random() * 15;

    particle.animate(
      [
        {
          transform: 'translate(-50%,-50%) scale(1)',
          opacity: 1
        },
        {
          transform: `translate(
            calc(-50% + ${Math.cos(angle) * distance}px),
            calc(-50% + ${Math.sin(angle) * distance}px)
          ) scale(0)`,
          opacity: 0
        }
      ],
      {
        duration: 450,
        easing: 'ease-out',
        fill: 'forwards'
      }
    );

    setTimeout(() => particle.remove(), 450);
  }

}