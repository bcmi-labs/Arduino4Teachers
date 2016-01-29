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
var image_user = nconf.get('config:image:user');
var image_repository = nconf.get('config:image:repository');
var image_tag = nconf.get('config:image:tag');

//docker configuration
var image_name = image_user+'/'+image_repository+':'+image_tag;
var dockerode = require('dockerode');
var docker = new dockerode();

container_utils = function(){
};

container_utils.prototype.create_container = function (container_name, password, callback) {
    
    var portfinder = require('portfinder');
    
    portfinder.getPort(function (err, container_port) {
        
        if(err){
            
            callback(err, null);
        }
        else{
            
            var port_json = { "80/tcp": [{ HostPort: container_port.toString() }] };
            var parameters = {Image: image_name, Cmd: [], name: container_name, PortBindings: port_json};
            
            docker.createContainer(parameters, function (err, container) {
                
                if(err){
                    
                    callback(err, null);
                }
                else{
                    container.start(function (err, data) {
                        
                        if(err){
                            
                            callback(err, null)
                        }
                        else{
                            
                            const exec = require('child_process').exec;
                            
                            const child = exec('./utils/change_password.sh '+ password + ' ' + container_name, function(err,stdout,stderr){
                                if (err) {
                                    
                                    callback(err, null);
                                }
                                else{
                                    
                                    var result={"container_port": container_port.toString() };
                                    
                                    callback(null, result);
                                }
                            }); 
                        }
                    }); 
                }
            });
        }
    });
};

container_utils.prototype.start_container = function (container_name, callback) {
    
    var container = docker.getContainer(container_name);
    
    container.start(function (err, data) {
        if(err){
            callback(err, null);
        }
        else{
            callback(null, data);
        }
    });
}


container_utils.prototype.stop_container = function (container_name, callback) {
    
    var container = docker.getContainer(container_name);
    
    container.stop(function (err, data) {
        if(err){
            callback(err, null);
        }
        else{
            callback(null, data);
        }
    });
}

container_utils.prototype.destroy_container = function (container_name, callback) {
    
    var container = docker.getContainer(container_name);
    
    container.remove(function (err, data) {
        if(err){
            callback(err, null);
        }
        else{
            callback(null, data);
        }
    });
}


module.exports = container_utils; 
