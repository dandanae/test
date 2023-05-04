function splitText(){
    //입력된 텍스트 전부
    const insertString = document.querySelector('.insert-textarea').value;

    //두 개 이상의 연속된 마침표 …….로 변경, 엔터 제거
    const changeFullStop = insertString.replace(/\.{2,}|…+/g, "…….").replace(/(\r\n|\n|\r)/gm, "");

    //450자로 쪼개기
    const chunksResult = chunkString(changeFullStop);
    const regex =/(?<=\?<\/b><\/em>|\.<\/b><\/em>|\!<\/b><\/em>|\~<\/b><\/em>|\?\s|\!\s|\.\s|\~\s)/g;
    
    let grammerChk;
    test(chunksResult).then((grammerChk) => {
        console.log(grammerChk);
      
        const splitStr = grammerChk.toString().split(regex).map(line => `/desc ${line.trim()}`).filter(str => str !== '');
      
        console.log(splitStr);

        const resultarea = document.querySelector('.result-textarea');
        resultarea.innerHTML = splitStr.join('<br>');
      }).catch(error => {
        console.error(error);
      });
}

function test(strArray){
    const promises = strArray.map((str) => {
      return fetch('https://m.search.naver.com/p/csearch/ocontent/util/SpellerProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: new URLSearchParams({
          'q': str,
          'where': 'nexearch',
          'color_blindness': 0
        })
      })
      .then(response => response.text())
      .then(data => {
        const replacedStr = data.toString().replace(/<em/g, "<em><b").replace(/<\/em>/g, "</b></em>");
        const response = JSON.parse(replacedStr);
        const resultHtml = response.message.result.html;
        return resultHtml;
      })
      .catch(error => {
        console.error(error);
        return '';
      });
    });
  
    return Promise.all(promises).then((results) => results.join(""));
  }

//450자 쪼개기
function chunkString(str) {
    const MAX_LENGTH = 450; // 최대 길이
    const result = []; // 결과를 저장할 배열
    let index = 0; // 현재 쪼개고 있는 문자열의 시작 인덱스
  
    // 문자열이 최대 길이보다 긴 경우
    while (index < str.length) {
      result.push(str.substr(index, MAX_LENGTH)); // 최대 길이만큼 문자열을 잘라서 결과 배열에 추가
      index += MAX_LENGTH; // 인덱스를 최대 길이만큼 증가시킴
    }
  
    return result;
  }