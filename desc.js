function convertText(){
  const kpcName = document.querySelector('#KPCname').value;
  const pcName = document.querySelector("#PCname").value;
  console.log(pcName);
  const insertString = document.querySelector('.insert-textarea').value;

  
  let sanitizedResult = sanitizeString(insertString);
  const chunksResult = chunkString(sanitizedResult);
  
  
  const regex =/(?<=\?<\/b><\/em>|\.<\/b><\/em>|\!<\/b><\/em>|\~<\/b><\/em>|\)<\/b><\/em>|\?\s|\!\s|\.\s|\~\s|\)\s|\”\s|\)\s)/g;

  checkSpelling(chunksResult).then((splitStr) => {
    if(kpcName != "") { splitStr = replaceParticle(splitStr, kpcName,'kpc'); }
    if(pcName != "") {splitStr = replaceParticle(splitStr, kpcName,/((?<!K)pc|pl|탐사자)/gi.source); }

    splitStr = splitStr.split(regex).map(line=>line.trim());
    splitStr = joinUntilQuoteEnds(splitStr);
    //splitStr = splitStr.replace(/([“”])/g, '"').replace(/([‘’])/g, '\'');
    splitStr = splitStr.map(line => `/desc ${line.trim()}`);
    
    const resultarea = document.querySelector('.result-textarea');
    resultarea.innerHTML = splitStr.join('<br>');
  }).catch(error => {
    console.error(error);
  });
}

function sanitizeString(originalString){
  let sanitizedString = originalString.replace(/\.{2,}|…+/g, "…….")
                                  .replace(/c\s+/gi, "C").replace(/l\s+/gi, "L")
                                  .replace(/(\r\n|\n|\r)/gm, "")
                                  .replace(/([.?!~”])(?!\s|\)|”)/g, '$1 ');
                                  //.replace(/([“”])/g, '"')
                                  //.replace(/([‘’])/g, '\'')
  return sanitizedString;
}

function chunkString(originalString) {
  const MAX_LENGTH = 450;
  const chunkArray = [];
  let startIndex = 0;

  while (startIndex < originalString.length) {
    chunkArray.push(originalString.substr(startIndex, MAX_LENGTH)); 
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
      const replacedStr = data.toString().replace(/<em/g, '<em><b').replace(/<\/em>/g, '</b></em>');
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

function modifyArray(arr) {
  const pattern1 = '/desc &quot;&quot;';
  
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].includes(pattern1)) {
      arr[i] = arr[i].replace('/desc &quot;&quot;', '/desc &quot;');
      arr[i - 1] = arr[i - 1].trim() + '&quot;';
    }
  }
  const pattern2 = '/desc &quot;';
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].includes(pattern2) && arr[i-1].includes(pattern2)) {
      if(arr[i-1].charAt(arr[i-1].length-1) == ';'){
        continue;
      }else{
        arr[i] = arr[i].replace('/desc &quot;', '/desc ');
        arr[i - 1] = arr[i - 1].trim() + '&quot;';
      }
    }
  }
  return arr;
}

function copyText(){
  let resultTextarea = document.querySelector('.result-textarea');
  let text = resultTextarea.innerHTML.replace(/<em><b class=\"(green|red|blue|violet)_text\">|<\/b><\/em>/g, '').replace(/<br>/g, '\n');
  navigator.clipboard.writeText(text);
}

function replaceParticle(splitStr, name, particleName) {
  const lastChar = name[name.length - 1];
  const isVowel = /[ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z]/.test(lastChar);

  const eun_neun = isVowel ? "은" : "는";
  const i_ga = isVowel ? "이" : "가";
  const eul_reul = isVowel ? "을" : "를";
  const wa_gwa = isVowel ? "과" : "와";

  return splitStr
  .replace(new RegExp(`${particleName}는`, "gi"), name + eun_neun)
  .replace(new RegExp(`${particleName}가`, "gi"), name + i_ga)
  .replace(new RegExp(`${particleName}를`, "gi"), name + eul_reul)
  .replace(new RegExp(`${particleName}와`, "gi"), name + wa_gwa)
  .replace(new RegExp(particleName, "gi"), name);
}

function joinUntilQuoteEnds(arr) {
  const result = [];
  let current = '';

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    if (element.startsWith('[') || element.startsWith('(') || element.startsWith('“')) {
      current = element;
    } else if (current) {
      current += ' ' + element;

      if ((element.endsWith(']') || element.endsWith(')') || element.endsWith('”')) && !element.endsWith('[ ]') && !element.endsWith('( )') && !element.endsWith('“')) {
        result.push(current);
        current = '';
      }
    } else {
      result.push(element);
    }
  }

  if (current) {
    result.push(current);
  }
  return result;
}