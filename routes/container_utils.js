/*
 * Apache License
 *                           Version 2.0, January 2004
 *                        http://www.apache.org/licenses/
 * 
 * Copyright (c) 2016 Francesco Longo
 */

//reading configuration file
var nconf = require('nconf');
nconf.file ({file: process.cwd()+'/routes/settings.json'});
var image_user = nconf.get('config:image:user');
var image_repository = nconf.get('config:image:repository');
var image_tag = nconf.get('config:image:tag');

//docker configuration
var image_name = image_user+'/'+image_repository+':'+image_tag;
var dockerode = require('dockerode');
var docker = new dockerode();

container_utils = function(){
};

container_utils.prototype.create_container = function (container_name, container_password, container_port, callback) {
    var port_json = { "80/tcp": [{ HostPort: container_port.toString() }] };
    var parameters = {Image: image_name, Cmd: [], name: container_name, PortBindings: port_json};
    docker.createContainer(parameters, function (err, container) {
        if(err){
            callback(err, null);
        }
        else{
            container.start(function (err, data) {
                if(err){
                    callback(err, null);
                }
                else{
                    const exec = require('child_process').exec;
                    const child = exec(process.cwd()+'/utils/change_password.sh '+ container_password + ' ' + container_name, function(err,stdout,stderr){
                        if (err) {
                            console.log(process.cwd()+'/utils/change_password.sh '+ container_password + ' ' + container_name);
                            callback(err, null);
                        }
                        else{
                            container.stop(function (err, data){
                                if(err){
                                    callback(err, null);
                                }
                                else{
                                    callback(null, data);
                                }
                            });                                    
                        }
                    }); 
                }
            }); 
        }
    });
}

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
