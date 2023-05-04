function splitText(){
  const insertString = document.querySelector('.insert-textarea').value;
  let fixedText = insertString.replace(/\.{2,}|…+/g, "…….");

  fixedText = fixedText.replace(/([“”])/g, '"');
  fixedText = fixedText.replace(/([‘’])/g, '\'');
  fixedText = fixedText.replace(/(\r\n|\n|\r)/gm, "");
  fixedText = fixedText.replace(/([.?!~])(?=\S)/g, '$1 ');

  const chunksResult = chunkString(fixedText);


  const regex =/(?<=\?<\/b><\/em>|\.<\/b><\/em>|\!<\/b><\/em>|\~<\/b><\/em>|\)<\/b><\/em>|\?\s|\!\s|\.\s|\~\s|\)\s)/g;


  checkSpelling(chunksResult).then((splitStr) => {
    splitStr = splitStr.split(regex);
    splitStr = splitStr.map(line => `/desc ${line.trim()}`);
    splitStr = modifyArray(splitStr);

    const resultarea = document.querySelector('.result-textarea');
    resultarea.innerHTML = splitStr.join('<br>');
  }).catch(error => {
    console.error(error);
  });
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