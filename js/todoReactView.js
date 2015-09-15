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

var TaskItem = React.createClass({

    displayName: "TaskItem",

    getInitialState: function () {
        return {
            task: []
        }
    },

    render: function () {
        var task = this.props.task,
            li_className = (task.complete ? "completed" : ""),
            checkbox_className = "checkbox " + (task.complete ? "checked" : ""),
            mark = task.complete ? "&#9745;" : "&#9744;";
        return (
            React.createElement("li", {title: task.task, id: task.id + "_li", className: li_className},
                React.createElement("a", {
                    id: task.id,
                    href: "javascript:void(0)",
                    className: checkbox_className
                }, "mark"),
                React.createElement("span", {className: "text"}, task.task),
                React.createElement("a", {
                    href: "javascript:void(0)",
                    id: task.id + "_delete",
                    className: "dlt_icon"
                }, "⊗")
            )
        );
    }

});

var TaskList = React.createClass({

    displayName: "TaskList",

    setHandler: function (handler) {
        this._handler = handler;
    },

    getInitialState: function () {
        return {
            tasks: []
        }
    },
    appendTask: function (task) {
        this.state.tasks.push(task);
        this.setState({tasks: tasks});
    },
    removeTask: function (taskId) {
        this.state.tasks = this.state.tasks.filter(function (task) {
            return (task.id != taskId);
        });
        this.setState({tasks: this.state.tasks});

    },
    findTask: function (taskId) {
        var tasks = this.state.tasks || [];
        for (var idx = 0, len = tasks.length; idx < len; idx++) {
            if (tasks[idx].id == taskId) {
                return tasks[idx];
            }
        }
    },
    completeTask: function (taskId, complete) {
        var task = this.findTask(taskId);
        if (task) {
            task.complete = !!complete;
            this.setState({tasks: this.state.tasks});
        }
    },
    repaintList: function (tasks) {
        this.setState({tasks: tasks});
    },
    click: function (evt) {
        var target = evt.target || evt.srcElement;
        if (target.id && target.className.indexOf("checkbox") >= 0) {
            var taskId = target.id,
                checked = target.className.indexOf("checked") >= 0;
            //this.completeTask(taskId, checked);
            this._handler && this._handler.notify(TODOView.EVENT_TASK_CHANGED, {
                taskId: taskId,
                complete: !checked
            });
        } else if (target.id && target.id.indexOf("_delete") > 0) {
            var taskId = target.id.split("_")[0];
            //this.removeTask(taskId); 
            this._handler && this._handler.notify(TODOView.EVENT_DELETE_TASK, taskId);
        }

    },
    render: function () {
        return (
            React.createElement("ul", {id: "tasks_list", onClick: this.click},
                this.state.tasks.map(function (item) {
                    return React.createElement(TaskItem, {task: item, key: item.id})
                })
            )
        );
    }
});


var TODOView = function () {
    this.init();
};

TODOView.EVENT_ADD_TASK = "ADD_TASK";

TODOView.EVENT_TASK_CHANGED = "TASK_CHANGED";

TODOView.EVENT_DELETE_TASK = "DELETE_TASK";

Extend(TODOView, EventTarget, {
    init: function () {
        this._taskList = React.render(React.createElement(TaskList), $("list_container"));
        this._taskList.setHandler(this);
    },
    updateStatus: function (id, complete) {
        this._taskList.completeTask(id, complete);
    },
    renderList: function (list) {
        list = list || [];
        this._taskList.repaintList(list);
    },
    appendTask: function (task) {
        var new_task = $("new_task"); //reset new task value
        if (new_task) {
            new_task.value = "";
        }
        this._taskList.appendTask({task: task});
    },
    clearTask: function (taskId) {
        this._taskList.removeTask(taskId);
    },
    showMessage: function (msg, style) {
        var div = $("msg");
        if (div) {
            clearTimeout(this._timeout);
            div.className = style || "info";
            div.innerHTML = msg || ""; //Escape
            this._timeout = setTimeout(function () {
                div.className = "hide";
            }, 2000); //2 seconds delay
        }
    },
    showFilter: function (show) {
        var div = $("filter");
        if (div) {
            div.className = show ? "filter" : "hide";
        }
    }
});         