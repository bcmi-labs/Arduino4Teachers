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

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.status(401).json({error: "You are not authenticated to the system."});
}

//list all environments, list all environments for a student, create an environment for a student, start an environments, stop an environments, remove an environments, update an attribute (name, description) 

//GET list of all environments
router.get('/', isAuthenticated, function(req, res) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{
        var db = req.db;
        var environments = db.get('environments');
        environments.find({},{fields: {name: 1, owner: 1}},function(err,myEnvironments){
            if(err){
                res.status(500).json({error: err});
            }
            else{
                res.json(myEnvironments);
            }        
        });
    }
});

//GET details of an environments
router.get('/:id/', isAuthenticated, function(req, res) {
    var db = req.db;
    var environments = db.get('environments');
    var environmentToShow = req.params.id;
    
    environments.findOne({ '_id': environmentToShow },{},function(err,myEnvironment){
        if(err){
            res.status(500).json({error: err});
        }
        else if(myEnvironment == null){
            if(req.user.username == 'teacher'){
                res.status(404).json({ error: "Environment with id '" + environmentToShow + "' does not exist."});
            }else{
                res.status(403).json({error: "You are not authorized to perform such an operation."});
            }
        }else{
            if(req.user.username == 'teacher' || req.user._id == environmentToShow.owner){
                res.json(myEnvironment);
            }
            else{
                res.status(403).json({error: "You are not authorized to perform such an operation."});
            }            
        }
    });
});

//GET list of all the environments for a student
router.get('/owner/:id', isAuthenticated, function(req, res) {
    var db = req.db;
    var studentToShow = req.params.id;
    var environments = db.get('environments');
    var students = db.get('students');
    students.findOne({ _id: studentToShow}, {}, function(err, myStudent){
        if(err){
            res.status(500).json({ error: err });
        }
        else if (myStudent == null){
            if(req.user.username == 'teacher'){
                res.status(404).json({ error: "Student with id '" + studentToShow + "' does not exist."});
            }else{
                res.status(403).json({error: "You are not authorized to perform such an operation."});
            }
        }
        else{
            environments.find({owner: studentToShow}, function(err, environmentList){
                if(err){
                    res.status(500).json({ error: err });
                }
                else{
                    if(req.user.username == 'teacher' || req.user._id == studentToShow){
                        res.json(environmentList);
                    }
                    else{
                        res.status(403).json({error: "You are not authorized to perform such an operation."});
                    }
                }
            });        
        }
    });
});

//PUT update one or more attribute of an environment (name, description)
//{"name": "", "description": ""}
router.put('/:id', isAuthenticated, function(req, res) {

    var extend = require('util')._extend
    var db = req.db;
    var environments = db.get('environments');
    var environmentToUpdate = req.params.id;
    
    environments.findOne({ _id: environmentToUpdate },{}, function(err, myEnvironment){
        if(err){
            res.json(err);
        }
        else if(myEnvironment == null){
            if(req.user.username == 'teacher'){
                res.status(404).json({ error: "Environment with id '" + environmentToUpdate + "' does not exist."});
            }else{
                res.status(403).json({error: "You are not authorized to perform such an operation."});
            }
        }
        else{
            if(req.user.username == 'teacher' || req.user._id == myEnvironment.owner){
                environments.update({ '_id' : environmentToUpdate }, {$set: req.body}, function(err) {
                    
                    var newEnvironment = extend({},{ '_id' : environmentToUpdate });
                    extend(newEnvironment,  req.body);
                    
                    if(err === null){
                        res.json(newEnvironment);
                    }
                    else{
                        res.status(500).json({error: err });
                    }
                });
            }
            else{
                res.status(403).json({error: "You are not authorized to perform such an operation."});
            }
        }
    });
});

