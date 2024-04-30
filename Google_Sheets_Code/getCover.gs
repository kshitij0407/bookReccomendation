function updateBookCoverImagesAndURLs() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clean');
  var lastRow = sheet.getLastRow();
  var isbnColumn = sheet.getRange('A2:A' + lastRow).getValues();
  var coverFormulas = [];
  var urls = [];
  
  // Find the index for the "URL" column
  var headers = sheet.getRange("1:1").getValues()[0]; // Read the first row which contains headers
  var urlColumnIndex = headers.indexOf("URL") + 1; // Adding 1 because index starts at 0 but spreadsheet columns start at 1
  
  isbnColumn.forEach(function(row) {
    if (row[0] !== '') {
      var imageUrl = 'https://covers.openlibrary.org/b/isbn/' + row[0] + '-L.jpg';
      var formula = '=IMAGE("' + imageUrl + '", 1)';
      coverFormulas.push([formula]);
      urls.push([imageUrl]); // Collects only the URL
    } else {
      coverFormulas.push([""]);
      urls.push([""]);
    }
  });

  if (coverFormulas.length > 0) {
    // Writes the IMAGE formula to column D starting from D2
    sheet.getRange(2, 4, coverFormulas.length, 1).setFormulas(coverFormulas);
    
    // Writes the URLs to the "URL" column starting from row 2
    if (urlColumnIndex > 0) { // Checks if the "URL" column was found
      sheet.getRange(2, urlColumnIndex, urls.length, 1).setValues(urls);
    } else {
      Logger.log("URL column not found. Please make sure there is a column titled 'URL'.");
    }
  }
}
