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
(function() {
    'use strict'
    var $ = function(id) {
            return document.getElementById(id);
        },
        trim = function(str) {
            str = "" + (str || "");
            return str.replace(/^\s+|\s+$/gm, "");
        },
        //Simple callback - executable function
        Callback = function(func, context) {
            return function(data) {
                if (context) {
                    func.call(context, data);
                } else {
                    func(data);
                }
            };
        },

        //To check if object is an array
        $isArray = function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },

        //Loop on each element of map or array
        $each = function(obj, callback) {
            var key = 0,
                len;
            if ($isArray(obj)) {
                for (key = 0, len = obj.length; key < len; key += 1) {
                    callback(obj[key], key);
                }
            } else {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        callback(obj[key], key);
                    }
                }
            }
        },
        //Simple templating
        $template = function(str, data) {
            if (!data) {
                return str;
            }
            return str.replace(/\{\s*(\w+)\s*\}/img, function(match, p1) {
                return data[p1] || "";
            });
        },
        //Simple Inheritance
        Extend = function(Child, Parent, prototypes) {
            Child.prototype = new Parent();
            Child.prototype.constructor = Child;
            $each(prototypes, function(value, key) {
                Child.prototype[key] = value;
            });
            return Child; //Allow chaining
        },
        EventTarget = function() {
            this._events = {};
        },
        //Simple AjaxLoader
        AjaxLoader = (function() {
            'use strict'
            if (typeof XMLHttpRequest === "undefined") {
                XMLHttpRequest = function() {
                    try {
                        return new ActiveXObject("Msxml2.XMLHTTP.6.0");
                    } catch (ignore) {}
                    try {
                        return new ActiveXObject("Msxml2.XMLHTTP.3.0");
                    } catch (ignore) {}
                    try {
                        return new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (ignore) {}
                    throw new Error("Browser doesn't support XMLHttpRequest");
                };
            }

            return {
                request: function(params) { //url, callback, headers) {
                    params = params || {};
                    var method = params.method || "GET",
                        url = params.url,
                        data = params.data || null,
                        callback = params.callback,
                        headers = params.headers || [],
                        xhr = new XMLHttpRequest();
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
                                    callback(xhr);
                                } else {
                                    callback({
                                        error: "Unable to connect with todoserver"
                                    });
                                }
                            }
                        };
                        if (typeof data === "object") {
                            data = JSON.stringify(data);
                        }
                        xhr.send(data);
                    } catch (ex) {
                        callback({
                            error: ex
                        });
                    }
                }
            };
        }());

    // Interface implemention
    Function.prototype.Impls = function(iFace) {
        var me = this;
        if (!$isArray(iFace)) {
            throw new Error("Interface needs to be defined as an Array");
        }
        //make sure this function has all the methods required by this interface
        $each(iFace, function(name) {
            var method = me.prototype[name] || me[name];
            if (!method || typeof method !== "function") {
                throw new Error("Missing interface implementation: " + name);
            }
        });
    };

    var Impls = function(me, iFace) {
        if (!$isArray(iFace)) {
            throw new Error("Interface needs to be defined as an Array");
        }
        //make sure this function has all the methods required by this interface
        $each(iFace, function(name) {
            var method = me[name];
            if (!method || typeof method !== "function") {
                throw new Error("Missing interface implementation: " + name);
            }
        });
    };

    Extend(EventTarget, Object, {
        notify: function(name, data) {
            var listeners = this._events[name] || [];
            $each(listeners, function(callback) {
                callback(data);
            });
        },
        listen: function(name, callback) {
            var listeners = this._events[name] || [];
            listeners.push(callback);
            this._events[name] = listeners;
        }
    });

    window.myLib = {
        $: $,
        trim: trim,
        Callback: Callback,
        $isArray: $isArray,
        $each: $each,
        $template: $template,
        Extend: Extend,
        EventTarget: EventTarget,
        AjaxLoader: AjaxLoader,
        Impls: Impls
    };

}());
