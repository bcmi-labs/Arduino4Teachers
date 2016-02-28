var LocalStrategy = require('passport-local').Strategy;

//reading configuration file
var nconf = require('nconf');
nconf.file ({file: process.cwd()+'/routes/settings.json'});
var administrator = nconf.get('config:administrator');

module.exports = function(passport){

	passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            
            if(username === administrator.username && isValidPassword(administrator.password, password)){
                
                return done(null, {_id: "000000000000000000000000", username: username});
            }
            else {
                var db = req.db;
                var students = db.get('students');
                students.findOne({username: username},{},function(err,myStudent){
                    if(err){
                        return done({error: err});
                    }
                    else if(myStudent == null){
                        return done(null, false);
                    }
                    else{
                        if(isValidPassword(myStudent.password, password)){
                            return done(null, {_id: myStudent._id, username: username});
                        }
                        else{
                            return done(null, false);
                        }                    
                    }
                });
            }            
        })
    );    
    
        var isValidPassword = function(storedPassword, inputPassword){            
            if (storedPassword === inputPassword)
                return true;
            else
                return false;
        }
}

    
