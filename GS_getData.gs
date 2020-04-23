function getQuizzes(){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('Questions')
  
  // get quiz questions, filter out blank lines
  var quizArr = ss.getRange('A2:F10').getValues()
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
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('User Results')
  
  // get user results data
  var userResults = ss.getRange('A2:M').getValues()
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

function getFormula(){
  var str = (
    '=IF(' + '\n' +
      'OR(D2 <> "", E2 <> "", F2 <> "", G2 <> "", H2 <> "", I2 <> "", J2 <> "", K2 <> "", L2 <> "", M2 <> ""),' + '\n' +
      'SUM(' + '\n' +
        'IF(AND(D2 <> "", D2 = INDIRECT("Questions!F2")), 1, 0),' + '\n' +
        'IF(AND(E2 <> "", E2 = INDIRECT("Questions!F3")), 1, 0),' + '\n' +
        'IF(AND(F2 <> "", F2 = INDIRECT("Questions!F4")), 1, 0),' + '\n' +
        'IF(AND(G2 <> "", G2 = INDIRECT("Questions!F5")), 1, 0),' + '\n' +
        'IF(AND(H2 <> "", H2 = INDIRECT("Questions!F6")), 1, 0),' + '\n' +
        'IF(AND(I2 <> "", I2 = INDIRECT("Questions!F7")), 1, 0),' + '\n' +
        'IF(AND(J2 <> "", J2 = INDIRECT("Questions!F8")), 1, 0),' + '\n' +
        'IF(AND(K2 <> "", K2 = INDIRECT("Questions!F9")), 1, 0),' + '\n' +
        'IF(AND(L2 <> "", L2 = INDIRECT("Questions!F10")), 1, 0),' + '\n' +
        'IF(AND(M2 <> "", M2 = INDIRECT("Questions!F11")), 1, 0)' + '\n' +
      ')' + '\n' +
    ',"")'
  )
  
  return str
}

function getName(email){
  // get user name from email
  var fullName = email.split('@')[0]
  
  // add first name
  var firstName = fullName.split('.')[0].split('')
  firstName[0] = firstName[0].toUpperCase()
  firstName = firstName.join('')
  
  // add last name if found
  var lastName = ''
  if (fullName.length > 1){
    lastName = fullName.split('.')[1].split('')
    lastName[0] = lastName[0].toUpperCase()
    lastName = ' ' + lastName.join('')
  }
  
  return (firstName + lastName)
}

function addResultsToObj(quiz, userResults){
  quiz.forEach(function(q, i){
    var choice = userResults[i + 3]
    if (choice == 'noAnswer'){
      quiz[i].choice = choice
    }
    else if (choice){
      quiz[i].choice = 'option' + choice
    }
  })
  
  return quiz
}

function getLeaders(){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('User Results')
  
  var vals = ss.getRange('A2:C').getValues()
  var leaders = filterLeaders(vals)
  leaders = leaders.sort(compare)
  var myScore = getMyScore(leaders)
  var median = getMedian(leaders)
  
  return ({
    leaders: leaders,
    myScore: myScore,
    median: median
  })
}

function filterLeaders(vals){
  var leaders = vals.filter(function(a){
    return (a[2] || a[2] === 0)
  })
  
  return leaders
}

function compare(a, b) {
  if (b[2] > a[2]) return 1;
  if (a[2] > b[2]) return -1;
  return 0;
}

function getMyScore(leaders){
  var email = Session.getActiveUser().getEmail()
  
  // filter for user score
  var myScore
  for (var i = 0; i < leaders.length; i++){
    if (leaders[i][1] == email){
      myScore = leaders[i][2];
      break;
    }
  }
  
  return myScore
}

function getMedian(leaders){
  var email = Session.getActiveUser().getEmail()
  
  // filter for non-user scores
  var scores = leaders.map(function(a){
    if ((a[2] || a[2] == 0) && (a[1] != email)){
      return a[2]
    }
  })
  
  // get and return median
  var half = Math.floor(scores.length / 2);
  if (scores.length % 2 == 0){
    return scores[half];
  }
  else {
    return Math.round((scores[half - 1] + scores[half]) / 2);
  }
}