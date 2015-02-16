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
 * @author Rajendra Patil
 */

/**
 * Remote TODO service using todoserver
 */

/* Service Interface to be implemented by a Service */
var IService = ["getTasks", "addTask", "updateTask", "clearTask", "search"];

var TODOService = function () {
    this._loader = AjaxLoader;
};

TODOService.API_URL = "http://localhost:9898/todo/tasks";

Extend(TODOService, Object, {
    getTasks: function (callback) {
        var endPoint = TODOService.API_URL;
        this._loader.request({
            method: "GET",
            url: endPoint,
            callback: callback
        });
    },
    addTask: function (task, callback) {
        var endPoint = TODOService.API_URL + "/create";
        this._loader.request({
            method: "POST",
            data: task,
            url: endPoint,
            callback: callback,
            headers: {
                "Content-Type": "application/json"
            }
        });
    },
    updateTask: function (taskId, complete, callback) {
        var endPoint = TODOService.API_URL + "/" + taskId + "/edit";
        this._loader.request({
            method: "PUT",
            data: {
                complete: complete
            },
            url: endPoint,
            callback: callback,
            headers: {
                "Content-Type": "application/json"
            }
        });
    },
    clearTask: function (taskId, callback) {
        var endPoint = TODOService.API_URL + "/" + taskId + "/delete";
        this._loader.request({
            method: "DELETE",
            url: endPoint,
            callback: callback
        });
    },
    search: function (props, callback) {
        var endPoint = TODOService.API_URL + "/search",
            query = "";
        props = props || {};
        $each(props, function (value, key) {
            query += key + "=" + value + "&";
        });
        this._loader.request({
            method: "GET",
            url: endPoint + (query ? "?" + query : ""),
            callback: callback,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}).Impls(IService);

/**
 * Local TODO storage. TODOs are cleared on page refresh.
 */

var LocalTODOService = function () {
    this._storage = (function () {
        var storage = {
                tasks: {}
            },
            tasks,
            serialize = false;
        if ('localStorage' in window && window['localStorage'] !== null) {
            storage = window['localStorage'];
            tasks = storage.tasks;
            if (!tasks) {
                storage.tasks = "{}";
            }
            serialize = true;
        }
        return {
            get: function (key) {
                var data = storage[key];
                if (data && serialize) {
                    data = JSON.parse(data);
                }
                return data;
            },
            set: function (key, value) {
                if (!serialize) { //For JS memory storage we, don't need to do this
                    return;
                }
                storage[key] = serialize && typeof value !== "string" ? JSON.stringify(value) : value;
            }
        };
    })();
};

Extend(LocalTODOService, Object, {
    _callback: function (cb, resp) {
        resp = {
            response: resp
        };
        cb(resp);
    },
    getTasks: function (callback) {
        var tasks = [];
        $each(this._storage.get("tasks"), function (task) {
            tasks.push(task);
        });
        this._callback(callback, tasks);
    },
    addTask: function (task, callback) {
        var tasks = this._storage.get("tasks");
        task.id = new Date().getTime();
        tasks[task.id] = task;
        this._storage.set("tasks", tasks);
        this._callback(callback, task);
    },
    updateTask: function (taskId, complete, callback) {
        var tasks = this._storage.get("tasks");
        var task = tasks[taskId];
        if (task) {
            task.complete = complete;
            this._storage.set("tasks", tasks);
        }
        this._callback(callback, task);
    },
    clearTask: function (taskId, callback) {
        var tasks = this._storage.get("tasks");
        var task = tasks[taskId];
        if (task && task.complete) {
            delete tasks[taskId];
            this._storage.set("tasks", tasks);
            this._callback(callback, task);
        } else {
            this._callback(callback, {
                error: "Task not cleared"
            });
        }
    },
    search: function (props, callback) {
        var tasks = [];
        var alltasks = this._storage.get("tasks");
        $each(alltasks, function (task) {
            var emptyProps = true,
                match = false;
            $each(props, function (value, prop) {
                emptyProps = false;
                match = (task[prop] === value || (!value && typeof task[prop] === "undefined"));
            });
            if (match || emptyProps) {
                tasks.push(task);
            }
        });
        this._callback(callback, tasks);
    }
}).Impls(IService);
