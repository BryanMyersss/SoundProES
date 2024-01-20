// Js for user icon dropdown menu

try {
  document.addEventListener('DOMContentLoaded', function () {
  
    const accountLink = document.querySelector('#account_link')
  
    accountLink.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent the default behavior of the anchor tag
    });
      
    const accountContainer = document.querySelector('.navbar-account-container');
    const accountMenu = accountContainer.querySelector('.navbar-account-menu');
  
    accountContainer.addEventListener('click', function (event) {
      accountMenu.classList.toggle('fade-in'); // Toggle the fade-in class on click
      event.stopPropagation(); // Prevent the click event from propagating
    });
  
    // Add a click event listener to the menu itself to stop event propagation
    accountMenu.addEventListener('click', function (event) {
      event.stopPropagation(); // Prevent the click event from propagating
    });
  
    document.addEventListener('click', function (event) {
      if (!accountContainer.contains(event.target)) {
        accountMenu.classList.remove('fade-in'); // Remove fade-in class if clicked outside the menu
      }
    });
  });
} catch (error) {
  console.log(error);
}