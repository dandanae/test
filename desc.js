function splitText(){
    //입력된 텍스트 전부
    const insertString = document.querySelector('.insert-textarea').value;

    //두 개 이상의 연속된 마침표 …….로 변경
    let fixedText = insertString.replace(/\.{2,}|…+/g, "…….");

    fixedText = fixedText.replace(/([“”])/g, '"');

    //엔터 제거
    fixedText = fixedText.replace(/(\r\n|\n|\r)/gm, "");
    
    //문장부호 뒤에 공백 없을 시 추가
    fixedText = fixedText.replace(/([.?!~])(?=(?:[^"]|"[^"]*")*[^"]*$)(?=(?:[^']|'[^']*')*[^']*$)(\s*)(\S)/g, '$1$3');
    //450자로 잘라 배열에 저장
    const chunksResult = chunkString(fixedText);

    //마침표, 물음표, 느낌표, 물결표, 닫는 소괄호를 기준으로 split
    const regex =/(?<=\?<\/b><\/em>|\.<\/b><\/em>|\!<\/b><\/em>|\~<\/b><\/em>|\)<\/b><\/em>|\?\s|\!\s|\.\s|\~\s|\)\s|\.\")/g;

    //맞춤법 검사기(네이버) 돌리기
    checkSpelling(chunksResult).then((splitStr) => {
      //eturn된 값은 html 태그를 가지고 있는 Stringr
      //console.log(splitStr);
      
      //위에서 선언된 regex를 기준으로 split
      splitStr = splitStr.split(regex);

      // /desc를 붙이기
      splitStr = splitStr.map(line => `/desc ${line}`);
      //console.log(splitStr);

      //결과값을 출력할 div 불러오기
      const resultarea = document.querySelector('.result-textarea');

      //한 줄씩 결과값 출력
      resultarea.innerHTML = splitStr.join('<br>');
    }).catch(error => {
      console.error(error);
    });
}

//450자 쪼개기
function chunkString(originalString) {
  //최대 길이
  const MAX_LENGTH = 450;

  //결과를 저장할 배열
  const chunkArray = [];

  //문자열의 인덱스
  let startIndex = 0;

  // 문자열이 최대 길이보다 긴 경우
  while (startIndex < originalString.length) {
    // 최대 길이만큼 문자열을 잘라서 결과 배열에 추가
    chunkArray.push(originalString.substr(startIndex, MAX_LENGTH)); 

     // 인덱스를 최대 길이만큼 증가시킴
     startIndex += MAX_LENGTH;
  }

  return chunkArray;
}

function checkSpelling(strArray){
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

