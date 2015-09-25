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

    var TaskItem = React.createClass({

        displayName: "TaskItem",

        render: function() {
            var task = this.props.task,
                li_className = (task.complete ? "completed" : ""),
                checkbox_className = "checkbox " + (task.complete ? "checked" : ""),
                mark = task.complete ? "&#9745;" : "&#9744;";
            return (
                React.createElement("li", {
                        title: task.task,
                        id: task.id + "_li",
                        className: li_className
                    },
                    React.createElement("a", {
                        id: task.id,
                        href: "javascript:void(0)",
                        className: checkbox_className,
                        dangerouslySetInnerHTML: {
                            __html: mark
                        }
                    } /*, "mark"*/ ),
                    React.createElement("span", {
                        className: "text"
                    }, task.task),
                    React.createElement("a", {
                        href: "javascript:void(0)",
                        id: task.id + "_delete",
                        className: "dlt_icon"
                    }, "⊗")
                )
            );
        }

    });

    var NewTaskBar = React.createClass({

        displayName: "NewTaskBar",

        render: function() {
            return (
                React.createElement("form", {
                        onSubmit: this.onSubmit
                    },
                    React.createElement("label", {
                        htmlFor: "new_task",
                        className: "label"
                    }, "Enter a Task:"),
                    React.createElement("input", {
                        autoComplete: "off",
                        placeholder: "What do you have to do?",
                        type: "text",
                        id: "new_task"
                    }),
                    React.createElement("button", {
                        id: "new_task_btn",
                        "aria-label": "Add Task",
                        type: "submit"
                    }, "Add")
                )
            );
        },
        onSubmit: function(event) {
            var nTask = myLib.$("new_task"),
                value = myLib.trim(nTask.value);
            if (nTask) {
                this.props.onAddTask && this.props.onAddTask(value);
                nTask.value = ""; //reset
            }
            event.preventDefault();
        }

    });

    var TaskFilter = React.createClass({
        displayName: "TaskFilter",

        render: function() {
            return (
                React.createElement("span", null,
                    React.createElement("a", {
                        id: "all_l",
                        "data-filter": "",
                        href: "javascript:void(0)",
                        onClick: this.applyFilter,
                    }, " All"), " • ",
                    React.createElement("a", {
                        id: "all_p",
                        "data-filter": "false",
                        href: "javascript:void(0)",
                        onClick: this.applyFilter,
                    }, "Pending"), " • ",
                    React.createElement("a", {
                        id: "all_c",
                        "data-filter": "true",
                        onClick: this.applyFilter,
                        href: "javascript:void(0)"
                    }, "Completed ")
                )
            );
        },
        applyFilter: function(evt) {
            var target = evt.target || evt.srcElement;

            this._afi && (myLib.$(this._afi).className = "");
            this._afi = target.id;
            target.className = "active";
            var value = target.getAttribute("data-filter");

            this.props.onFilterChange && this.props.onFilterChange(value ? {
                complete: value === "true"
            } : {});
        }
    });

    var TaskList = React.createClass({

        displayName: "TaskList",

        _onClick: function(evt) {
            var target = evt.target || evt.srcElement;
            if (target.id && target.className.indexOf("checkbox") >= 0) {
                var taskId = target.id,
                    checked = target.className.indexOf("checked") >= 0;
                this.props.onTaskChange && this.props.onTaskChange({
                    taskId: taskId,
                    complete: !checked
                });
            } else if (target.id && target.id.indexOf("_delete") > 0) {
                var taskId = target.id.split("_")[0];
                this.props.onTaskDelete && this.props.onTaskDelete(taskId);
            }
        },

        render: function() {
            return (
                React.createElement("ul", {
                        id: "tasks_list",
                        onClick: this._onClick
                    },
                    this.props.tasks.map(function(item) {
                        return React.createElement(TaskItem, {
                            task: item,
                            key: item.id
                        })
                    })
                )
            );
        }
    });

    var TODOView = React.createClass({

        displayName: "TODOView",

        getInitialState: function() {
            return {
                tasks: []
            }
        },

        render: function() {
            return (
                React.createElement("div", {},
                    React.createElement("div", {
                        id: "msg"
                    }, "Loading..."),
                    React.createElement("div", {
                            id: "tasks"
                        },
                        React.createElement("div", {
                                id: "new_task_bar",
                                className: "new_task_bar"
                            },
                            React.createElement(NewTaskBar, {
                                onAddTask: this.props.onAddTask
                            })
                        ),
                        React.createElement("div", {
                                id: "filter",
                                className: "filter"
                            },
                            React.createElement(TaskFilter, {
                                onFilterChange: this.props.onFilterChange
                            })
                        ),
                        React.createElement("div", {
                                id: "list_container"
                            },
                            React.createElement(TaskList, {
                                tasks: this.state.tasks,
                                onTaskChange: this.props.onTaskChange,
                                onTaskDelete: this.props.onTaskDelete
                            })
                        )
                    ),
                    React.createElement("div", {
                        className: "view_info",
                    }, "React Based View.")

                )
            );
        },

        showMessage: function(msg, style) {
            var div = myLib.$("msg");
            if (div) {
                clearTimeout(this._timeout);
                div.className = style || "info";
                div.innerHTML = msg || ""; //Escape
                this._timeout = setTimeout(function() {
                    div.className = "hide";
                }, 2000); //2 seconds delay
            }
        },
        showFilter: function(show) {
            var div = myLib.$("filter");
            if (div) {
                div.className = show ? "filter" : "hide";
            }
        },
        findIndexById: function(taskId) {
            var tasks = this.state.tasks || [];
            for (var idx = 0, len = tasks.length; idx < len; idx++) {
                if (tasks[idx].id == taskId) {
                    return idx;
                }
            }
            return -1;
        },
        refreshTasks: function(tasks) {
            var newState = React.addons.update(this.state, {
                tasks: {
                    $set: tasks
                }
            });
            this.setState(newState);
        },
        addTask: function(task) {
            if (!task || !task.id) return;
            var newState = React.addons.update(this.state, {
                tasks: {
                    $push: [task]
                }
            });
            this.setState(newState);
        },
        removeTask: function(taskId) {
            var index = this.findIndexById(taskId);
            if (index > -1) {
                var newState = React.addons.update(this.state, {
                    tasks: {
                        $splice: [
                            [index, 1]
                        ]
                    }
                });
                this.setState(newState);
            }
        },
        completeTask: function(taskId, complete) {
            var index = this.findIndexById(taskId);
            if (index > -1) {
                var newState = React.addons.update(this.state, {
                    tasks: {
                        [index]: {
                            $apply: function(task) {
                                task.complete = !!complete;
                                return task;
                            }
                        }
                    }
                });
                this.setState(newState);
            }
        }
    });

    window.TODOView = TODOView;

}());
