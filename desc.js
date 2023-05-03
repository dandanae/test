function splitText(){
    //입력된 텍스트 전부
    const _insertString = document.querySelector('.insert-textarea').value;

    //두 개 이상의 연속된 마침표 …….로 변경, 엔터 제거
    const _changeFullStop = _insertString.replace(/\.{2,}|…+/g, "…….").replace(/(\r\n|\n|\r)/gm, "");

    //마침표, 물음표, 느낌표 기준으로 잘라내기
    const _splitStr = _changeFullStop.split(/(?<=\.+|\!+|\?+|\~+)/).map(line => `/desc ${line.trim()}`).filter(str => str !== '');

    //결과값 출력할 div 가져오기
    const resultarea = document.querySelector('.result-textarea');

    //결과값 출력
    resultarea.innerHTML = _splitStr .join('\n');
}

function test(){
    fetch('https://m.search.naver.com/p/csearch/ocontent/util/SpellerProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: new URLSearchParams({
          'q': '왜 않된데?', // 여기에 검색어를 입력하세요
          'where': 'nexearch',
          'color_blindness': 0
        })
      })
      .then(response => response.text())
      .then(data => {
        console.log(data);
        const resultStr = data.toString();
        const response = JSON.parse(resultStr);
        const resultHtml = response.message.result.html;
        const resultTextarea = document.querySelector('.result-textarea');
        resultTextarea.innerHTML = resultHtml;
      })
      .catch(error => {
        console.error(error);
      });
}