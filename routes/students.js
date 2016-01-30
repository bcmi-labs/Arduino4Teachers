/*
 * Apache License
 *                           Version 2.0, January 2004
 *                        http://www.apache.org/licenses/
 * 
 * Copyright (c) 2016 Francesco Longo
 */

var express = require('express');
var router = express.Router();

//list all students, create a student, remove a student, update an attribute (name, surname, age, gender, username, password

// GET list of all students
router.get('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('students');
    collection.find({},{},function(err,docs){
        res.json(docs);
    });
});

// GET details of a student
router.get('/:id/details', function(req, res, next) {
    var db = req.db;
    var collection = db.get('students');
    var studentToShow = req.params.id;
    collection.find({ '_id': studentToShow },{},function(err,docs){
        res.json(docs);
    });
});

//POST add a student
router.post('/', function(req, res) {
    var db = req.db;
    var collection = db.get('students');
    collection.insert(req.body, function(err, docs){
        res.json((err === null) ? { '_id': docs._id } : { msg: err });
    });
});

//DELETE delete a student
router.delete('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('students');
    var studentToDelete = req.params.id;
    collection.remove({ '_id' : studentToDelete }, function(err,docs) {
        res.json((err === null) ? {} : { msg:'error: ' + err });
    });
});

//PUT update one or more attribute of a student (name, surname, age, gender, username, password)
router.put('/:id', function(req, res) {
    var extend = require('util')._extend
    var db = req.db;
    var collection = db.get('students');
    var studentToUpdate = req.params.id;
    var output = extend({},{ '_id' : studentToUpdate });
    extend(output,  req.body);
    collection.update({ '_id' : studentToUpdate }, req.body, function(err) {
        res.json((err === null) ? output  : { msg:'error: ' + err });
    });
});


module.exports = router;
