function getQuizzes(){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('Questions')
  
  // get quiz questions, filter out blank lines
  var quizArr = ss.getRange('A2:F').getValues()
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

function getScoreFormula(){
  var str = (
    '=IF(' + '\n' +
      'OR(B2 <> "", D2 <> "", E2 <> "", F2 <> "", G2 <> "", H2 <> "", I2 <> "", J2 <> "", K2 <> "", L2 <> "", M2 <> ""),' + '\n' +
      'SUM(' + '\n' +
        'IF(AND(D2 <> "", D2 = INDIRECT("Questions!F2"), Admin!$A$4 > 0), 1, 0),' + '\n' +
        'IF(AND(E2 <> "", E2 = INDIRECT("Questions!F3"), Admin!$A$4 > 1), 1, 0),' + '\n' +
        'IF(AND(F2 <> "", F2 = INDIRECT("Questions!F4"), Admin!$A$4 > 2), 1, 0),' + '\n' +
        'IF(AND(G2 <> "", G2 = INDIRECT("Questions!F5"), Admin!$A$4 > 3), 1, 0),' + '\n' +
        'IF(AND(H2 <> "", H2 = INDIRECT("Questions!F6"), Admin!$A$4 > 4), 1, 0),' + '\n' +
        'IF(AND(I2 <> "", I2 = INDIRECT("Questions!F7"), Admin!$A$4 > 5), 1, 0),' + '\n' +
        'IF(AND(J2 <> "", J2 = INDIRECT("Questions!F8"), Admin!$A$4 > 6), 1, 0),' + '\n' +
        'IF(AND(K2 <> "", K2 = INDIRECT("Questions!F9"), Admin!$A$4 > 7), 1, 0),' + '\n' +
        'IF(AND(L2 <> "", L2 = INDIRECT("Questions!F10"), Admin!$A$4 > 8), 1, 0),' + '\n' +
        'IF(AND(M2 <> "", M2 = INDIRECT("Questions!F11"), Admin!$A$4 > 9), 1, 0)' + '\n' +
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
  var leaders = filterSortLeaders(vals)
  var myScore = getMyScore(vals)
  var median = getMedian(vals)
  var adminCompleted = getAdminCompleted()
  var myEmail = Session.getActiveUser().getEmail()
  
  return ({
    leaders: leaders,
    myScore: myScore,
    median: median,
    adminCompleted: adminCompleted,
    myEmail: myEmail
  })
}

function filterSortLeaders(vals){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('Admin')
  var adminEmail = ss.getRange('B1').getValue()
  var adminCompleted = getAdminCompleted()
  var i = 0
  var leaders = []
  
  // keep iterating until at least 1 leader is found
  while (leaders.length < 1){ 
    leaders = filterLeaders(vals, adminCompleted, adminEmail, i)
    
    i += 1
    if ((i > adminCompleted && leaders.length < 1) || !leaders){
      return []
    }
  }
  
  return leaders.sort(compare)
}

function filterLeaders(vals, adminCompleted, adminEmail, i){
  var dif = Math.floor((adminCompleted + 0.25) * 0.39) + i
  var minimum = adminCompleted - dif
  if (minimum < 0){
    return false
  }
  
  var leaders = vals.filter(function(a){
    return (
      (a[1] || a[1] === 0) && // either truthy or 0
      (a[2] >= minimum) && // at least minimum
      (a[1] != adminEmail) // not the admin
    )
  })
  
  return leaders
}

function compare(a, b) {
  if (b[2] > a[2]) return 1;
  if (a[2] > b[2]) return -1;
  return 0;
}

function getMyScore(vals){
  var email = Session.getActiveUser().getEmail()
  
  // filter for user score
  var myScore
  for (var i = 0; i < vals.length; i++){
    if (vals[i][1] == email){
      myScore = vals[i][2];
      break;
    }
  }
  
  return myScore
}

function getMedian(vals){
  var email = Session.getActiveUser().getEmail()
  
  // filter for non-user scores
  var scores = []
  vals.forEach(function(a){
    if ((a[2] || a[2] == 0) && (a[1] != email) && a[1]){
      scores.push(a[2])
    }
  })
  
  // get and return median
  var half = Math.floor(scores.length / 2);
  
  // leaders length is odd num
  if (scores.length % 2 != 0){
    return scores[half];
  }
  
  // leaders length is even num
  else {
    return Math.round((scores[half - 1] + scores[half]) / 2);
  }
}

function getAdminCompleted(){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('Admin')
  
  return ss.getRange('A4').getValue()
}

function getSheetNames(){
  // **** NOT IN USE ****
  
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url)
  
  var sheets = ss.getSheets()
  var names = sheets.map(function(a){
    return a.getSheetName()
  })
  
  return names
}