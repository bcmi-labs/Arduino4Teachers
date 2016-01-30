var express = require('express');
var router = express.Router();

//list all classes, create a class, remove a class, list all students in a class, add a student in a class, remove a student from a class, update an attribute (name, description)

//GET list of all classes
router.get('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('classes');
    collection.find({},{},function(err,docs){
        res.json(docs);
    });
});

//GET details of a class
router.get('/:id/details', function(req, res, next) {
    var db = req.db;
    var collection = db.get('classes');
    var classToShow = req.params.id;
    collection.find({ '_id': classToShow },{},function(err,docs){
        res.json(docs);
    });
});

//POST add a class
//{"name": "", "description": ""}
router.post('/', function(req, res) {
    var db = req.db;
    var collection = db.get('classes');
    collection.insert(req.body, function(err, docs){
        res.json((err === null) ? { '_id': docs._id } : { msg: err });
    });
});

//DELETE delete a class
router.delete('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('classes');
    var classToDelete = req.params.id;
    collection.remove({ '_id' : classToDelete }, function(err,docs) {
        res.json((err === null) ? {} : { msg:'error: ' + err });
    });
});

//PUT update one or more attribute of a class (name, description)
//"{"name": "", "description": ""}
router.put('/:id', function(req, res) {
    var extend = require('util')._extend
    var db = req.db;
    var collection = db.get('classes');
    var classToUpdate = req.params.id;
    var output = extend({},{ '_id' : classToUpdate });
    extend(output,  req.body);
    collection.update({ '_id' : classToUpdate }, req.body, function(err) {
        res.json((err === null) ? output  : { msg:'error: ' + err });
    });
});

//GET list of all students in a class
router.get('/:id/students', function(req, res, next) {
    var db = req.db;
    var class_id = req.params.id;
    var collection_classes = db.get('classes');
    var collection_students = db.get('students');
    collection_classes.findOne({_id: class_id}, function(err, myclass){
        if(err){
            res.json({ msg:'error: ' + err });
        }
        else{
            collection_students.find({_id: { $in: myclass.students } },{},function(err,students){ 
                if(err){
                    res.json({ msg:'error: ' + err });
                }
                else{
                    res.json(students);
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
    var collection_classes = db.get('classes');
    collection_classes.update({ '_id' : classToModify }, {$push: {students: ObjectId(studentToAdd)}}, function(err) {
        res.json((err === null) ? {}  : { msg:'error: ' + err });
    });
});


//DELETE delete a student from a class
router.delete('/:class_id/students/:student_id', function(req, res) {
    var db = req.db;
    var mongo = req.mongo;
    var ObjectId = mongo.ObjectID
    var classToModify = req.params.class_id;
    var studentToRemove = req.params.student_id;
    var collection = db.get('classes');
    collection.update({ '_id' : classToModify }, {$pull: {students: ObjectId(studentToRemove)}}, function(err) {
        res.json((err === null) ? {} : { msg:'error: ' + err });
    });
});



module.exports = router;
