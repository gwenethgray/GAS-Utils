function doGet() {
  return HtmlService.createTemplateFromFile("index").evaluate();
}

function start() {
  return;
}

function getCalendarHtml() {
  return HtmlService.createTemplateFromFile("calendar").evaluate().getContent();
}

var getDateRange = function(s,e) {for(var a=[],d=new Date(s);d<=new Date(e);d.setDate(d.getDate()+1)){ a.push(new Date(d));}return a;};

var sheetId = "";

// read the sheet containing form responses and return a dictionary of people scheduled for each date as of most recent form response
async function readSheet() {
  try {
    let sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Data')
    let nrows = sheet.getLastRow();
    let ncols = sheet.getLastColumn();
    let columnHeaders = sheet.getRange(1, 1, 1, ncols).getValues();
    let people = columnHeaders[0].slice(1, -3).map(s => s.split("[")[1].split("]")[0]);
    let peopleByDate = {};

    let sheetValues = sheet.getRange(2, 1, nrows, ncols).getValues();
    for (var row=0; row < nrows; row++) {
      // determine date range
      let startDate, endDate;
      [startDate, endDate] = sheetValues[row].slice(-3, -1);
      let entries = sheetValues[row].slice(1, -3);
      let dateRange = getDateRange(new Date(startDate), new Date(endDate));
      for (var dateRangeIndex=0; dateRangeIndex < dateRange.length; dateRangeIndex++) {
        let date = dateRange[dateRangeIndex];
        if (!peopleByDate.hasOwnProperty(date)) {
          peopleByDate[date] = [];
        }
        for (var i=0; i < entries.length; i++) {
          if (peopleByDate[date].includes(people[i])) {
            if (entries[i] == "Remove") {
              peopleByDate[date] = peopleByDate[date].filter(function(e) { return e !== people[i]});
            }
          } else {
            if (entries[i] == "Add") {
              peopleByDate[date].push(people[i]);
            }
          }
        }
      }
    };
    Object.keys(peopleByDate).map(function(s) {
      let sDate = new Date(s);
      let fmtDate = sDate.getFullYear() + "-"
                  + ("0" + (sDate.getMonth()+1)).slice(-2) + "-"
                  + ("0" + sDate.getDate()).slice(-2);
      peopleByDate[fmtDate] = peopleByDate[s];
      delete peopleByDate[s];
    });
    return JSON.stringify(peopleByDate);
  } catch (error) {
    Logger.log(error);
    return error;
  };
}

async function getPeople() {
  try {
    let sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Data')
    let nrows = sheet.getLastRow();
    let ncols = sheet.getLastColumn();
    let columnHeaders = sheet.getRange(1, 1, 1, ncols).getValues();
    let people = columnHeaders[0].slice(1, -3).map(s => s.split("[")[1].split("]")[0]);
    Logger.log(people);
    return JSON.stringify(people);
  } catch (error) {
    Logger.log(error);
    return error;
  };
}

async function serverGetApiKey() {
  try {
    // Get the value for the user property 'API Key'.
    const userProperties = PropertiesService.getScriptProperties();
    const apiKey = userProperties.getProperty('API Key');
    return JSON.stringify(apiKey);
  } catch (err) {
    // TODO (developer) - Handle exception
    console.log('Failed with error %s', err.message);
  }
}

async function serverGetCalendarId() {
  try {
    // Get the value for the user property 'Calendar ID'.
    const userProperties = PropertiesService.getScriptProperties();
    const calId = userProperties.getProperty('Calendar ID');
    return JSON.stringify(calId);
  } catch (err) {
    // TODO (developer) - Handle exception
    console.log('Failed with error %s', err.message);
  }
}