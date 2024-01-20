// Currently selects all tags with a class of '.not-available',
// and flashes "currently not available" when clicked

const notAvailableLinks = document.querySelectorAll('.not-available');


/**
 * Flashes a message.
 * @param {string} message - The message to flash.
 * @param {string} status - Default: success. Can be set to error. Only affects color. Set to 'none' for black
 * @param {number} timeout- Default: 3000.
 * @param {string} img - Looks for an image in: static_folder => assets => ...  Example: 'underConstruction.gif'
 */
const customFlash = (message, status = 'success', timeout = 3000, img) => {
  oldFlash = document.querySelector('#flash');
  if(oldFlash) {
    oldFlash.remove();
  }

  let flashClass;
  switch (status) {
    case "success":
      flashClass = 'custom-flash-success';
      break;
    case "error":
      flashClass = 'custom-flash-error';
      break;
    default:
      break;
  }

  let imgCode = '';
  if (img) {
    imgCode = `<img src="../../assets/${img}" alt="" class="crane" >`
  } 

  const flash = document.createElement('div');
  flash.className = 'custom-flash';
  flash.id = 'flash';
  flash.innerHTML = `
    <div class="custom-flash-container">
      <p class=${flashClass}>${message}</p>
      ${imgCode}
    </div>
    <img src="/assets/close.svg" alt="Cerrar alerta" id="flash_close">
  `;

  document.querySelector('.navbar').appendChild(flash);

  const flashCloseButton = document.querySelector('#flash_close');
  flashCloseButton.addEventListener('click', function() {
    flash.style.display = 'none'; // Hide the flash message when the close button is clicked
  });
  
  
  if(timeout) {
    setTimeout(function() {
      flash.classList.add('hidden'); // Remove the flash after 4 seconds
    }, timeout);
    setTimeout(function() {
      flash.remove(); // Remove the flash after 4 seconds
    }, timeout + 1000);
  }
}

notAvailableLinks.forEach(function(link) {
  link.addEventListener('click', function(event) {
    event.preventDefault();
    customFlash('Actualmente no disponible', 'none', undefined, 'underConstruction.gif');
  });
});
