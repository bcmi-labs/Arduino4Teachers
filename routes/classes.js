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

//list all classes, create a class, remove a class, list all students in a class, add a student in a class, remove a student from a class, update an attribute (name, description)

//GET list of all classes
router.get('/', isAuthenticated, function(req, res, next) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{
        var db = req.db;
        var classes = db.get('classes');
        classes.find({},{fields : {name: 1}},function(err,myClasses){
            if(err){
                res.status(500).json({error: err});
            }
            else{
                res.json(myClasses);
            }
        });        
    }
});

//GET details of a class
router.get('/:id/', isAuthenticated, function(req, res, next) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{
        var db = req.db;
        var classes = db.get('classes');
        var classToShow = req.params.id;
        classes.findOne({ _id: classToShow },{},function(err,myClass){
            if(err){
                res.status(500).json({error: err});
            }
            else if(myClass == null){
                res.status(404).json({ error: "Class with id '" + classToShow + "' does not exist."});
            }else{            
                res.json(myClass);
            }
        });
    }
});

//POST add a class
//{"name": "", "description": ""}
router.post('/', isAuthenticated, function(req, res) {
        if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{
        var db = req.db;
        var classes = db.get('classes');
        if(req.body.name == undefined || req.body.description == undefined){
            res.status(400).json({error: "Missing parameters: name and description are mandatory."});
        }
        else{
            classes.insert(req.body, function(err, myClass){
                if(err === null){
                    res.json(myClass);
                }
                else{
                    res.status(500).json({ error: err });
                }
            });        
        }
    }
});

//DELETE delete a class
router.delete('/:id', isAuthenticated, function(req, res) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{
        var db = req.db;
        var classes = db.get('classes');
        var classToDelete = req.params.id;
        classes.findOne({_id: classToDelete},{}, function(err, myClass){
            if(err){
                res.status(500).json({error: err});
            }
            else if(myClass == null){
                res.status(404).json({ error: "Class with id '" + classToDelete + "' does not exist."});
            }
            else{
                classes.remove({ _id: classToDelete }, function(err,myClass) {
                    if(err === null){
                        res.json({});
                    }
                    else{
                        res.status(500).json({ error: err });
                    }
                });
            }
        });
    }
});
    
//PUT update one or more attribute of a class (name, description)
//"{"name": "", "description": ""}
router.put('/:id', isAuthenticated, function(req, res) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{
        var extend = require('util')._extend
        var db = req.db;
        var classes = db.get('classes');
        var classToUpdate = req.params.id;    
        classes.findOne({ _id: classToUpdate },{}, function(err, myClass){
            if(err){
                res.status(500).json({error: err});
            }
            else if(myClass == null){
                res.status(404).json({ error: "Class with id '" + classToUpdate + "' does not exist."});
            }
            else{
                classes.update({ _id: classToUpdate }, {$set: req.body}, function(err) {
                    
                    var newClass = extend({},{ _id: classToUpdate });
                    extend(newClass,  req.body);
                    
                    if(err === null){
                        res.json(newClass);
                    }
                    else{
                        res.status(500).json({ error: err });
                    }
                });
            }
        });
    }
});

//GET list of all students in a class
router.get('/:id/students', isAuthenticated, function(req, res, next) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{    
        var db = req.db;
        var classToShow = req.params.id;
        var classes = db.get('classes');
        var students = db.get('students');
        classes.findOne({_id: classToShow}, function(err, myClass){
            if(err){
                res.status(500).json({error: err});
            }
            else if(myClass == null){
                res.status(404).json({ error: "Class with id '" + classToShow + "' does not exist."});
            }
            else{
                if(myClass.students != undefined){
                    students.find({ _id: { $in: myClass.students } },{},function(err,studentList){ 
                        if(err){
                            res.status(500).json({error: err});
                        }
                        else{
                            res.json(studentList);
                        }
                    });
                }
                else{
                    res.json([]);
                }
            }
        });
    }
});

//PUT add a student in a class
router.put('/:class_id/students/:student_id', isAuthenticated, function(req, res) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{
        var db = req.db;
        var mongo = req.mongo;
        var ObjectId = mongo.ObjectID
        var classToModify = req.params.class_id;
        var studentToAdd = req.params.student_id;
        var classes = db.get('classes');
        var students = db.get('students');
        classes.findOne({_id: classToModify}, function(err, myClass){
            if(err){
                res.status(500).json({error: err});
            }
            else if(myClass == null){
                res.status(404).json({ error: "Class with id '" + classToModify + "' does not exist."});
            }
            else{
                students.findOne({ _id: studentToAdd },{},function(err,myStudent){ 
                    if(err){
                        res.status(500).json({error: err});
                    }
                    else if(myStudent == null){
                        res.status(404).json({ error: "Student with id '" + studentToAdd + "' does not exist."});
                    }
                    else{
                        classes.update({ '_id' : classToModify }, {$push: {students: ObjectId(studentToAdd)}}, function(err) {
                            if(err === null){
                                res.json({});
                            }
                            else{
                                res.status(500).json({ error: err });
                            }
                        });
                    }
                });
            }
        });
    }
});


//DELETE delete a student from a class
router.delete('/:class_id/students/:student_id', isAuthenticated, function(req, res) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{
        var db = req.db;
        var mongo = req.mongo;
        var ObjectId = mongo.ObjectID
        var classToModify = req.params.class_id;
        var studentToRemove = req.params.student_id;
        var classes = db.get('classes');
        var students = db.get('students');
        classes.findOne({_id: classToModify}, function(err, myClass){
            if(err){
                res.status(500).json({error: err});
            }
            else if(myClass == null){
                res.status(404).json({ error: "Class with id '" + classToModify + "' does not exist."});
            }
            else{
                students.findOne({ _id: studentToRemove },{},function(err,myStudent){ 
                    if(err){
                        res.status(500).json({error: err});
                    }
                    else if(myStudent == null){
                        res.status(404).json({ error: "Student with id '" + studentToRemove + "' does not exist."});
                    }
                    else{
                        classes.update({ '_id' : classToModify }, {$pull: {students: ObjectId(studentToRemove)}}, function(err) {
                            if(err === null){
                                res.json({});
                            }
                            else{
                                res.status(500).json({ error: err });
                            }
                        });
                    }
                });
            }
        });
    }
});



module.exports = router;
