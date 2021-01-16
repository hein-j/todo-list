import * as helpers from './display-controller-helpers'
import * as projectController from './project-page-controller'

const content = document.querySelector('#content');
content.id = 'content';

let projectPage = document.createElement('div');

function displayProjectPage () {
    window.scrollTo(0,0);
    content.innerHTML = '';
    projectPage.innerHTML = '';
    projectPage.classList.remove('disabled', 'no-project-mode');
    content.appendChild(projectPage);
    let addProjectBtn = document.createElement('img');
    addProjectBtn.id = 'add-project-btn'
    addProjectBtn.src = 'Button to add project'
    addProjectBtn.src = 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Plus_symbol.svg'
    addProjectBtn.addEventListener('click', displayAddProjectWindow);
    if (projectController.projects.length === 0) {
        function displayNoProjects () {
            addProjectBtn.classList.add('no-project-add-btn')
            let copy = document.createElement('p');
            copy.id = 'no-projects-copy'
            copy.innerText = 'No projects. Make one now!'
            projectPage.appendChild(copy);
            projectPage.appendChild(addProjectBtn);
            projectPage.classList.add('no-project-mode');
        }
        displayNoProjects();
        return;
    }
    function displayProjects () {
        for (let project in projectController.projects) {
            let obj = projectController.projects[project];
            let container = document.createElement('div');
            container.classList.add('project-container');
            container.addEventListener('click', () => obj.open());
            let projectName = document.createElement('p');
            projectName.classList.add('project-name');
            projectName.innerText = obj.name;
            container.appendChild(projectName);
            projectPage.appendChild(container);
        }
        let container = document.createElement('div');
        container.id = 'add-btn-wrapper'
        projectPage.appendChild(container);
        container.appendChild(addProjectBtn);
    }
    displayProjects();
}

function displayAddProjectWindow () {
    projectPage.classList.add('disabled');
    let addProjectWindow = document.createElement('div');
    addProjectWindow.classList.add('popup-window');
    let cancelBtn = helpers.cancelBtnMaker();
    cancelBtn.addEventListener('click', () => {
        content.removeChild(addProjectWindow);
        projectPage.classList.remove('disabled');
    });
    let form = document.createElement('form');
    let name = document.createElement('input');
    name.required = true;
    name.id = 'name';
    name.classList.add('field');
    let label = document.createElement('label');
    label.classList.add('label');
    label.for = 'name';
    label.innerText = 'Project name:';
    let submitBtn = helpers.buttonMaker('submit-project', 'Add');
    submitBtn.classList.add('submit-btn');
    submitBtn.type = 'button';
    submitBtn.classList.add('disabled');
    submitBtn.addEventListener('click', () => {
        let projectName = name.value;
        projectController.addNewProject(projectName);
    })

    name.addEventListener('input', () => {
        if (name.checkValidity()) {
            submitBtn.classList.remove('disabled');
            return;
        }
        submitBtn.classList.add('disabled');
    });
    

    form.appendChild(label);
    form.appendChild(name);
    form.appendChild(submitBtn);
    addProjectWindow.appendChild(cancelBtn);
    addProjectWindow.appendChild(form);
    content.appendChild(addProjectWindow);
}

export {displayProjectPage}