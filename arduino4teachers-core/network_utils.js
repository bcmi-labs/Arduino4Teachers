/*
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

Copyright (c) 2016 Francesco Longo
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


module.exports = network_utils;