var login = require('./login');

module.exports = function(passport){
    
    passport.serializeUser(function(user, done) {
        //console.log('serializing user: ');console.log(user);
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        //console.log('deserializing user:');console.log(user);
        done(null, user);
    });
        
    login(passport);
}