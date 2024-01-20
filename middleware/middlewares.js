module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Debes iniciar sesión primero!');
    return res.redirect('/login');
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  try {
    if (req.user.id !== process.env.ADMIN) {
      req.flash('error', 'No autorizado.');
      return res.redirect('/login');
    }
  } catch (error) {
    req.flash('error', 'No autorizado.');
    return res.redirect('/login');
  }
  next();
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
      if (err) {
          return next(err);
      }
      req.flash('success', 'Sesión cerrada correctamente.');
      res.redirect('/shop');
  });
};