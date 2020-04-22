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
  
  return
}