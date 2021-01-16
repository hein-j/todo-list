import * as helpers from './display-controller-helpers'
import * as projectDisplayController from './project-page-display-controller'
import { format, parse, parseISO, differenceInCalendarDays, differenceInCalendarYears } from 'date-fns'
import * as projectController from './project-page-controller'

const content = document.querySelector('#content');

let todoList = document.createElement('div');

function displayTodoList (project) {
    window.scrollTo(0,0);
    content.innerHTML = '';
    todoList.innerHTML = '';
    todoList.classList.remove('disabled');
    todoList.id = 'todo-list-wrapper';
    content.appendChild(todoList);
    let seeProjectsBtn = document.createElement('p');
    seeProjectsBtn.innerHTML = '<em><</em> projects'
    seeProjectsBtn.addEventListener('click', projectDisplayController.displayProjectPage);
    let headerWrapper = document.createElement('div');
    headerWrapper.id = 'header-wrapper'
    todoList.appendChild(headerWrapper);
    let topMostWrapper = document.createElement('div');
    topMostWrapper.id = 'top-most-wrapper'
    headerWrapper.appendChild(topMostWrapper);
    topMostWrapper.appendChild(seeProjectsBtn);
    seeProjectsBtn.id = 'see-projects-btn';
    let optionsBtn = document.createElement('img');
    optionsBtn.id = 'options-btn';
    optionsBtn.src = 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Hamburger_icon.svg'
    optionsBtn.alt = 'Button for project options'
    optionsBtn.addEventListener('click', () => displayProjectOptions(project));
    topMostWrapper.appendChild(optionsBtn);
    let title = document.createElement('h1');
    title.innerText = project.name;
    headerWrapper.appendChild(title);
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
        checkBoxCell.classList.add('checkbox-cell');
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
        taskTitleCell.classList.add('title-cell');
        taskTitleCell.addEventListener('click', () => {
            let index = project.todoList.indexOf(todo);
            displayEditTodo(project.todoList[index], project);
        })
        let taskTitle = document.createElement('p');
        taskTitle.innerText = todo.title
        taskTitleCell.appendChild(taskTitle);
        row.appendChild(taskTitleCell);
        
        let dueDateCell = document.createElement('td');
        dueDateCell.classList.add('date-cell');
        dueDateCell.addEventListener('click', () => {
            let index = project.todoList.indexOf(todo);
            displayEditTodo(project.todoList[index], project);
        })
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
    let addTable = document.createElement('table');
    addTable.id = 'add-table'
    let addTaskRow = document.createElement('tr');
    addTaskRow.addEventListener('click', () => displayAddNewTodo(project));
    addTable.appendChild(addTaskRow);
    let checkboxCell = document.createElement('td');
    checkboxCell.classList.add('checkbox-cell')
    addTaskRow.appendChild(checkboxCell);
    let checkbox = document.createElement('div');
    checkboxCell.appendChild(checkbox);
    checkbox.classList.add('checkbox');
    let addTaskCopyCell = document.createElement('td');
    addTaskRow.appendChild(addTaskCopyCell);
    addTaskCopyCell.classList.add('title-cell');
    let addTaskCopy = document.createElement('p');
    addTaskCopy.id = 'add-task-copy';
    addTaskCopy.innerText = 'Add new task...'
    addTaskCopyCell.appendChild(addTaskCopy);    
    
    todoList.appendChild(list);
    todoList.appendChild(addTable);
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
    projectOptions.classList.add('popup-window');
    projectOptions.id = 'project-options'
    let cancelBtn = helpers.cancelBtnMaker();
    projectOptions.appendChild(cancelBtn);
    cancelBtn.addEventListener('click', function () {
        content.removeChild(projectOptions);
        todoList.classList.remove('disabled');
    })
    let projectOptionsForm = document.createElement('form');
    projectOptions.appendChild(projectOptionsForm);
    let nameLabel = document.createElement('label');
    nameLabel.classList.add('label');
    projectOptionsForm.appendChild(nameLabel);
    nameLabel.for = 'project-name';
    nameLabel.innerText = 'Project Name: ';
    let projectName = document.createElement('input');
    projectOptionsForm.appendChild(projectName);
    projectName.id = 'project-name';
    projectName.classList.add('field');
    projectName.value = project.name;
    projectName.required = true;
    projectName.placeholder = 'Required';
    projectName.addEventListener('input', toggleSubmitBtn);

    let checkedItemsWrapper = document.createElement('div');
    let checkedItemsLabel = document.createElement('label');
    checkedItemsWrapper.appendChild(checkedItemsLabel);
    checkedItemsWrapper.id = 'checked-items-wrapper';
    checkedItemsLabel.for = 'show-checked'
    checkedItemsLabel.innerText = 'Show checked items: '
    let showCheckedItems = document.createElement('input');
    showCheckedItems.type = 'checkbox';
    checkedItemsWrapper.appendChild(showCheckedItems);
    showCheckedItems.id = 'show-checked';
    showCheckedItems.checked = project.showCheckedItems;
    showCheckedItems.addEventListener('input', toggleSubmitBtn);
    projectOptionsForm.appendChild(checkedItemsWrapper);

    let sortByParagraph = document.createElement('p');
    sortByParagraph.id = 'sort-by-paragraph';
    projectOptionsForm.appendChild(sortByParagraph);
    sortByParagraph.innerText = 'Sort by:';
    let sortByCreatedLabel = document.createElement('label');
    sortByCreatedLabel.for = 'by-created';
    sortByCreatedLabel.innerText = 'date created';
    let sortByCreated = document.createElement('input');
    sortByCreated.type = 'radio';
    sortByCreated.id = 'by-created';
    sortByCreated.value = 'created';
    sortByCreated.name = 'sort-by';
    sortByCreated.addEventListener('input', toggleSubmitBtn);
    let sortByDueLabel = document.createElement('label');
    sortByDueLabel.for = 'by-due'
    sortByDueLabel.innerText = 'due date'
    let sortByDue = document.createElement('input');
    sortByDue.type = 'radio';
    sortByDue.id = 'by-due';
    sortByDue.value = 'due';
    sortByDue.name = 'sort-by';
    sortByDue.addEventListener('input', toggleSubmitBtn);

    let sortByWrapper = document.createElement('div');
    sortByWrapper.id = 'sort-by-wrapper';
    projectOptionsForm.appendChild(sortByWrapper);
    let dateCreatedWrapper = document.createElement('div');
    let dateDueWrapper = document.createElement('div');
    sortByWrapper.appendChild(dateCreatedWrapper);
    sortByWrapper.appendChild(dateDueWrapper);
    dateCreatedWrapper.appendChild(sortByCreated);
    dateCreatedWrapper.appendChild(sortByCreatedLabel);
    dateDueWrapper.appendChild(sortByDue);
    dateDueWrapper.appendChild(sortByDueLabel);    


    document.querySelector(`#by-${project.sortBy}`).checked = true;
    let submitBtn = helpers.buttonMaker('submit-change', 'Submit');
    submitBtn.classList.add('submit-btn');
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
    deleteProjectsBtn.classList.add('submit-btn', 'delete-btn');
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

function TodoWindow () {
    todoList.classList.add('disabled');
    let popUp = document.createElement('div');
    popUp.classList.add('popup-window');
    content.appendChild(popUp);
    let cancelBtn = helpers.cancelBtnMaker();
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
    titleLabel.innerText = 'Title: ';
    titleLabel.classList.add('label');
    let title = document.createElement('input');
    title.placeholder = 'Required'
    form.appendChild(title);
    title.id = 'title';
    title.classList.add('field');
    title.required = true;
    let descriptionLabel = document.createElement('label');
    descriptionLabel.classList.add('label');
    form.appendChild(descriptionLabel);
    descriptionLabel.for = 'description';
    descriptionLabel.innerText = 'Description:';
    let description = document.createElement('textarea');
    description.classList.add('field');
    form.appendChild(description);
    description.id = 'description';
    let dateLabel = document.createElement('label');
    dateLabel.for = 'date';
    dateLabel.classList.add('label');
    form.appendChild(dateLabel);
    dateLabel.innerText = 'Due date: '
    let date = document.createElement('input');
    form.appendChild(date);
    date.type = 'date';
    date.id = 'date';
    let todaysDate = format(new Date(), 'yyyy-MM-dd');
    date.min = todaysDate;
    let priorityLabel = document.createElement('label');
    priorityLabel.classList.add('label');
    form.appendChild(priorityLabel);
    priorityLabel.for = 'priority';
    priorityLabel.innerText = 'Priority: ';
    let priority = document.createElement('select');
    priority.id = 'priority';
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
    let submitBtn = helpers.buttonMaker('submit-todo', 'Submit');
    submitBtn.classList.add('submit-btn');
    form.appendChild(submitBtn);
    submitBtn.classList.add('disabled');
    return {
        title,
        submitBtn,
        date, 
        description,
        priority,
        popUp,
        form,
    }
}

function displayAddNewTodo (project) {
    let addNewTodo = TodoWindow();
    let {title, submitBtn, date, description, priority, popUp} = addNewTodo;
    popUp.id = 'add-todo-wrapper';
    title.addEventListener('input', toggleSubmitBtn);
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
    let editTodo = TodoWindow ();
    let {title, submitBtn, date, description, priority, popUp, form} = editTodo;
    popUp.id = 'edit-todo-wrapper'
    title.value = todo.title;
    title.addEventListener('input', toggleSubmitBtn);
    description.value = todo.description;
    description.addEventListener('input', toggleSubmitBtn);
    if (todo.dueDate !== '') {
        date.value = format(new Date(todo.dueDate), 'yyyy-MM-dd');
    }
    date.addEventListener('input', toggleSubmitBtn);

    let options = document.querySelectorAll('option');
    for (let option of options) {
        if (option.value === todo.priority) {
            option.selected = true;
        }
    }
    priority.addEventListener('change', toggleSubmitBtn);

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
    deleteBtn.classList.add('submit-btn');
    form.appendChild(deleteBtn);
    deleteBtn.addEventListener('click', function () {
        todo.remove(project);
        refreshPage();
    })
}

export {displayTodoList}