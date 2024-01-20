module.exports = (pickupDate, returnDate) => {
  // Convert the input strings to Date objects
  const startDate = new Date(pickupDate);
  const endDate = new Date(returnDate);

  // Check if startDate is after endDate
  if (startDate >= endDate) {
    throw new Error('Return date must be after pickup date');
  }

  // Calculate the difference in milliseconds
  const timeDifference = endDate - startDate;

  // Calculate the difference in days
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

  // Check if there is at least one day difference
  if (daysDifference < 1) {
    throw new Error('There must be at least one day between pickup and return dates');
  }

  // Return true if validation passes
  return true;
}