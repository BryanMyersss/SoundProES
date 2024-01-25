module.exports = (pickupDate, returnDate) => {
    if (!(pickupDate && returnDate)) {
      return('Fechas no seleccionadas!');
    }
    // Convert the input strings to Date objects
    const startDate = new Date(pickupDate);
    const endDate = new Date(returnDate);

    // Check if startDate is after endDate
    if (startDate >= endDate) {
      return('La fecha de devolución debe ser posterior a la fecha de recogida!');
    }

    // Calculate the difference in milliseconds
    const timeDifference = endDate - startDate;

    // Calculate the difference in days
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

    const maxDays = process.env.MAXRENTALDAYS || 7;

    if (daysDifference > (maxDays - 1)) {
      return(`Máximo ${maxDays} dias de alquiler!`);
    }
    
    // Check if there is at least one day difference
    if (daysDifference < 1) {
      return('Debe haber al menos un día entre las fechas de recogida y devolución!')
    }
};
