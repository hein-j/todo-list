import * as localStorageController from './local-storage-controller.js'
import * as projectDisplayController from './project-page-display-controller'
import * as todoListDisplayController from './todo-list-display-controller'

function initialLoadProjectPage () {
    let incompleteArray = localStorageController.getStorage();
    for (let obj of incompleteArray) {
        let project = Project(obj.id, obj.name, obj.showCheckedItems, obj.sortBy, obj.todoList);
        projects.push(project);
    }
    for (let project of projects) {
        for (let i = 0; i < project.todoList.length; i++) {
            let todo = project.todoList[i];
            let completeTodo = Todo(todo.title, todo.description, todo.dueDate, todo.priority, todo.isDone);
            project.todoList[i] = completeTodo;
        }
    }
    projectDisplayController.displayProjectPage();
}

let projects = [];

const Todo = (title, description, dueDate, priority, isDone) => {
    function toggleCheck () {
        // method to toggle the check
    }
    
    function edit (newTitle, newDescription, newDueDate, newPriority) {
        this.title = newTitle;
        this.description = newDescription;
        this.dueDate = newDueDate;
        this.priority = newPriority;
        localStorageController.setStorage();
    }

    function remove (project) {
        let that = this;
        let index = project.todoList.indexOf(that);
        project.todoList.splice(index, 1);
        localStorageController.setStorage();
    }

    function toggleDone () {
        let that = this;
        if (this.isDone === false) {
            this.isDone = true;
        }
            else {
                this.isDone = false;
            }
        localStorageController.setStorage();
    }

    return {
        title,
        description,
        dueDate,
        priority,
        edit,
        remove,
        isDone,
        toggleDone,
    }
}

function addNewTodo (project, title, description, dueDate, priority) {
    let newTodo = Todo(title, description, dueDate, priority, false);
    project.todoList.push(newTodo);
    localStorageController.setStorage();


}

const Project = (id, name, showCheckedItems, sortBy, todoList) => {
    function remove () {
        let that = this;
        let index = projects.indexOf(that);
        projects.splice(index, 1);
        localStorageController.setStorage();
    }

    function open () {
        let that = this;
        todoListDisplayController.displayTodoList(that);
    }

    function add () {
        let that = this;
        projects.push(that);
        localStorageController.setStorage();
    }

    function edit (newName, newShowCheckedItems, newsortBy) {
        this.name = newName;
        this.showCheckedItems = newShowCheckedItems;
        this.sortBy = newsortBy;
        localStorageController.setStorage();
    }
    
    return {
        id,
        add,
        open,
        todoList,
        name,
        showCheckedItems,
        sortBy,
        remove,
        edit,
    }
}

function addNewProject (projectName) {
    let newProject = Project(Date.now(), projectName, false, 'created', []);
    newProject.add();
    newProject.open();
}



export {initialLoadProjectPage, addNewProject, projects, addNewTodo}

