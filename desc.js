function splitText(){
    //입력된 텍스트 전부
    const _insertString = document.querySelector('.insert-textarea').value;

    //split
    const _basicSplitStr = _insertString.split(/(?<=\.+|\!+|\?+)/).map(line => `/desc ${line.trim()}`).filter(str => str !== '');

    //결과값 출력
    const resultarea = document.querySelector('.result-textarea');
    resultarea.innerHTML = _basicSplitStr.join('\n');
}