//POST create an environments for a student
//{"name": "", "description": "", "status": "", "owner": ""}
router.post('/', isAuthenticated, function(req, res) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{

        var db = req.db;
        var environments = db.get('environments');
        var students = db.get('students');
        var extend = require('util')._extend;
        
        if(req.body.name == undefined || req.body.description == undefined || req.body.owner == undefined){
            res.status(400).json({error: "Missing parameters: name, description, and owner are mandatory."});
        }
        else{
            if (req.body.status != undefined && req.body.status != "started" && req.body.status != "stopped" ){
                res.status(400).json({error: "Status can be either started or stopped."});
            }
            else{
                var studentToModify = req.body.owner;

                students.findOne({ _id: studentToModify}, function(err, myStudent){
                    if(err){
                        res.status(500).json({error: err});
                    }
                    else if(myStudent == null){
                        res.status(404).json({ error: "Student with id '" + studentToModify + "' does not exist."});
                    }
                    else{
                        
                        var containerName = req.body.owner + "." + req.body.name;

                        var nu = require('./network_utils');
                        var network_utils = new nu;
                        
                        network_utils.get_free_port(db, function (err, container_port) {
                            if(err){
                                res.status(500).json({ error: err });
                            }
                            else{
                                
                                container.create_container(containerName, myStudent.password, container_port, function(err, result){
                                    
                                    if(err){
                                        res.status(500).json({ error: err });
                                    }
                                    else{
                                        
                                        if (req.body.port == undefined && req.body.status == undefined){
                                            var output = extend({},{ port: container_port, status: "stopped" });
                                            extend(req.body, output);
                                        }
                                        else if (req.body.port == undefined && req.body.status != undefined){
                                            var output = extend({},{ port: container_port });
                                            extend(req.body, output);
                                        }
                                        else if (req.body.port != undefined && req.body.status == undefined){
                                            var output = extend({},{ status: "stopped" });
                                            extend(req.body, output);
                                            req.body.port = container_port;
                                        }
                                        else{
                                            req.body.port = container_port;
                                        }                                    
                                        
                                        environments.insert(req.body, function(err, docs){
                                            
                                            if(err){
                                                res.status(500).json({ error: err });
                                            }
                                            else{
                                                if (req.body.status == "started"){
                                                    container.start_container(containerName, function(err, result){
                                                        if (err){
                                                            res.status(500).json({ error: err });
                                                        }
                                                        else{
                                                            res.json(docs);
                                                        }
                                                    });
                                                }
                                                else{
                                                    res.json(docs);
                                                }
                                            }                                        
                                        });  
                                    }  
                                });
                            }
                        });
                    }
                }); 
            }
        }
    }
});

//DELETE delete an environments for a students
router.delete('/:id', isAuthenticated, function(req, res) {
    if(req.user.username != 'teacher'){
        res.status(403).json({error: "You are not authorized to perform such an operation."});
    }else{

        var db = req.db;
        var environments = db.get('environments');
        var environmentToDelete = req.params.id;
        var mongo = req.mongo;
        var ObjectId = mongo.ObjectID
        environments.findOne({ '_id' : environmentToDelete }, function(err, myEnvironment){
            if(err){
                res.status(500).json({ error: err });
            }
            else if(myEnvironment == null){
                res.status(404).json({ error: "Environment with id '" + environmentToDelete + "' does not exist."});
            }
            else{
                
                var environment_name = myEnvironment.name;
                var environment_owner = myEnvironment.owner;
                var container_name = environment_owner + "." + environment_name;
                
                container.stop_container_if_started(container_name, function(err, result){
                    if(err){
                        if(err.reason === "no such container"){
                            environments.remove({ '_id' : environmentToDelete }, function(err) {
                                if(err === null){
                                    res.json({});
                                }
                                else{
                                    res.status(500).json({ error: err });
                                }
                            });
                        }
                        else{
                            res.status(500).json({error: err});
                        }
                    }
                    else{
                        container.destroy_container(container_name, function(err, result){ 
                            if(err){
                                res.status(500).json({error: err});
                            }
                            else{
                                environments.remove({ '_id' : environmentToDelete }, function(err) {
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
    }
});

//PUT start/stop an environment
router.put('/:id/status/:status', isAuthenticated, function(req, res) {
    var db = req.db;
    var environments = db.get('environments');
    var environmentToModify = req.params.id;
    var newStatus = req.params.status;
    
    if(newStatus != "started" && newStatus != "stopped"){
        res.status(400).json({error: "Status can be either started or stopped."});
    }
    else{
        environments.findOne({ '_id' : environmentToModify }, function(err, myEnvironment){
            if(err){
                res.status(500).json({error: err});
            }
            else if(myEnvironment == null){
                if(req.user.username == 'teacher'){
                    res.status(404).json({ error: "Environment with id '" + environmentToModify + "' does not exist."});
                }else{
                    res.status(403).json({error: "You are not authorized to perform such an operation."});
                }
            }
            else{
                var environment_name = myEnvironment.name;
                var environment_owner = myEnvironment.owner;
                var container_name = environment_owner + "." + environment_name;
                if(req.user.username == 'teacher' || req.user._id == myEnvironment.owner){
                    if(newStatus == 'started'){
                        container.start_container(container_name, function(err, result){ 
                            if(err){
                                res.status(500).json({error: err});                
                            }
                            else{
                                environments.update({ '_id' : environmentToModify }, {$set: {status: newStatus}}, function(err) {
                                    myEnvironment.status = newStatus;
                                    
                                    if(err === null){
                                        res.json(myEnvironment);
                                    }
                                    else{
                                        res.status(500).json({ error: err });
                                    }
                                });                
                            } 
                        });                
                    }
                    else if(newStatus == 'stopped'){
                        container.stop_container(container_name, function(err, result){ 
                            if(err){
                                res.status(500).json({ error: err });                
                            }
                            else{
                                environments.update({ '_id' : environmentToModify }, {$set: {status: newStatus}}, function(err) {
                                    myEnvironment.status = newStatus;
                                    
                                    if(err === null){
                                        res.json(myEnvironment);
                                    }
                                    else{
                                        res.status(500).json({ error: err });
                                    }
                                });                     
                            } 
                        });
                    }
                }
                else{
                    res.status(403).json({error: "You are not authorized to perform such an operation."});
                }
            }
        });       
    }
});

module.exports = router;
