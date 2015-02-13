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
 * 
 * @author Rajendra Patil
 */

var $ = function(id) {
	return document.getElementById(id);
};

//Simple callback - executable function
var Callback = function(func, context) {
    this.exec = function(data) {
        context ? func.call(context, data) : func(data);
    }
};

//To check if object is an array
var $isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

//Loop on each element of map or array
var $each = function(obj, callback) {
    if ($isArray(obj)) {
         for (var idx = 0, len = obj.length; idx < len; idx++) {
            callback(obj[idx], idx);
        }
    } else {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                callback(obj[key], key);
            }
        }
    }
};

//Simple AjaxLoader
var AjaxLoader = function() {

    if (typeof XMLHttpRequest == "undefined")
        XMLHttpRequest = function () {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP.6.0");
            }
            catch (e) {
            }
            try {
                return new ActiveXObject("Msxml2.XMLHTTP.3.0");
            }
            catch (e) {
            }
            try {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
            }
            throw new Error("Browser doesn't support XMLHttpRequest");
        };

    return {
        request: function(params) { //url, callback, headers) {
            params = params || {};
            var method = params.method || 'GET';
            var url = params.url;
            var data = params.data || null;
            var callback = params.callback;
            var headers = params.headers || [];

            var xhr = new XMLHttpRequest();
            try { 
                xhr.open(method, url, true);
                if (headers) {
                    $each(headers, function(value, key) {
                        xhr.setRequestHeader(key, value);
                    });
                }
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            callback.exec ? callback.exec(xhr) : callback(xhr);
                        } else {
                            callback.exec ? callback.exec({error: "Unable to connect with todoserver"}) : callback({error: "Unable to connect with todoserver"});
                        }
                    }
                };
                if(typeof data === "object") {
                    data = JSON.stringify(data);
                }
                xhr.send(data);
            } catch (ex) {
                callback.exec ? callback.exec({error:ex}) : callback({error:ex});
            }
        }
    }
}();

//Simple Inheritance
var Extend = function(Child, Parent, prototypes) {
    Child.prototype = new Parent();
    Child.prototype.constructor = Parent;
    $each(prototypes, function(value, key) {
        Child.prototype[key] = value;
    });
    return Child; //Allow chaining
};

var EventTarget = function () {
    this._events = {};
};

Extend(EventTarget, Object, {
    notify: function (name, data) {
        var listeners =  this._events[name] || [];
        $each(listeners, function(callback) {
            callback.exec ? callback.exec(data) : callback(data);   
        });
    },
    listen: function (name, callback) {
        var listeners = this._events[name] || [];
        listeners.push(callback);   
        this._events[name] = listeners;
    }
});

// Interface implemention
Function.prototype.Impls = function(iFace) {
    var me = this;
    if (!$isArray(iFace)) {
        throw new Error("Interface needs to be defined as an Array");
    }
    //make sure this function has all the methods required by this interface
    $each(iFace, function(name) {
        var method = me.prototype[name];
        if (!method || typeof method !== "function") {
            throw new Error("Missing interface implemention: " + name);       
        }
    });
};

//Simple templating
var $template = function(str, data) {
    if (!data) return str;
    return str.replace(/\{\s*(\w+)\s*\}/img, function(match, p1) {
        return data[p1] || "";
    })
};

