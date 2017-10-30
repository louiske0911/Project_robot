var express = require('express');
var router = express.Router();

/* router */
module.exports = function(passport){  
  router.post('/', passport.authenticate('local', {
      successRedirect: '/login/success',
      failureRedirect: '/login/failed'})
  );

  router.get('/failed', function(req, res) {
    res.status(401);        
    res.json({status_code: 401, error: 'Login failed'});
  });

  router.get('/success', function(req, res) {
    res.send(req.user + ' Login Successfully');
  }); 

  router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
  });

  return router;
}

// module.exports = router;

