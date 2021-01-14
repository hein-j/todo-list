import * as helpers from './display-controller-helpers'
import * as projectDisplayController from './project-page-display-controller'
import { format, parse, parseISO, differenceInCalendarDays, differenceInCalendarYears } from 'date-fns'
import * as projectController from './project-page-controller'

const content = document.querySelector('#content');

let todoList = document.createElement('div');

function displayTodoList (project) {
    content.innerHTML = '';
    todoList.innerHTML = '';
    todoList.classList.remove('disabled');
    content.appendChild(todoList);
    let seeProjectsBtn = helpers.buttonMaker('see-projects', 'back to projects');
    seeProjectsBtn.addEventListener('click', projectDisplayController.displayProjectPage);
    todoList.appendChild(seeProjectsBtn);
    let title = document.createElement('h1');
    title.innerText = project.name;
    todoList.appendChild(title);
    let optionsBtn = helpers.buttonMaker('options', 'See options');
    optionsBtn.addEventListener('click', () => displayProjectOptions(project));
    todoList.appendChild(optionsBtn);
    let listToDisplay = project.todoList.slice(0);
    if (project.sortBy === 'due') {
        let noDueDate = listToDisplay.filter(todo => todo.dueDate === '');
        let hasDueDate = listToDisplay.filter(todo => todo.dueDate !== '');
        hasDueDate = hasDueDate.sort( (a, b) => {
            let aDate = new Date(a.dueDate);
            let bDate = new Date(b.dueDate);
            if (aDate > bDate) {
                return 1;
            }
            if (aDate < bDate) {
                return -1;
            }
            return 0;
        });
        listToDisplay = hasDueDate.concat(noDueDate);
    }
    
    let list = document.createElement('table');

    function renderDone (row) {
        if (project.showCheckedItems === true) {
            row.classList.toggle('crossed-out');
        }
            else {
                row.hidden = true;
            }
    }
    for (let todo of listToDisplay) {
        let row = document.createElement('tr');
        if (todo.isDone === true) {
            renderDone(row);
        }
        if (todo.priority !== '') {
            row.classList.add(`${todo.priority}`);
        }
        let checkBoxCell = document.createElement('td');
        let checkBox = document.createElement('div');
        checkBox.addEventListener('click', function () {
            let that = this;
            let index = project.todoList.indexOf(todo);
            project.todoList[index].toggleDone();
            renderDone(row);
        })
        checkBox.classList.add('checkbox');
        checkBoxCell.appendChild(checkBox);
        row.appendChild(checkBoxCell);
        
        let taskTitleCell = document.createElement('td');
        taskTitleCell.addEventListener('click', () => {
            let index = project.todoList.indexOf(todo);
            displayEditTodo(project.todoList[index], project);
        })
        let taskTitle = document.createElement('p');
        taskTitle.innerText = todo.title
        taskTitleCell.appendChild(taskTitle);
        row.appendChild(taskTitleCell);
        
        let dueDateCell = document.createElement('td');
        let dueDate = document.createElement('p');
        if (todo.dueDate === '') {
            dueDate.innerText = '';
        }
            else {
               dueDate.innerText = formatDisplayedDueDate(todo.dueDate);
            }
        dueDateCell.appendChild(dueDate);
        row.appendChild(dueDateCell);

        list.appendChild(row);
    }
    
    let row = document.createElement('tr');
    let addTaskCell = document.createElement('td');
    let addTaskBtn = helpers.buttonMaker('add-task', 'Add task');
    addTaskBtn.addEventListener('click', () => displayAddNewTodo(project));
    addTaskCell.appendChild(addTaskBtn);
    row.appendChild(addTaskCell);
    list.appendChild(row);
    todoList.appendChild(list);
}

function formatDisplayedDueDate (date) {
    let dateObj = new Date(date)
    let yearsFromToday = differenceInCalendarYears(dateObj, new Date());
    if (yearsFromToday >= 1) {
        return format(dateObj, 'MMM dd, yyyy');
    }
    let daysFromToday = differenceInCalendarDays(dateObj, new Date());
    if (daysFromToday === 1) {
        return 'Tomorrow!'
    }
    if (daysFromToday === 0) {
        return 'Today!'
    }
    if (daysFromToday < 0) {
        return 'Overdue!'
    }
    return format(dateObj, 'MMM d');
}  

