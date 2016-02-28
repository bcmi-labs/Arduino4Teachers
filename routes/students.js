/*
 * Apache License
 *                           Version 2.0, January 2004
 *                        http://www.apache.org/licenses/
 * 
 * Copyright (c) 2016 Francesco Longo
 */

var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.status(401).json({error: "You are not authenticated to the system."});
}

// GET list of all students
router.get('/', isAuthenticated, function(req, res) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{
        var db = req.db;
        var students = db.get('students');
        students.find({},{fields : {name: 1, surname: 1, username: 1}},function(err,studentList){
            if(err){
                res.status(500).json({error: err});
            }
            else{
                res.json(studentList);
            }
        });
    }
});

// GET details of a student
router.get('/:id/', isAuthenticated, function(req, res) {
    var db = req.db;
    var students = db.get('students');
    var studentToShow = req.params.id;
    students.findOne({ '_id': studentToShow },{fields: {password: 0}},function(err,myStudent){
        if(err){
            res.status(500).json({error: err});
        }
        else if(myStudent == null){
            if(req.user.username == 'teacher'){
                res.status(404).json({ error: "Student with id '" + studentToShow + "' does not exist."});
            }else{
                res.status(403).json({error: "You are not authorized to perform such an operation."});
            }            
        }else{
            if(req.user.username == 'teacher' || req.user.username == myStudent.username){
                res.json(myStudent);
            }
            else{
                res.status(403).json({error: "You are not authorized to perform such an operation."});
            }
        }
    });
});

//POST add a student
router.post('/', function(req, res) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{
        var db = req.db;
        var students = db.get('students');
        if(req.body.name == undefined || req.body.surname == undefined || req.body.username == undefined || req.body.password == undefined){
            res.status(400).json({error: "Missing parameters: name, surname, username, and password are mandatory."});
        }
        else{
            students.findOne({username: req.body.username},{},function(err,myStudent){
                if(err){
                    res.status(500).json({error: err});
                }
                else if(myStudent == null){
                    students.insert(req.body, function(err, myStudent){
                        if(err === null){
                            res.json(myStudent);
                        }
                        else{
                            res.status(500).json({ error: err });
                        }
                    });
                }
                else{
                    res.status(400).json({error: "Student with username " + req.body.username + " already exists."});
                }
            });
        }
    }
});

//DELETE delete a student
router.delete('/:id', function(req, res) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{

        var db = req.db;
        var students = db.get('students');
        var classes = db.get('classes');
        classes.options.multi = true
        var environments = db.get('environments');
        var cu = require('./container_utils');
        var container_utils = new cu;
        var studentToDelete = req.params.id;
        var mongo = req.mongo;
        var ObjectId = mongo.ObjectID
        students.findOne({_id: studentToDelete},{}, function(err, myStudent){
            if(err){
                res.status(500).json({error: err});
            }
            else if(myStudent == null){
                res.status(404).json({ error: "Student with id '" + studentToDelete + "' does not exist."});
            }
            else{
                classes.update({}, {$pull: {students: ObjectId(studentToDelete)}}, function(err, updatedClasses){
                    if(err){
                        res.status(500).json({error: err});
                    }else{
                        environments.find({owner: studentToDelete},{stream: true}).each(function(myEnvironment){
                            container_utils.stop_container_if_started(studentToDelete+"."+myEnvironment.name, function(err, result){
                                if(err){
                                    console.log(err);
                                    console.log("DELETE A STUDENT: error stopping container " + studentToDelete+"."+myEnvironment.name + ". It will live as an orphan.");
                                    //Here I should remove the owner
                                }
                                else{
                                    container_utils.destroy_container(studentToDelete+"."+myEnvironment.name, function(err, result){ 
                                        if(err){
                                            console.log(err);
                                            console.log("DELETE A STUDENT: error destroying container " + studentToDelete+"."+myEnvironment.name + ". It will live as an orphan.");
                                            //Here I should remove the owner
                                        }
                                        else{
                                            environments.remove({ '_id' : myEnvironment._id }, function(err, result) {
                                                if(err){
                                                    console.log(err);
                                                    console.log("DELETE A STUDENT: error removing container from DB");
                                                }
                                            });
                                        } 
                                    });
                                }
                            });
                        }).error(function(err){
                            res.status(500).json({error: err});
                        }).success(function(){
                            students.remove({ '_id' : studentToDelete }, function(err,myStudent) {
                                if(err === null){
                                    res.json({});
                                }else{
                                    res.status(500).json({ error: err });
                                }
                            });  
                        });  
                    }
                });
            }
        });
    }
});

//PUT update one or more attribute of a student (name, surname, age, gender, username, password)
router.put('/:id', function(req, res) {
    var extend = require('util')._extend
    var db = req.db;
    var students = db.get('students');
    var studentToUpdate = req.params.id;
    students.findOne({ _id: studentToUpdate },{}, function(err, myStudent){
        if(err){
            res.json(err);
        }
        else if(myStudent == null){
            if(req.user.username == 'teacher'){
                res.status(404).json({ error: "Student with id '" + studentToUpdate + "' does not exist."});
            }else{
                res.status(403).json({error: "You are not authorized to perform such an operation."});
            }
        }
        else{
            if(req.user.username == 'teacher' || req.user.username == myStudent.username){
                students.update({ '_id' : studentToUpdate }, {$set: req.body}, function(err) {
                    
                    var newStudent = extend({},{ '_id' : studentToUpdate });
                    extend(newStudent,  req.body);
                    
                    if(err === null){
                        res.json(newStudent);
                    }else{
                        res.status(500).json({ error: err })
                    }
                });
            }
            else{
                res.status(403).json({error: "You are not authorized to perform such an operation."});
            }
        }
    });
});


module.exports = router;
