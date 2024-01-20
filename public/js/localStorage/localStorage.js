  // Function to set data with expiration time in local storage
  function setLocalStorage(key, value, expirationInDays) {
    const expirationTime = new Date().getTime() + expirationInDays * 24 * 60 * 60 * 1000;
    const item = { value, expirationTime };
    localStorage.setItem(key, JSON.stringify(item));
  }
  
  // Function to get data from local storage with expiration check
  function getLocalStorage(key) {
    const itemString = localStorage.getItem(key);
    if (!itemString) {
      return null; // No data found
    }
  
    const item = JSON.parse(itemString);
    const currentTime = new Date().getTime();
  
    if (currentTime > item.expirationTime) {
      localStorage.removeItem(key); // Remove expired data
      return null; // Data has expired
    }
  
    return item.value; // Return valid data
  }
  