function displayProjectOptions (project) {
    todoList.classList.add('disabled');
    let projectOptions = document.createElement('div');
    content.appendChild(projectOptions);
    let cancelBtn = helpers.buttonMaker('cancel-add', 'Cancel');
    projectOptions.appendChild(cancelBtn);
    cancelBtn.addEventListener('click', function () {
        content.removeChild(projectOptions);
        todoList.classList.remove('disabled');
    })
    let projectOptionsForm = document.createElement('form');
    projectOptions.appendChild(projectOptionsForm);
    let nameLabel = document.createElement('label');
    projectOptionsForm.appendChild(nameLabel);
    nameLabel.for = 'project-name';
    nameLabel.innerText = 'Project Name: ';
    let projectName = document.createElement('input');
    projectOptionsForm.appendChild(projectName);
    projectName.id = 'project-name';
    projectName.value = project.name;
    projectName.required = true;
    projectName.addEventListener('input', toggleSubmitBtn);

    let checkedItemsLabel = document.createElement('label');
    projectOptionsForm.appendChild(checkedItemsLabel);
    checkedItemsLabel.for = 'show-checked'
    checkedItemsLabel.innerText = 'Show checked items?'
    let showCheckedItems = document.createElement('input');
    showCheckedItems.type = 'checkbox';
    projectOptionsForm.appendChild(showCheckedItems);
    showCheckedItems.id = 'show-checked';
    showCheckedItems.checked = project.showCheckedItems;
    showCheckedItems.addEventListener('input', toggleSubmitBtn);

    let sortByParagraph = document.createElement('p');
    projectOptionsForm.appendChild(sortByParagraph);
    sortByParagraph.innerText = 'Sort by?';
    let sortByCreatedLabel = document.createElement('label');
    projectOptionsForm.appendChild(sortByCreatedLabel);
    sortByCreatedLabel.for = 'by-created';
    sortByCreatedLabel.innerText = 'date created';
    let sortByCreated = document.createElement('input');
    projectOptionsForm.appendChild(sortByCreated);
    sortByCreated.type = 'radio';
    sortByCreated.id = 'by-created';
    sortByCreated.value = 'created';
    sortByCreated.name = 'sort-by';
    sortByCreated.addEventListener('input', toggleSubmitBtn);
    let sortByDueLabel = document.createElement('label');
    projectOptionsForm.appendChild(sortByDueLabel);
    sortByDueLabel.for = 'by-due'
    sortByDueLabel.innerText = 'due date'
    let sortByDue = document.createElement('input');
    projectOptionsForm.appendChild(sortByDue);
    sortByDue.type = 'radio';
    sortByDue.id = 'by-due';
    sortByDue.value = 'due';
    sortByDue.name = 'sort-by';
    sortByDue.addEventListener('input', toggleSubmitBtn);
    document.querySelector(`#by-${project.sortBy}`).checked = true;
    let submitBtn = helpers.buttonMaker('submit-change', 'Submit change');
    projectOptionsForm.appendChild(submitBtn);
    submitBtn.classList.add('disabled');
    submitBtn.addEventListener('click', function () {
        project.edit(
            projectName.value, 
            showCheckedItems.checked, 
            document.querySelector("input[name='sort-by']:checked").value
            )
        displayTodoList(project);
        todoList.classList.remove('disabled');
    })
    let deleteProjectsBtn = helpers.buttonMaker('delete-project', 'Delete project');
    projectOptionsForm.appendChild(deleteProjectsBtn);
    deleteProjectsBtn.addEventListener('click', function () {
        project.remove();
        projectDisplayController.displayProjectPage();
    })

    function toggleSubmitBtn () {
        if (projectName.checkValidity() &&
            (projectName.value !== project.name ||
            showCheckedItems.checked !== project.showCheckedItems ||
            !document.querySelector(`#by-${project.sortBy}`).checked)
            ) {
                submitBtn.classList.remove('disabled');
                return;
            }
        submitBtn.classList.add('disabled');
    }
}

function displayAddNewTodo (project) {
    todoList.classList.add('disabled');
    let popUp = document.createElement('div');
    content.appendChild(popUp);
    let cancelBtn = helpers.buttonMaker('cancel-add-todo', 'x');
    popUp.appendChild(cancelBtn);
    cancelBtn.addEventListener('click', () => {
        content.removeChild(popUp);
        todoList.classList.remove('disabled');
    })
    let form = document.createElement('form');
    popUp.appendChild(form);
    let titleLabel = document.createElement('label');
    form.appendChild(titleLabel);
    titleLabel.for = 'title';
    titleLabel.innerText = 'Title * :';
    let title = document.createElement('input');
    form.appendChild(title);
    title.id = 'title';
    title.required = true;
    title.addEventListener('input', toggleSubmitBtn);
    let descriptionLabel = document.createElement('label');
    form.appendChild(descriptionLabel);
    descriptionLabel.for = 'description';
    descriptionLabel.innerText = 'Description:';
    let description = document.createElement('textarea');
    form.appendChild(description);
    description.id = 'description';
    let dateLabel = document.createElement('label');
    dateLabel.for = 'date';
    form.appendChild(dateLabel);
    dateLabel.innerText = 'Due date: '
    let date = document.createElement('input');
    form.appendChild(date);
    date.type = 'date';
    date.id = 'date';
    let todaysDate = format(new Date(), 'yyyy-MM-dd');
    date.min = todaysDate;
    let priorityLabel = document.createElement('label');
    form.appendChild(priorityLabel);
    priorityLabel.for = 'priority';
    priorityLabel.innerText = 'Priority: ';
    let priority = document.createElement('select');
    form.appendChild(priority);
    function optionMaker (value, innerText) {
        let option = document.createElement('option');
        option.value = value;
        option.innerText = innerText;
        priority.appendChild(option);
        return option;
    }
    let defaultOption = optionMaker('', '---');
    let lowOption = optionMaker('low', 'Low');
    let mediumOption = optionMaker('medium', 'Medium');
    let highOption = optionMaker('high', 'High');
    let submitBtn = helpers.buttonMaker('submit-todo', 'Add');
    form.appendChild(submitBtn);
    submitBtn.classList.add('disabled');
    function toggleSubmitBtn () {
        if (title.checkValidity()) {
            submitBtn.classList.remove('disabled');
            return;
        }
        submitBtn.classList.add('disabled');
    }
    submitBtn.addEventListener('click', () => {
       let dateString = '';
        if (date.value !== '') {
            let localDate = date.value + ' 00:00';
            
            dateString = new Date(localDate);
        }
        projectController.addNewTodo(
            project, 
            title.value, 
            description.value, 
            dateString, 
            priority.value
        );
        content.removeChild(popUp);
        todoList.classList.remove('disabled');
        displayTodoList(project);
    } )
}

