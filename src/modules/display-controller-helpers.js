function buttonMaker (id, innerText) {
    let button = document.createElement('button');
    button.id = id;
    button.innerText = innerText;
    button.type = 'button';
    return button;
}

function cancelBtnMaker () {
    let cancelBtn = document.createElement('img');
    cancelBtn.alt = 'button to cancel';
    cancelBtn.src = 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Grey_close_x.svg'
    cancelBtn.classList.add('cancel-btn');
    return cancelBtn;
}
export {buttonMaker, cancelBtnMaker}