const smishingDetection = require('./smishingDetection');
const readline = require('readline');

// Create a readline interface to take user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function for detecting smishing in a given SMS message
function detectSmishing(text) {
  const result = smishingDetection.detectSmishing(text);
  console.log(`Message: "${text}"`);
  console.log(`Classification: ${result.classification}`);
  console.log(`Reason: ${result.reason}`);

  // Collect and store the report
  smishingDetection.smishingReports.push({
    message: text,
    classification: result.classification,
    reasons: result.reasons,
  });

  
  rl.question('Enter another SMS message or press Enter to exit: ', (smsMessage) => {
    if (smsMessage) {
      detectSmishing(smsMessage);
    } else {
      smishingDetection.displayReports();
      rl.close();
    }
  });
}

// Prompt the user to enter an SMS message
rl.question('Enter an SMS message: ', (smsMessage) => {
  detectSmishing(smsMessage);
});

