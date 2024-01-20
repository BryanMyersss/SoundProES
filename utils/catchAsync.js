// we pass in an entire function as a parameter, functions can call the method .catch

module.exports = func => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  }
}