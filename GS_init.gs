var doGet = (request) => {
  return HtmlService.createTemplateFromFile('HTML').evaluate();
}

var include = (filename) => {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}