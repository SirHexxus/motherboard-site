// Google Apps Script — Motherboard Campaign Wiki
// Paste into Extensions → Apps Script in your Google Sheet.
// Deploy as Web app: Execute as Me, Access: Anyone.

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = data.type || 'misc';
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  // Add header row if sheet is empty
  if (sheet.getLastRow() === 0) {
    var headers = ['timestamp'].concat(Object.keys(data));
    sheet.appendRow(headers);
  }

  var row = [new Date()].concat(Object.values(data));
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Required for CORS preflight — Apps Script infrastructure handles the
// actual CORS headers on POST responses when deployed as "Anyone" access.
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
