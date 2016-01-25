/*
 * Apache License
 *                           Version 2.0, January 2004
 *                        http://www.apache.org/licenses/
 * 
 * Copyright (c) 2016 Francesco Longo
 */

//reading configuration file
var nconf = require('nconf');
nconf.file ({file: process.cwd()+'/settings.json'});
var server_interface = nconf.get('config:server:interface');
var server_port = nconf.get('config:server:port');
var server_log_file = nconf.get('config:server:log_file');

//logging configuration                                                                
log4js = require('log4js');          
log4js.loadAppender('file');         
log4js.addAppender(log4js.appenders.file(server_log_file));
var logger = log4js.getLogger('core');

//server configuration
var network_utils = require('./network_utils');
var network = new network_utils;
var server_ip_address = network.get_ip_address(server_interface, 'IPv4');

//container network_utils
var container_utils = require('./container_utils');
var container = new container_utils;

arduino4teachers = function(){}

arduino4teachers.prototype.start = function(){
    
    logger.info('Starting arduino4teachers-core ');
    
    //preparing REST interface 
    var express = require('express');
    var rest = express();
    
    rest.get('/create_container/', function (req, res){
        
        var user = req.query.user;
        var name = req.query.name;
        var password = req.query.password;
        
        var container_name = user + "." + name;
        
        container.create_container(container_name, password, function(err, result){
            
            if(err){
                
                logger.error(err);
                
                var response = {
                    result:{}
                }
                
                response.result={ "error": err };
                res.send(JSON.stringify(response));
                
            }
            else{
                
                res.type('application/json');
                res.header('Access-Control-Allow-Origin','*');
                
                var response = {
                    result:{}
                }
                
                var container_port = result.container_port;
                
                logger.info('Created container ' + name + ' for user ' + user + ' with password '+ password + ' reachable at http://'+server_ip_address + ':' + container_port);
                
                response.result= {"user": user, "name": name, "ip_address": server_ip_address, "port": container_port, "password": password, "status": "started"};
                res.send(JSON.stringify(response));
                
            } 
            
        });
        
    });

    rest.get('/start_container/', function(req, res){
        
        var user = req.query.user;
        var name = req.query.name;
        
        var container_name = user + "." + name;        
        
        container.start_container(container_name, function(err, result){
            
            if(err){
                
                logger.error(err);
                
                var response = {
                    result:{}
                }
                
                response.result={ "error": err };
                res.send(JSON.stringify(response));
                
            }
            else{
                
                res.type('application/json');
                res.header('Access-Control-Allow-Origin','*');
                
                var response = {
                    result:{}
                }
                
                logger.info('Container ' + name + ' for user ' + user + ' started');
                logger.info(result);
                
                response.result= {"user": user, "name": name, "status": "started"};
                res.send(JSON.stringify(response));
            }
        });
    });
    
    rest.get('/stop_container/', function(req, res){
        
        var user = req.query.user;
        var name = req.query.name;
        
        var container_name = user + "." + name;        
        
        container.stop_container(container_name, function(err, result){
            
            if(err){
                
                logger.error(err);
                
                var response = {
                    result:{}
                }
                
                response.result={ "error": err };
                res.send(JSON.stringify(response));
                
            }
            else{
                
                res.type('application/json');
                res.header('Access-Control-Allow-Origin','*');
                
                var response = {
                    result:{}
                }
                
                logger.info('Container ' + name + ' for user ' + user + ' stopped');
                logger.info(result);
                
                response.result= {"user": user, "name": name, "status": "stopped"};
                res.send(JSON.stringify(response));
            }
        });
    });
    
    rest.get('/destroy_container/', function(req, res){
        
        var user = req.query.user;
        var name = req.query.name;
        
        var container_name = user + "." + name;        
        
        container.destroy_container(container_name, function(err, result){
            
            if(err){
                
                logger.error(err);
                
                var response = {
                    result:{}
                }
                
                response.result={ "error": err };
                res.send(JSON.stringify(response));
                
            }
            else{
                
                res.type('application/json');
                res.header('Access-Control-Allow-Origin','*');
                
                var response = {
                    result:{}
                }
                
                logger.info('Container ' + name + ' for user ' + user + ' destroyed');
                logger.info(result);
                
                response.result= {"user": user, "name": name, "status": "destroyed"};
                res.send(JSON.stringify(response));
            }
        });
    });
    
    rest.listen(server_port);
    logger.info('REST server started at http://'+ server_ip_address +':'+ server_port);
}


module.exports = arduino4teachers;
