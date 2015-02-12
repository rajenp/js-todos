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

TODOView.TASK_TMPL = "<li title='{task}' id='{id}_li' class='{cls}'><input type='checkbox' {checked} id='{id}'> <span class='text'>{task}</span> </li>";

TODOView.EVENT_ADD_TASK = "ADD_TASK";

TODOView.EVENT_TASK_CHANGED = "TASK_CHANGED";

Extend(TODOView, EventTarget, {
	init: function () {
		var list = $("tasks_list");
		var me = this;
		list.addEventListener('click', function (evt) {
			evt = evt || window.event;	
			var target = evt.target || evt.srcElement;
			if (target.id && target.type == "checkbox" && typeof target.checked !== "undefined") { //only act on checkboxes with id
				var checked = target.checked;
				//wait until we update it on server
				target.checked = !target.checked;
				me._onTaskChange(target.id, checked);	
			}
		});
	},
	_onTaskChange: function (id, checked) {
		this.notify(TODOView.EVENT_TASK_CHANGED, {taskId: id, complete: !!checked});	
	},
	updateStatus: function(id, complete) {
		var li  = $(id + "_li");
		if (li) {
			li.className = complete ?  "completed" : "";
		}
		var checkbox = $(id);
		if (checkbox) {
			checkbox.checked = !!complete;
		}
	},
	renderList: function (list) {
		list = list || [];
		var dom = $("tasks_list");	
		var html = [];
		dom && $each(list, function(value) {
			value.checked = value.complete ? "checked" : "";
			value.cls = value.checked ? "completed" : "";
			if (!value.complete) {
				html.splice(0, 0, $template(TODOView.TASK_TMPL, value));	
			} else {
				html.push($template(TODOView.TASK_TMPL, value));	
			}
		});
		dom.innerHTML = html.join("");
	},
	appendTask: function (task) {
		var new_task = $("new_task"); //reset new task value
		if (new_task) {
			new_task.value = "";
		}
		var dom = $("tasks_list");	
		task && dom && (dom.innerHTML = $template(TODOView.TASK_TMPL, task) + dom.innerHTML);
		this.showMessage("Task added");
	},
	showMessage: function (msg, style) {
		var div = $("msg");
		if (div) {
			clearTimeout(this._timeout);
			div.className = style || "info";
			div.innerHTML = msg || "";  //Escape
			this._timeout = setTimeout(function(){
				div.className = "hide";
			}, 2000); //2 seconds delay
		}
	}
});

var TODOController = function () {};

Extend(TODOController, EventTarget, {
	init: function () {
		this._service = new LocalTODOService(); //new TODOServer(); // If you want to use remte todoserver
		this._view = new TODOView();
		this._view.listen(TODOView.EVENT_ADD_TASK, new Callback(this.addTask, this));
		this._view.listen(TODOView.EVENT_TASK_CHANGED, new Callback(this.updateTask, this));
	},
	_preProcessResponse: function (response) {	
		if (response && response.response && !response.error) {
			return typeof response.response === "string" ? JSON.parse(response.response) : response.response;
		} 
		this._view.showMessage("Error: " +  (response.error || "Something went wrong!"), "error");
	},
	launch: function () {
		this.init();
		this.getTasks(); //start getting existing tasks
	},
	//Add 
	addTask: function (data) {
		if (!data || !data.task) {
			return this._view.showMessage("Please enter task", "error");
		}
		this._view.showMessage("Adding new task...");
		this._service.addTask(data, new Callback(this.taskAdded, this));
	},
	taskAdded: function (response) {
		var task = this._preProcessResponse(response);
		if (task) {
			if (!this._listReady) {
				return this.getTasks(); 
			}
			this._view.appendTask(task);
			this._view.showMessage("Task added");
		}
	},
	//List
	getTasks: function () {
		this._view.showMessage("Fetching tasks...");
		this._service.getTasks(new Callback(this.tasksReceived, this));
	},
	tasksReceived: function (response) {
		var tasks = this._preProcessResponse(response);
		if (tasks) {
			this._view.renderList(tasks);
			this._view.showMessage(tasks.length  + " task" + (tasks.length > 1 ? "s" : "")+" found");	
			this._listReady = true;
		}
	},
	//Update
	updateTask: function (data) {
		this._view.showMessage("Updating task...");
		if (data && data.taskId) {
			this._service.updateTask(data.taskId, data.complete, new Callback(this.taskUpdated, this));
		}
	},
	taskUpdated: function (response) {
		var task = this._preProcessResponse(response);
		if (task) {
			this._view.updateStatus(task.id, task.complete);
			this._view.showMessage("Task updated");
		}	 
	}
});

