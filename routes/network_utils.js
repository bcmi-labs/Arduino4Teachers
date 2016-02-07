/*
 * Apache License
 *                           Version 2.0, January 2004
 *                        http://www.apache.org/licenses/
 * 
 * Copyright (c) 2016 Francesco Longo
 */

var networkInterfaces = require('os').networkInterfaces();

network_utils = function(){
};

network_utils.prototype.get_ip_address = function (interface, version) {
    var ip ;
    for (var ifName in networkInterfaces){
        if(ifName == interface){
            var ifDetails = networkInterfaces[ifName];
            for (var i = 0; ifDetails[i].family == version; i++){
                ip = ifDetails[i].address;
            }
        }
    }
    return ip;
};


network_utils.prototype.get_free_port = function (db, callback) {
    var collection = db.get('environments');
    collection.findOne({}, { limit :1 , sort : { port : -1 } }, function (err,res) {     
        if(err){
            callback(err, null);
        }
        else{
            if(res == null){
                callback(null, 8000);
            }else{
                var portfinder = require('portfinder');
                portfinder.basePort = parseInt(res.port, 10) + 1;
                portfinder.getPort(function (err, free_port) {
                    if(err){
                        callback(err, null);
                    }
                    else{
                        callback(null,free_port);
                    }
                });
            }
        }
    });
}

module.exports = network_utils;