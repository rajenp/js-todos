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

(function() {
    'use strict'

    var IView = ["addTask", "completeTask", "removeTask", "refreshTasks", "showFilter", "showMessage"];

    var TODOController = function() {};

    myLib.Extend(TODOController, myLib.EventTarget, {
        init: function(prefs) {
            prefs = prefs || {};

            // Plug the Right Service. 
            // Use TODOService if you want to use simple-todoserver available at https://github.com/rpatil26/node-todoserver
            this._service = prefs.useRemoteService ? RemoteTODOService : LocalTODOService;
            var me = this;

            // Plug the Right View. 
            this._view = prefs.useReactViews ? this._createReactView() : this._createJSView();

            //Ensure View has all APIs we need
            myLib.Impls(this._view, IView);

            this._model = [];
            this._listReady = false;
        },
        _createReactView: function() {
            var me = this;
            return React.render(React.createElement(TODOView, {
                tasks: [],
                onAddTask: function(task) {
                    me.addTask({
                        task: task
                    });
                },
                onFilterChange: function(filter) {
                    me.search(filter);
                },
                onTaskChange: function(task) {
                    me.updateTask(task);
                },
                onTaskDelete: function(taskId) {
                    me.clearTask(taskId);
                }
            }), myLib.$("main_view"));
        },
        _createJSView: function() {
            var me = this;
            return new JSTODOView({
                onAddTask: function(task) {
                    me.addTask({
                        task: task
                    });
                },
                onFilterChange: function(filter) {
                    me.search(filter);
                },
                onTaskChange: function(task) {
                    me.updateTask(task);
                },
                onTaskDelete: function(taskId) {
                    me.clearTask(taskId);
                }
            });
        },
        _preProcessResponse: function(response) {
            var error = !response || !response.response || response.error || response.response.error,
                msg = response.error || response.response.error;
            if (!error) {
                return typeof response.response === "string" ? JSON.parse(response.response) : response.response;
            }
            this._view.showMessage("Error: " + (msg || "Something went wrong!"), "error");
        },
        launch: function(prefs) {
            this.init(prefs);
            this.getTasks(); //start getting existing tasks
        },
        //Add 
        addTask: function(data) {
            if (!data || !data.task) {
                return this._view.showMessage("Please enter task", "error");
            }
            this._view.showMessage("Adding new task...");
            this._service.addTask(data, new myLib.Callback(this.taskAdded, this));
        },
        taskAdded: function(response) {
            var task = this._preProcessResponse(response);
            if (task) {
                if (!this._listReady) {
                    return this.getTasks();
                }
                this._view.addTask(task);
                this._view.showMessage("Task added");
            }
            //this.search({});
        },
        //List
        getTasks: function() {
            this._view.showMessage("Fetching tasks...");
            this._service.getTasks(new myLib.Callback(this.tasksReceived, this));
        },
        tasksReceived: function(response) {
            var tasks = this._preProcessResponse(response);
            if (tasks) {
                this._model = tasks;
                this._view.refreshTasks(tasks);
                this._view.showMessage(tasks.length + " task" + (tasks.length > 1 ? "s" : "") + " found");
                this._listReady = true;
            }
        },
        updateTask: function(data) {
            this._view.showMessage("Updating task...");
            if (data && data.taskId) {
                this._service.updateTask(data.taskId, data.complete, new myLib.Callback(this.taskUpdated, this));
            }
        },
        taskUpdated: function(response) {
            var task = this._preProcessResponse(response);
            if (task) {
                this._view.completeTask(task.id, task.complete);
                this._view.showMessage("Task updated");
            }
        },
        //clear
        clearTask: function(taskId) {
            this._service.clearTask(taskId, new myLib.Callback(this.taskCleared, this));
        },
        taskCleared: function(response) {
            var task = this._preProcessResponse(response);
            if (task) {
                this._view.removeTask(task.id);
                this._view.showMessage("Task cleared");
            }
        },
        //search
        search: function(props) {
            this._service.search(props, new myLib.Callback(this.tasksReceived, this));
        }
    });

    window.TODOController = TODOController;

}());
