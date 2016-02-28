var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.status(401).json({error: "You are not authenticated to Arduino4Teachers."});
}


module.exports = function(passport){
    
    router.get('/', isAuthenticated, function(req, res, next) {
        res.json({ message: 'Welcome to Arduino4Teachers.' });
    });
    
    router.get('/login-error', function(req, res, next) {
        res.status(401).json({ error: 'Invalid credentials.' });
    });
    
    router.get('/logout-okay', function(req, res, next) {
        res.json({ message: 'Come back to Arduino4Teachers soon.' });
    });
    
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/',
	failureRedirect: '/login-error',
        failureFlash: true
    }));
    
    router.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/logout-okay');
    });


    return router;
}