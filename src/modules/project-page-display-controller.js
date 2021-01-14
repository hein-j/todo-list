import * as helpers from './display-controller-helpers'
import * as projectController from './project-page-controller'

const content = document.querySelector('#content');

let projectPage = document.createElement('div');

function displayProjectPage () {
    content.innerHTML = '';
    projectPage.innerHTML = '';
    projectPage.classList.remove('disabled');
    content.appendChild(projectPage);
    let addProjectBtn = helpers.buttonMaker('add-project', 'Add Project');
    addProjectBtn.addEventListener('click', displayAddProjectWindow);
    if (projectController.projects.length === 0) {
        function displayNoProjects () {
            let copy = document.createElement('p');
            copy.innerText = 'No projects. Make one now!'
            projectPage.appendChild(copy);
            projectPage.appendChild(addProjectBtn);
        }
        displayNoProjects();
        return;
    }
    function displayProjects () {
        for (let project in projectController.projects) {
            let obj = projectController.projects[project];
            let container = document.createElement('div');
            container.addEventListener('click', () => obj.open());
            let projectName = document.createElement('p');
            projectName.innerText = obj.name;
            container.appendChild(projectName);
            projectPage.appendChild(container);
        }
        let container = document.createElement('div');
        container.appendChild(addProjectBtn);
        projectPage.appendChild(container);
    }
    displayProjects();
}

function displayAddProjectWindow () {
    projectPage.classList.add('disabled');
    let addProjectWindow = document.createElement('div');
    let cancelBtn = helpers.buttonMaker('cancel-btn', 'X');
    cancelBtn.addEventListener('click', () => {
        content.removeChild(addProjectWindow);
        projectPage.classList.remove('disabled');
    });
    let form = document.createElement('form');
    let name = document.createElement('input');
    name.required = true;
    name.id = 'name';
    let label = document.createElement('label');
    label.for = 'name';
    label.innerText = 'Project name: ';
    let submitBtn = helpers.buttonMaker('submit-project', 'Submit Project');
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