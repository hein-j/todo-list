function buttonMaker (id, innerText) {
    let button = document.createElement('button');
    button.id = id;
    button.innerText = innerText;
    button.type = 'button';
    return button;
}

export {buttonMaker}