function displayEditTodo (todo, project) {
    todoList.classList.add('disabled');
    let popUp = document.createElement('div');
    content.appendChild(popUp);
    let cancelBtn = helpers.buttonMaker('cancel-add-todo', 'x');
    popUp.appendChild(cancelBtn);
    cancelBtn.addEventListener('click', () => {
        content.removeChild(popUp);
        todoList.classList.remove('disabled');
    })
    let form = document.createElement('form');
    popUp.appendChild(form);
    let titleLabel = document.createElement('label');
    form.appendChild(titleLabel);
    titleLabel.for = 'title';
    titleLabel.innerText = 'Title * :';
    let title = document.createElement('input');
    form.appendChild(title);
    title.value = todo.title;
    title.id = 'title';
    title.required = true;
    title.addEventListener('input', toggleSubmitBtn);
    let descriptionLabel = document.createElement('label');
    form.appendChild(descriptionLabel);
    descriptionLabel.for = 'description';
    descriptionLabel.innerText = 'Description:';
    let description = document.createElement('textarea');
    form.appendChild(description);
    description.id = 'description';
    description.value = todo.description;
    description.addEventListener('input', toggleSubmitBtn);
    let dateLabel = document.createElement('label');
    dateLabel.for = 'date';
    form.appendChild(dateLabel);
    dateLabel.innerText = 'Due date: '
    let date = document.createElement('input');
    form.appendChild(date);
    date.type = 'date';
    date.id = 'date';
    let todaysDate = format(new Date(), 'yyyy-MM-dd');
    date.min = todaysDate;
    if (todo.dueDate !== '') {
        date.value = format(new Date(todo.dueDate), 'yyyy-MM-dd');
    }
    date.addEventListener('input', toggleSubmitBtn);
    let priorityLabel = document.createElement('label');
    form.appendChild(priorityLabel);
    priorityLabel.for = 'priority';
    priorityLabel.innerText = 'Priority: ';
    let priority = document.createElement('select');
    form.appendChild(priority);
    function optionMaker (value, innerText) {
        let option = document.createElement('option');
        option.value = value;
        option.innerText = innerText;
        priority.appendChild(option);
        return option;
    }
    let defaultOption = optionMaker('', '---');
    let lowOption = optionMaker('low', 'Low');
    let mediumOption = optionMaker('medium', 'Medium');
    let highOption = optionMaker('high', 'High');

    let options = document.querySelectorAll('option');
    for (let option of options) {
        if (option.value === todo.priority) {
            option.selected = true;
        }
    }

    priority.addEventListener('change', toggleSubmitBtn);

    let submitBtn = helpers.buttonMaker('edit-todo', 'Edit');
    form.appendChild(submitBtn);
    submitBtn.classList.add('disabled');
   function toggleSubmitBtn () {
        if (title.checkValidity() &&
            (title.value !== todo.title ||
            description.value !== todo.description ||
            priority.value !== todo.priority ||
            (todo.dueDate === '' && date.value !== '') ||
            (todo.dueDate !== '' && date.value === '') ||
            (todo.dueDate !== '' && (date.value !== format(new Date(todo.dueDate), 'yyyy-MM-dd'))))
        ) {
            submitBtn.classList.remove('disabled');
            return;
        }
        submitBtn.classList.add('disabled');
    }
    submitBtn.addEventListener('click', () => {
        let dateString = '';
         if (date.value !== '') {
             let localDate = date.value + ' 00:00';
             
             dateString = new Date(localDate);
         }
        todo.edit(
            title.value,
            description.value,
            dateString,
            priority.value
        )
        refreshPage();
    } )
    
    function refreshPage() {
        content.removeChild(popUp);
        todoList.classList.remove('disabled');
        displayTodoList(project);
    }


    let deleteBtn = helpers.buttonMaker('delete-todo', 'Delete');
    form.appendChild(deleteBtn);
    deleteBtn.addEventListener('click', function () {
        todo.remove(project);
        refreshPage();
    })
}

export {displayTodoList}