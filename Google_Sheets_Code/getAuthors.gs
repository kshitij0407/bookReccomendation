function getAuthorsByISBN() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clean'); 
  var lastRow = sheet.getLastRow(); 
  var isbnColumn = sheet.getRange('A2:A' + lastRow).getValues(); 
  var authorsColumn = [];

  isbnColumn.forEach(function(row) {
    if (row[0] !== '') { // Check if the ISBN cell is not empty
      try {
        var response = UrlFetchApp.fetch('https://openlibrary.org/isbn/' + row[0] + '.json');
        if (response.getResponseCode() == 200) {
          var bookData = JSON.parse(response.getContentText());
          var authors = (bookData.authors || []).map(function(author) {
            try {
              var authorResponse = UrlFetchApp.fetch('https://openlibrary.org' + author.key + '.json');
              if (authorResponse.getResponseCode() == 200) {
                var authorData = JSON.parse(authorResponse.getContentText());
                return authorData.name;
              }
            } catch (e) {
              // Failsafe for nested fetch if it fails
              Logger.log('Failed to fetch author details for ISBN: ' + row[0]);
            }
            return "Author not found";
          }).join(", ");
          
          authorsColumn.push([authors]);
        } else {
          authorsColumn.push(["Book not found"]);
        }
      } catch(e) {
        // Failsafe for the main fetch if it fails
        Logger.log('Failed to fetch book details for ISBN: ' + row[0]);
        authorsColumn.push(["Error fetching book info"]);
      }
    } else {
      authorsColumn.push([""]); // Keep blank if ISBN cell is empty
    }
  });
  
  // Writing the authors back to the sheet into column B starting from row 2
  if(authorsColumn.length > 0) { // Check if there's anything to write
    sheet.getRange(2, 2, authorsColumn.length, 1).setValues(authorsColumn); // Adjusted to write starting from B2
  }
}
