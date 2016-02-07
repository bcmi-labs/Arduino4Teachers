var express = require('express');
var router = express.Router();

//list all classes, create a class, remove a class, list all students in a class, add a student in a class, remove a student from a class, update an attribute (name, description)

//GET list of all classes
router.get('/', function(req, res, next) {
    var db = req.db;
    var classes = db.get('classes');
    classes.find({},{fields : {name: 1}},function(err,myClasses){
        if(err){
            res.json({error: err});
        }
        else{
            res.json(myClasses);
        }
    });
});

//GET details of a class
router.get('/:id/', function(req, res, next) {
    var db = req.db;
    var classes = db.get('classes');
    var classToShow = req.params.id;
    classes.findOne({ _id: classToShow },{},function(err,myClass){
        if(err){
            res.json({error: err});
        }
        else if(myClass == null){
            res.status(404).json({ error: "Class with id '" + classToShow + "' does not exist."});
        }else{            
            res.json(myClass);
        }
    });
});

//POST add a class
//{"name": "", "description": ""}
router.post('/', function(req, res) {
    var db = req.db;
    var classes = db.get('classes');
    if(req.body.name == undefined || req.body.description == undefined){
        res.status(400).json({error: "Missing parameters: name and description are mandatory."});
    }
    else{
        classes.insert(req.body, function(err, myClass){
            res.json((err === null) ? myClass : { error: err });
        });        
    }
});

//DELETE delete a class
router.delete('/:id', function(req, res) {
    var db = req.db;
    var classes = db.get('classes');
    var classToDelete = req.params.id;
    classes.findOne({_id: classToDelete},{}, function(err, myClass){
        if(err){
            res.json({error: err});
        }
        else if(myClass == null){
            res.status(404).json({ error: "Class with id '" + classToDelete + "' does not exist."});
        }
        else{
            classes.remove({ _id: classToDelete }, function(err,myClass) {
                res.json((err === null) ? {} : { error: err });
            });
        }
    });
});
    
//PUT update one or more attribute of a class (name, description)
//"{"name": "", "description": ""}
router.put('/:id', function(req, res) {
    var extend = require('util')._extend
    var db = req.db;
    var classes = db.get('classes');
    var classToUpdate = req.params.id;    
    classes.findOne({ _id: classToUpdate },{}, function(err, myClass){
        if(err){
            res.json({error: err});
        }
        else if(myClass == null){
            res.status(404).json({ error: "Class with id '" + classToUpdate + "' does not exist."});
        }
        else{
            classes.update({ _id: classToUpdate }, req.body, function(err) {
                
                var newClass = extend({},{ _id: classToUpdate });
                extend(newClass,  req.body);
                
                res.json((err === null) ? newClass : { error: err });
            });
        }
    });
});

//GET list of all students in a class
router.get('/:id/students', function(req, res, next) {
    var db = req.db;
    var classToShow = req.params.id;
    var classes = db.get('classes');
    var students = db.get('students');
    classes.findOne({_id: classToShow}, function(err, myClass){
        if(err){
            res.json({error: err});
        }
        else if(myClass == null){
            res.status(404).json({ error: "Class with id '" + classToShow + "' does not exist."});
        }
        else{
            students.find({ _id: { $in: myClass.students } },{},function(err,studentList){ 
                if(err){
                    res.json({error: err});
                }
                else{
                    res.json(studentList);
                }
            });
        }
    });
});

//PUT add a student in a class
router.put('/:class_id/students/:student_id', function(req, res) {
    var db = req.db;
    var mongo = req.mongo;
    var ObjectId = mongo.ObjectID
    var classToModify = req.params.class_id;
    var studentToAdd = req.params.student_id;
    var classes = db.get('classes');
    var students = db.get('classes');
    classes.findOne({_id: classToModify}, function(err, myClass){
        if(err){
            res.json({error: err});
        }
        else if(myClass == null){
            res.status(404).json({ error: "Class with id '" + classToModify + "' does not exist."});
        }
        else{
            students.findOne({ _id: studentToAdd },{},function(err,myStudent){ 
                if(err){
                    res.json({error: err});
                }
                else if(myStudent == null){
                    res.status(404).json({ error: "Student with id '" + studentToAdd + "' does not exist."});
                }
                else{
                    classes.update({ '_id' : classToModify }, {$push: {students: ObjectId(studentToAdd)}}, function(err) {
                        res.json((err === null) ? {}  : { error: err });
                    });
                }
            });
        }
    });
});


//DELETE delete a student from a class
router.delete('/:class_id/students/:student_id', function(req, res) {
    var db = req.db;
    var mongo = req.mongo;
    var ObjectId = mongo.ObjectID
    var classToModify = req.params.class_id;
    var studentToRemove = req.params.student_id;
    var classes = db.get('classes');
    var students = db.get('classes');
    classes.findOne({_id: classToModify}, function(err, myClass){
        if(err){
            res.json({error: err});
        }
        else if(myClass == null){
            res.status(404).json({ error: "Class with id '" + classToModify + "' does not exist."});
        }
        else{
            students.findOne({ _id: studentToRemove },{},function(err,myStudent){ 
                if(err){
                    res.json({error: err});
                }
                else if(myStudent == null){
                    res.status(404).json({ error: "Student with id '" + studentToRemove + "' does not exist."});
                }
                else{
                    classes.update({ '_id' : classToModify }, {$pull: {students: ObjectId(studentToRemove)}}, function(err) {
                        res.json((err === null) ? {}  : { error: err });
                    });
                }
            });
        }
    });
});



module.exports = router;
