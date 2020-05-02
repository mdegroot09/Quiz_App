function addUser(){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('User Results')
  
  // add new row
  ss.insertRowBefore(ss.getRange('A2').getRow())
  
  // get user email and paste on new row
  var email = Session.getActiveUser().getEmail()
  var name = getName(email)
  var formula = getScoreFormula()
  
  // paste values
  ss.getRange('A2').setValue(name)
  ss.getRange('B2').setValue(email)
  ss.getRange('C2').setValue(formula)
}

function addChoice(data){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('User Results')
  
  var choice = data.choice
  var column = (data.active * 1) + 4
  var email = Session.getActiveUser().getEmail()
  var row 
  
  // only update choice string if 'option' type
  if (choice != 'noAnswer'){
    choice = choice.split('option')[1]
  }
    
  // find user's row in ss
  var vals = ss.getRange('B2:B').getValues()
  for (var i = 0; i < vals.length; i++){
    if (email == vals[i]){
      row = i + 2
      break
    }
  }
  
  // input choice into respective cell
  if (row){
    ss.getRange(row, column).setValue(choice)
  }
  
  return updateShotclockStatus(false)
}

function getQuesStartTime(quesNum){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('Admin')
  var isAdmin = checkIsAdmin()
  var time
  
  // if admin, update start time
  if (isAdmin){
    time = updateQuesStartTime() 
  }
  
  // if not admin, return admin's start time if needed
  else {
    var adminCompleted = getAdminCompleted()
    var quesIsActive = ss.getRange('C4').getValue() 
    
    // return start time depending on shotclock status
    if (adminCompleted == quesNum){
      
      // if shotclock is active
      if (quesIsActive){
        time = Number(ss.getRange('B4').getValue())
      }
      
      // if shotclock isn't active yet
      else if (adminCompleted == quesNum && !quesIsActive){
        time = Number(new Date())
      }
    }
    
    // return current time if user is ahead of admin
    else if (adminCompleted < quesNum){
      time = Number(new Date())
    }
    
    // return expired time if admin is ahead of user
    else {
      time = Number(new Date()) + (60 * 2000)
    }
  }
  
  return ({
    time: time,
    isAdmin: isAdmin
  })
}

function checkIsAdmin(){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('Admin')
  var adminEmail = ss.getRange('B1').getValue()
  var userEmail = Session.getActiveUser().getEmail()
  
  return (adminEmail == userEmail)
}

function updateQuesStartTime(){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('Admin')
  var time = Number(new Date())
  
  ss.getRange('B4').setValue(time)
  updateShotclockStatus(true)
  return time
}

function updateShotclockStatus(isActive){
  var url = 'https://docs.google.com/spreadsheets/d/1IBJcmY6GoveD9xy4DTazgoMI24AxaTXIzwTL4DWkAfM/edit?usp=sharing'
  var ss = SpreadsheetApp.openByUrl(url).getSheetByName('Admin')
  
  ss.getRange('C4').setValue(isActive)
}