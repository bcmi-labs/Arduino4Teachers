/*
 * Apache License
 *                           Version 2.0, January 2004
 *                        http://www.apache.org/licenses/
 * 
 * Copyright (c) 2016 Francesco Longo
 */

var express = require('express');
var router = express.Router();

var container_utils = require('./container_utils');
var container = new container_utils;

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
//{"name": "", "description": ""}
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
//{"name": "", "description": "", "status": "", "owner": ""}
router.post('/', function(req, res) {
    
    var db = req.db;
    var collection_environments = db.get('environments');
    var collection_students = db.get('students');
    var extend = require('util')._extend
    
    collection_students.findOne({_id: req.body.owner}, function(err, student){
        
        if(err){
            res.json({error: err});
        }
        else{
            
            var container_name = req.body.owner + "." + req.body.name;
            
            var nu = require('./network_utils');
            var network_utils = new nu;
            network_utils.get_free_port(db, function (err, container_port) {
                if(err){
                    callback(err, null);
                }
                else{
                    
                    container.create_container(container_name, student.password, container_port, function(err, result){
                        
                        if(err){
                            res.json({error: err});
                        }
                        else{
                            
                            var output = extend({},{ 'port' : container_port });
                            extend(req.body, output);
                            
                            collection_environments.insert(req.body, function(err, docs){
                                
                                res.json((err === null) ? { '_id': docs._id } : { msg: err });
                                
                            });  
                        }  
                    });
                }
            });
        }
    });
});

//DELETE delete an environments for a students
router.delete('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('environments');
    var environmentToDelete = req.params.id;    
    collection.findOne({ '_id' : environmentToDelete }, function(err, environment){
        if(err){
            res.json({error: err});
        }
        else{
            var environment_name = environment.name;
            var environment_owner = environment.owner;
            var container_name = environment_owner + "." + environment_name;
            container.destroy_container(container_name, function(err, result){ 
                if(err){
                    res.json({error: err});                
                }
                else{
                    collection.remove({ '_id' : environmentToDelete }, function(err) {
                        res.json((err === null) ? {} : { msg:'error: ' + err });
                    });                
                    
                } 
            });                
        }
    });    
});

//PUT start/stop an environment
router.put('/:id/status/:status', function(req, res) {
    var db = req.db;
    var collection = db.get('environments');
    var environmentToModify = req.params.id;
    var newStatus = req.params.status;
    
    collection.findOne({ '_id' : environmentToModify }, function(err, environment){
        if(err){
            res.json({error: err});
        }
        else{
            var environment_name = environment.name;
            var environment_owner = environment.owner;
            var container_name = environment_owner + "." + environment_name;
            if(newStatus == 'start'){
                container.start_container(container_name, function(err, result){ 
                    if(err){
                        res.json({error: err});                
                    }
                    else{
                        collection.update({ '_id' : environmentToModify }, {$set: {status: newStatus}}, function(err) {
                            res.json((err === null) ? {_id: environmentToModify, status: newStatus}  : { msg:'error: ' + err });
                        });                
                        
                    } 
                });                
            }
            else if(newStatus == 'stop'){
                container.stop_container(container_name, function(err, result){ 
                    if(err){
                        res.json({error: err});                
                    }
                    else{
                        collection.update({ '_id' : environmentToModify }, {$set: {status: newStatus}}, function(err) {
                            res.json((err === null) ? {_id: environmentToModify, status: newStatus}  : { msg:'error: ' + err });
                        });                     
                    } 
                });
            }
        }
    });    
});

module.exports = router;
