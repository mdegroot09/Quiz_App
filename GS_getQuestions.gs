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
      idCorrect: ('option' + a[5])
    }
  })
  
  quiz = getUserResults(quiz)
  
  return quiz
}

function getUserResults(quiz){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url)
  
  // get user results data
  var userResults = ss.getSheetByName('User Results').getRange('A2:M').getValues()
  userResults = userResults.filter(function(a){
    return a[1] == Session.getActiveUser().getEmail()
  })
  
  // if user email not found, add user
  if (!userResults[0]){
    addUser()
    return quiz
  }
  
  // if user email IS found, get user's data
  else {
    quiz = addResultsToObj(quiz, userResults[0])
    return quiz
  }
}

function addUser(){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('User Results')
  
  // add new row
  ss.insertRowBefore(ss.getRange('A2').getRow())
  
  // get user email and paste on new row
  var email = Session.getActiveUser().getEmail()
  ss.getRange('B2').setValue(email)
  
  // get user name from email
  var fullName = email.split('@')[0]
  
  var lastName = fullName.split('.')[1].split('')
  lastName[0] = lastName[0].toUpperCase()
  lastName = lastName.join('')
  
  var firstName = fullName.split('.')[0].split('')
  firstName[0] = firstName[0].toUpperCase()
  firstName = firstName.join('')
  
  ss.getRange('A2').setValue(firstName + ' ' + lastName)
}

function addResultsToObj(quiz, userResults){
  quiz.forEach(function(q, i){
    var choice = userResults[i + 3]
    if (choice){
      quiz[i].choice = 'option' + userResults[i + 3]
    }
  })
  
  return quiz
}