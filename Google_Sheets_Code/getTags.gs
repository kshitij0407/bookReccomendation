function getSubjectsByISBN() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clean'); 
  var lastRow = sheet.getLastRow(); 
  var isbnColumn = sheet.getRange('A2:A' + lastRow).getValues(); 
  var tagsColumn = [];

  isbnColumn.forEach(function(row) {
    if (row[0] !== '') { // Check if the ISBN cell is not empty
      try {
        var response = UrlFetchApp.fetch('https://openlibrary.org/isbn/' + row[0] + '.json');
        if (response.getResponseCode() == 200) {
          var bookData = JSON.parse(response.getContentText());
          
          // Fetching subjects and compiling them into a comma-separated string
          var subjects = (bookData.subjects || []).map(function(subject) {
            return subject.name;
          }).join(", ");

          tagsColumn.push([subjects]);
        } else {
          tagsColumn.push(["Book not found"]);
        }
      } catch(e) {
        Logger.log('Failed to fetch details for ISBN: ' + row[0]);
        tagsColumn.push(["Error fetching book info"]);
      }
    } else {
      tagsColumn.push([""]); // Keep blank if ISBN cell is empty
    }
  });
  
  // Writing the subjects (tags) back to the sheet into column C starting from row 2
  if(tagsColumn.length > 0) { // Check if there's anything to write
    sheet.getRange(2, 3, tagsColumn.length, 1).setValues(tagsColumn); // Adjusted to write starting from C2
  }
}
