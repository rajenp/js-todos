/*
 * Copyright 2015 Rajendra Patil
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Node JS based Simple TODO server
 * @author Rajendra Patil
 * This is inspiration from nzakas's code but this is my own enhanced implementation.
 * This implementation doesn't use express or has no dependency on any other module.
 */

var http = require('http');
var tasks = {},
    query;

var setCORSHeaders = function(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

//Extract Body as JSON
var extractBody = function(req, res, callback) {
    var fullBody = '',
        data, method = req.method;
    if (method === 'POST') {
        req.on('data', function(chunk) {
            fullBody += chunk.toString();
        });
        req.on('end', function() {
            data = fullBody && JSON.parse(fullBody);
            callback(data);
        });

    } else {
        setCORSHeaders(res);
        res.writeHead(405, "Method Not Allowed", {
            'Content-Type': 'application/json'
        });
        res.end();
    }
};

//Send Object as JSON string back to client
var writeJSON = function(data, res) {
    setCORSHeaders(res);
    res.writeHead(200, "OK", {
        'Content-Type': 'application/json'
    });
    var responseData = JSON.stringify(data);
    res.write(responseData);
    res.end();
};

//Simple server implementation
http.createServer(function(req, res) {
    var aTask;
    console.log(req.url);

    // Reply OK to OPTIONS method
    if (req.method === 'OPTIONS') {
        setCORSHeaders(res);
        res.writeHead(200, "OK", {
            'Content-Type': 'application/json'
        });
        res.end();
        return;
    }
    if (req.url === '/todo/tasks') { // Route /tasks
        var list = Object.keys(tasks).map(function(key) {
            return tasks[key];
        });
        writeJSON(list, res);
    } else if (req.url === '/todo/tasks/create') { //Route /create
        extractBody(req, res, function(data) {
            if (data) {
                data.id = new Date().getTime();
                tasks[data.id] = data;
                writeJSON(data, res);
            }
        });
    } else if (req.url === '/todo/tasks/search') { //Route /search
        extractBody(req, res, function(queryMap) { // {prop: value, prop1: value1}
            var queryKeys = queryMap && Object.keys(queryMap),
                list = [];
            console.log("Query ", queryMap);
            if (!queryKeys || !queryKeys.length) {
                list = Object.keys(tasks).map(function(key) {
                    return tasks[key];
                });
            } else {
                list = Object.keys(tasks).filter(function(key) {
                    aTask = tasks[key];
                    return queryKeys.some(function(prop) {
                        var checkValue = queryMap[prop];
                        return (aTask[prop] == checkValue || (!checkValue && typeof aTask[prop] === "undefined"));
                    });
                }).map(function(validKey) { //matching keys
                    return tasks[validKey];
                });
            }
            writeJSON(list, res);
        });
    } else {
        var regex = new RegExp("/todo/tasks/([0-9]+)/(edit|delete)");
        var match = req.url.match(regex),
            taskId = match && match[1],
            operation = match && match[2],
            aTask = tasks[taskId];

        if (!aTask || !operation.match(/edit|delete/)) {
            setCORSHeaders(res);
            res.writeHead(404, "Not found");
            res.end();
            return;
        }

        if (operation === 'edit') { //Route /edit
            extractBody(req, res, function(data) {
                if (data) {
                    Object.keys(data).forEach(function(key) {
                        if (key !== 'id') { //id update not allowed
                            aTask[key] = data[key];
                        }
                    });
                }
                return writeJSON(aTask, res);
            });
        } else if (operation === 'delete') { //Route /delete
            delete tasks[taskId];
            return writeJSON(aTask, res);
        }
    }

}).listen(9898);

console.log('Simple todoserver is ready to accept requests on port 9898');
