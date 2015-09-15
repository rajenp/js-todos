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

var TODOView = function () {
    this.init();
};

TODOView.TASK_TMPL = "<li title='{task}' id='{id}_li' class='{cls}'>\
    <a id='{id}' href='javascript:void(0)' class='checkbox {checked}'>{mark}</a>\
    <span class='text'>{task}</span>\
    <a href='javascript:void(0)' id='{id}_delete' class='dlt_icon'>⊗</a>\
    </li>";

TODOView.EVENT_ADD_TASK = "ADD_TASK";

TODOView.EVENT_TASK_CHANGED = "TASK_CHANGED";

TODOView.EVENT_DELETE_TASK = "DELETE_TASK";

Extend(TODOView, EventTarget, {
    init: function () {

        var list = $("list_container"),
            me = this;
        list.addEventListener("click", function (evt) {
            evt = evt || window.event;
            var target = evt.target || evt.srcElement;
            if (target.id && target.className.indexOf("checkbox") >= 0) { //only act on checkboxes with id
                var checked = target.className.indexOf("checked") >= 0; //checked;
                me._onTaskChange(target.id, !checked); //toggle state   
            } else if (target.id && target.id.indexOf("_delete") > 0) {
                var taskId = target.id.split("_")[0];
                me.notify(TODOView.EVENT_DELETE_TASK, taskId);
            }
        });
    },
    _onTaskChange: function (id, checked) {
        this.notify(TODOView.EVENT_TASK_CHANGED, {
            taskId: id,
            complete: !!checked
        });
    },
    updateStatus: function (id, complete) {
        var li = $(id + "_li");
        if (li) {
            li.className = complete ? "completed" : "";
        }
        var checkbox = $(id);
        if (checkbox) {
            checkbox.className = "checkbox " + (complete ? "checked" : "");
            checkbox.innerHTML = complete ? "&#9745;" : "&#9744;";
        }
    },
    renderList: function (list) {
        list = list || [];
        var dom = $("list_container");
        var html = [];
        dom && $each(list, function (value) {
            value.checked = value.complete ? "checked" : "";
            value.cls = value.checked ? "completed" : "";
            value.mark = value.checked ? "&#9745;" : "&#9744;";
            if (!value.complete) {
                html.splice(0, 0, $template(TODOView.TASK_TMPL, value));
            } else {
                html.push($template(TODOView.TASK_TMPL, value));
            }
        });
        dom.innerHTML = "<ul id='tasks_list'>" + html.join("") + "</ul>";
    },
    appendTask: function (task) {
        var new_task = $("new_task"); //reset new task value
        if (new_task) {
            new_task.value = "";
        }
        var dom = $("tasks_list");
        if (dom && task) {
            task.complete = false;
            task.mark = "&#9744;";
            var elem = document.createElement("ul");
            elem.innerHTML = $template(TODOView.TASK_TMPL, task);
            dom.insertBefore(elem.firstChild, dom.firstChild);
            elem = null;
        }
    },
    clearTask: function (taskId) {
        var task = $(taskId + "_li");
        if (task) {
            task.parentNode.removeChild(task);
        }
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