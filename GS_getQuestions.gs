function getQuizzes(){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url)
  
  // get quiz questions, filter out blank lines
  var quizArr = ss.getSheetByName('Questions').getRange('A2:F10').getValues()
  quizArr = quizArr.filter(function(a){
    return a[0]
  })
  
  // create quiz arr of objects
  var quiz = quizArr.map(function(a){
    return {
      question: a[0],
      optionA: a[1],
      optionB: a[2],
      optionC: a[3],
      optionD: a[4],
      idCorrect: a[5]
    }
  })
  
  return quiz
}