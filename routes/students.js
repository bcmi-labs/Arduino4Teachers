/*
 * Apache License
 *                           Version 2.0, January 2004
 *                        http://www.apache.org/licenses/
 * 
 * Copyright (c) 2016 Francesco Longo
 */

var express = require('express');
var router = express.Router();

// GET list of all students
router.get('/', function(req, res, next) {
    var db = req.db;
    var students = db.get('students');
    students.find({},{fields : {name: 1, surname: 1, username: 1}},function(err,docs){
        if(err){
            res.json({error: err});
        }
        else{
            res.json(docs);
        }
    });
});

// GET details of a student
router.get('/:id/', function(req, res, next) {
    var db = req.db;
    var students = db.get('students');
    var studentToShow = req.params.id;
    students.findOne({ '_id': studentToShow },{fields: {password: 0}},function(err,docs){
        if(err){
            res.json({error: err});
        }
        else if(docs == null){
            res.status(404).json({ error: "Student with id '" + studentToShow + "' does not exist."});
        }else{            
            res.json(docs);

        }
    });
});

//POST add a student
router.post('/', function(req, res) {
    var db = req.db;
    var students = db.get('students');
    if(req.body.name == undefined || req.body.surname == undefined || req.body.username == undefined || req.body.password == undefined){
        res.status(400).json({error: "Missing parameters: name, surname, username, and password are mandatory."});
    }
    else{
        students.findOne({username: req.body.username},{},function(err,docs){
            if(err){
                res.json({error: err});
            }
            else if(docs == null){
                students.insert(req.body, function(err, docs){
                    res.json((err === null) ? docs : { error: err });
                });
            }
            else{
                res.status(400).json({error: "Student with username " + req.body.username + " already exists."});
            }
        });
    }
});

//DELETE delete a student
router.delete('/:id', function(req, res) {
    var db = req.db;
    var students = db.get('students');
    var studentToDelete = req.params.id;
    students.findOne({_id: studentToDelete},{}, function(err, docs){
        if(err){
            res.json({error: err});
        }
        else if(docs == null){
            res.status(404).json({ error: "Student with id '" + studentToDelete + "' does not exist."});
        }
        else{
            students.remove({ '_id' : studentToDelete }, function(err,docs) {
                res.json((err === null) ? {} : { error: err });
            });
        }
    });
});

//PUT update one or more attribute of a student (name, surname, age, gender, username, password)
router.put('/:id', function(req, res) {
    var extend = require('util')._extend
    var db = req.db;
    var students = db.get('students');
    var studentToUpdate = req.params.id;
    students.findOne({ _id: studentToUpdate },{}, function(err, docs){
        if(err){
            res.json(err);
        }
        else if(docs == null){
            res.status(404).json({ error: "Student with id '" + studentToUpdate + "' does not exist."});
        }
        else{
            students.update({ '_id' : studentToUpdate }, req.body, function(err) {
                
                var newStudent = extend({},{ '_id' : studentToUpdate });
                extend(newStudent,  req.body);
                
                res.json((err === null) ? newStudent : { error: err });
            });
        }
    });
});


module.exports = router;
