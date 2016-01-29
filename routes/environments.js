var express = require('express');
var router = express.Router();
var container_utils = require('./container_utils');

//list all environments, list all environments for a student, create an environment for a student, start an environments, stop an environments, remove an environments, update an attribute (name, description) 

//GET list of all environments
router.get('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('environments');
    collection.find({},{},function(err,docs){
        res.json(docs);
    });
});

//GET details of an environments
router.get('/:id/details', function(req, res, next) {
    var db = req.db;
    var collection = db.get('environments');
    var environmentToShow = req.params.id;
    collection.find({ '_id': environmentToShow },{},function(err,docs){
        res.json(docs);
    });
});


//GET list of all the environments for a student
router.get('/owner/:id', function(req, res, next) {
    var db = req.db;
    var id = req.params.id;
    var collection = db.get('classes');
    collection.find({owner: id}, function(err, environments){
        if(err){
            res.json({ msg:'error: ' + err });
        }
        else{
            res.json(environments);
        }
    });
});

//PUT update one or more attribute of an environment (name, description)
router.put('/:id', function(req, res) {
    var extend = require('util')._extend
    var db = req.db;
    var collection = db.get('environments');
    var environmentToUpdate = req.params.id;
    var output = extend({},{ '_id' : environmentToUpdate });
    extend(output,  req.body);
    collection.update({ '_id' : environmentToUpdate }, req.body, function(err) {
        res.json((err === null) ? output  : { msg:'error: ' + err });
    });
});

//POST create an environments for a student
router.post('/', function(req, res) {
    var db = req.db;
    var collection = db.get('environments');
    collection.insert(req.body, function(err, docs){
        res.json((err === null) ? { '_id': docs._id } : { msg: err });
    });
});

//DELETE delete an environments for a students
router.delete('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('environments');
    var environmentToDelete = req.params.id;
    collection.remove({ '_id' : environmentToDelete }, function(err,docs) {
        res.json((err === null) ? {} : { msg:'error: ' + err });
    });
});

//PUT start/stop an environment
router.put('/:id/status/:status', function(req, res) {
    var db = req.db;
    var environmentToModify = req.params.id;
    var newStatus = req.params.status;
    var collection = db.get('environments');
    collection.update({ '_id' : environmentToModify }, {$set: {status: newStatus}}, function(err) {
        res.json((err === null) ? {_id: environmentToModify, status: newStatus}  : { msg:'error: ' + err });
    });
});


module.exports = router;
