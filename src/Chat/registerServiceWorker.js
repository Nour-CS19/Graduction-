// Checks if we're running on localhost. This matters because service workers
// behave slightly differently on localhost for development purposes.
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

/**
 * Registers the service worker if the app is running in production mode.
 * This enables assets to be served from local cache for faster subsequent loads.
 */
export default function register() {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // Construct the public URL to check if PUBLIC_URL is on the same origin.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location);
    if (publicUrl.origin !== window.location.origin) {
      // If PUBLIC_URL is on a different origin, service worker registration is skipped.
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Running on localhost. Check if a service worker already exists and is valid.
        checkValidServiceWorker(swUrl);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is served cache-first by a service worker (localhost).'
          );
        });
      } else {
        // Not localhost. Simply register the service worker.
        registerValidSW(swUrl);
      }
    });
  }
}

/**
 * Registers a valid service worker with the given URL.
 * @param {string} swUrl - The URL of the service worker script.
 */
function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Listen for updates to the service worker.
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available; prompt refresh.
                console.log('New content is available; please refresh.');
              } else {
                // Content is cached for offline use.
                console.log('Content is cached for offline use.');
              }
            }
          };
        }
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

/**
 * Checks if the service worker can be found on the server.
 * If not, it unregisters the current service worker and reloads the page.
 * @param {string} swUrl - The URL of the service worker script.
 */
function checkValidServiceWorker(swUrl) {
  fetch(swUrl)
    .then((response) => {
      // Ensure we are getting a JavaScript file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Unregister the existing one.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed with registration.
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

/**
 * Unregisters the service worker.
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
