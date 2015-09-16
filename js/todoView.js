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

    var TODOView = function(props) {
        this.props = props || {};
        this.init();
    };

    TODOView.TASK_TMPL = "<li title='{task}' id='{id}_li' class='{cls}'>\
    <a id='{id}' href='javascript:void(0)' class='checkbox {checked}'>{mark}</a>\
    <span class='text'>{task}</span>\
    <a href='javascript:void(0)' id='{id}_delete' class='dlt_icon'>⊗</a>\
    </li>";

    TODOView.VIEW_TMPL = "<div id='msg'>Loading...</div>\
    <div id='tasks'>\
        <div id='new_task_bar' class='new_task_bar'>\
        <form id='the_form'>\
            <label for='new_task' class='label'>Enter a Task:</label>\
            <input autocomplete='off' placeholder='What do you have to do?' type='text' id='new_task'>\
            <button id='new_task_btn' aria-label='Add Task' type='submit'>Add</button>\
        </form>\
        </div>\
        <div id='filter' class='filter'>\
            <a id='all_l' data-filter='' href='javascript:void(0)'> All</a> &#8226;\
            <a id='all_p' data-filter='false' href='javascript:void(0)'>Pending</a> &#8226;\
            <a id='all_c' data-filter='true' href='javascript:void(0)'>Completed </a>\
        </div>\
        <div id='list_container'>\
        </div>\
    </div>\
    <div class='view_info'>Plain JS Based View</div>";

    TODOView.EVENT_ADD_TASK = "ADD_TASK";

    TODOView.EVENT_TASK_CHANGED = "TASK_CHANGED";

    TODOView.EVENT_DELETE_TASK = "DELETE_TASK";

    myLib.Extend(TODOView, myLib.EventTarget, {
        init: function() {
            var container = myLib.$("main_view"),
                props = this.props,
                dom;

            container.innerHTML = myLib.$template(TODOView.VIEW_TMPL);

            dom = myLib.$("the_form");
            dom.addEventListener("submit", function(evt) {
                var nTask = myLib.$("new_task"),
                value = myLib.trim(nTask.value);
                if (nTask) {
                    props.onAddTask && props.onAddTask(value);
                    nTask.value = ""; //reset
                }
                event.preventDefault();
            });

            dom = myLib.$("filter");
            dom.addEventListener("click", function(evt) {
                var target = evt.target || evt.srcElement;
                if (target.id && target.id.indexOf("all") >= 0) {
                    this._afi && (myLib.$(this._afi).className = "");
                    this._afi = target.id;
                    target.className = "active";
                    var value = target.getAttribute("data-filter");
                    props.onFilterChange && props.onFilterChange(value ? {
                        complete: value === "true"
                    } : {});
                }    
            });

            dom = myLib.$("list_container");
            dom.addEventListener("click", function(evt) {
                var target = evt.target || evt.srcElement;
                if (target.id && target.className.indexOf("checkbox") >= 0) {
                    var taskId = target.id,
                        checked = target.className.indexOf("checked") >= 0;
                    props.onTaskChange && props.onTaskChange({
                        taskId: taskId,
                        complete: !checked
                    });
                } else if (target.id && target.id.indexOf("_delete") > 0) {
                    var taskId = target.id.split("_")[0];
                    props.onTaskDelete && props.onTaskDelete(taskId);
                }
            });
        },

        onTaskChange: function(id, checked) {
            this.notify(TODOView.EVENT_TASK_CHANGED, {
                taskId: id,
                complete: !!checked
            });
        },
        onTaskDelete: function(taskId) {
            this.notify(TODOView.EVENT_TASK_CHANGED, {
                taskId: id,
                complete: !!checked
            });
        },
        completeTask: function(id, complete) {
            var li = myLib.$(id + "_li");
            if (li) {
                li.className = complete ? "completed" : "";
            }
            var checkbox = myLib.$(id);
            if (checkbox) {
                checkbox.className = "checkbox " + (complete ? "checked" : "");
                checkbox.innerHTML = complete ? "&#9745;" : "&#9744;";
            }
        },
        refreshTasks: function(list) {
            list = list || [];
            var dom = myLib.$("list_container");
            var html = [];
            dom && myLib.$each(list, function(value) {
                value.checked = value.complete ? "checked" : "";
                value.cls = value.checked ? "completed" : "";
                value.mark = value.checked ? "&#9745;" : "&#9744;";
                if (!value.complete) {
                    html.splice(0, 0, myLib.$template(TODOView.TASK_TMPL, value));
                } else {
                    html.push(myLib.$template(TODOView.TASK_TMPL, value));
                }
            });
            dom.innerHTML = "<ul id='tasks_list'>" + html.join("") + "</ul>";
        },
        addTask: function(task) {
            var dom = myLib.$("tasks_list");
            if (dom && task) {
                task.complete = false;
                task.mark = "&#9744;";
                var elem = document.createElement("ul");
                elem.innerHTML = myLib.$template(TODOView.TASK_TMPL, task);
                dom.insertBefore(elem.firstChild, dom.firstChild);
                elem = null;
            }
        },
        removeTask: function(taskId) {
            var task = myLib.$(taskId + "_li");
            if (task) {
                task.parentNode.removeChild(task);
            }
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
        }
    });

    window.JSTODOView = TODOView;
}());
