function main() {
  var sheetId = '';
  var sheet = SpreadsheetApp.getActiveSheet();
  var formData = sheet.getRange(2, 2, sheet.getLastRow(), 4);
  var emailRecipient = "";
  let htmlTemplate = HtmlService.createTemplateFromFile('email');

  // randomly select a breakfast meal
  let randomBreakfast = randomMeal(["Breakfast"], formData, sheetId);
  htmlTemplate.breakfastName = randomBreakfast[2];
  htmlTemplate.breakfastLink = randomBreakfast[3];

  // randomly select a lunch meal
  let randomLunch = randomMeal(["Lunch", "Lunch/Dinner"], formData, sheetId);
  htmlTemplate.lunchName = randomLunch[2];
  htmlTemplate.lunchLink = randomLunch[3];
  
  // randomly select a dinner meal
  let randomDinner = randomMeal(["Dinner", "Lunch/Dinner"], formData, sheetId);
  htmlTemplate.dinnerName = randomDinner[2];
  htmlTemplate.dinnerLink = randomDinner[3];

  // email summary of today's meal selections
  let htmlForEmail = htmlTemplate.evaluate().getContent();
  GmailApp.sendEmail(
    emailRecipient,
    'Daily Meal Prep ' + new Date().toString(),
    'This email contains html', 
    {htmlBody: htmlForEmail}
  );

  // update days since last eaten for all meals
  let mealNames = [randomBreakfast[1], randomLunch[1], randomDinner[1]];
  for (var rowNum = 2; rowNum <= sheet.getLastRow(); rowNum++) {
    let rowData = sheet.getRange(rowNum, 2, 1, 4).getValues()[0];
    let mealName = rowData[0];
    if (!mealNames.includes(mealName)) {
      // increment days since last eaten
      let numDays = rowData[3] + 1;
      let valueRange = Sheets.newValueRange();
      valueRange.values = [[numDays]];
      let updateResult = Sheets.Spreadsheets.Values.update(valueRange, sheetId, 'E' + rowNum.toString(), {valueInputOption: 'RAW'});
    }
  }
}

function randomMeal(mealTypes, formData, sheetId) {
  let formValues = formData.getValues();
  formValues.forEach((row) => row.unshift(2 + formValues.indexOf(row)));
  let meals = formValues.filter((row) => mealTypes.includes(row[1]) && row[4] != 0);
  let lessRecentMeals = meals.filter((row) => row[4] > 4);
  if (lessRecentMeals.length > 0) {
    let randomIndex = Math.floor(Math.random() * lessRecentMeals.length);
    let selectedMeal = lessRecentMeals[randomIndex];
    // reset days since last eaten
    let valueRange = Sheets.newValueRange();
    valueRange.values = [[0]];
    let updateResult = Sheets.Spreadsheets.Values.update(valueRange, sheetId, 'E' + selectedMeal[0].toString(), {valueInputOption: 'RAW'});
    return selectedMeal;
  } else {
    let i = 4;
    while (i > 0) {
      let lessRecentMeals = meals.filter((row) => row[4] > i);
      if (lessRecentMeals.length > 0) {
        let randomIndex = Math.floor(Math.random() * lessRecentMeals.length);
        let selectedMeal = lessRecentMeals[randomIndex];
        // reset days since last eaten
        let valueRange = Sheets.newValueRange();
        valueRange.values = [[0]];
        let updateResult = Sheets.Spreadsheets.Values.update(valueRange, sheetId, 'E' + selectedMeal[0].toString(), {valueInputOption: 'RAW'});
        return selectedMeal;
      } else {
        i -= 1;
      }
    }
    return [0, "Error", "Couldn't find a meal", "-"];
  }
}

function handleFormSubmit() {
  var sheetId = '';
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    let lastRow = sheet.getLastRow();
    let valueRange = Sheets.newValueRange();
    valueRange.values = [[7]];
    let updateResult = Sheets.Spreadsheets.Values.update(valueRange, sheetId, 'E' + lastRow.toString(), {valueInputOption: 'RAW'});
  } catch (err) {
    console.log('Failed with error %s', err.message);
  }
}

//var sheet = SpreadsheetApp.getActive();
//ScriptApp.newTrigger("handleFormSubmit")
//  .forSpreadsheet(sheet)
//  .onFormSubmit()
//  .create();