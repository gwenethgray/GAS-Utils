function doGet() {
  return HtmlService.createTemplateFromFile("index").evaluate();
}

function start() {
  return;
}

var sheetId = ""; // your Google Sheet Id here

async function readSheets() {
  try {
    let sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
  } catch (error) {
    console.log(error);
    return error;
  }
  let nrows = sheet.getLastRow();
  let ncols = sheet.getLastColumn();
  let sheetValues = sheet.getRange(1, 1, nrows, ncols).getValues();
  let data = [...Array(ncols)].map(x => []);
  for (var row=0; row < nrows; row++) {
    if (row != 148) { // filter out the second to last row (before the total)
      for (var col=0; col < ncols; col++) {
        let val = sheetValues[row][col];
        if (col === 0 && typeof val != "string") {
          data[col].push(val.getTime());
        } else {
          data[col].push(val);
        };
      };
    };
  };
  return JSON.stringify(data);
}