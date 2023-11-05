const natural = require('natural');
const Classifier = natural.BayesClassifier;
const linkify = require('linkify-it')();

// Customize TLDs (Top-Level Domains) to recognize in your URLs
linkify.tlds('onion', false); // Recognize ".onion" TLD
linkify.tlds('info', true);   // Recognize ".info" TLD
// Add custom TLDs as needed

// Train the classifier with sample data (use a real dataset for better results)
const classifier = new Classifier();
classifier.addDocument("Congratulations! You've won a free vacation. Click the link to claim your prize.", 'smishing');
classifier.addDocument('Hello, this is your bank. Please verify your account by clicking the link.', 'smishing');
classifier.addDocument('Your package has arrived and can be picked up at our store.', 'not smishing');
classifier.addDocument('Your password has been reset. Click the link to confirm.', 'smishing');
classifier.train();

// Check for the presence of links using "linkify-it"
function hasLink(text) {
  const matches = linkify.match(text);
  return !!matches;
}

function detectSmishing(text) {
  const stopwords = [
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'and', 'or',
    // Add more common stopwords as needed
  ];
  
  const tokenizer = new natural.WordTokenizer();
  const stemmer = natural.PorterStemmer;

  // Check for keywords related to financial fraud or identity theft
  const hasFinancialKeyword = /financial|fraud|identity|theft/.test(text);

  // Define trigger words
  const triggerWords = [
    "urgent",
    "claim",
    "prize",
    "verify",
    "reset",
    "account",
    "winner",
    "free",
    "discount",
    "lottery",
    "credit",
    "winner",
    "money",
    "congratulations",
    "banned",
    "OTP",
    "MPIN",
    "PIN",
    "password"
  ];

  // Keywords related to PIN and MPIN
  const pinKeywords = ["pin", "mpin", "password"];

  const tokens = tokenizer.tokenize(text);
  const filteredTokens = tokens.filter(token => !stopwords.includes(token.toLowerCase()));
  const stemmedTokens = filteredTokens.map(token => stemmer.stem(token));
  const preprocessedText = stemmedTokens.join(' ');

  const result = classifier.classify(preprocessedText);
  const reasons = [];

  // Check for the presence of a link using "linkify-it"
  if (hasLink(text)) {
    reasons.push('Contains a link');
  }

  if (pinKeywords.some(word => preprocessedText.includes(word)) && hasLink(text)) {
    reasons.push('Request for PIN/MPIN and contains a link');
  }

  if (hasFinancialKeyword) {
    reasons.push('Contains keywords related to financial fraud or identity theft');
  }

  if (triggerWords.some(word => preprocessedText.includes(word)) && hasLink(text)) {
    reasons.push('Contains trigger words and a link');
  }

  if (reasons.length > 0) {
    return {
      classification: 'Smishing',
      reasons: reasons,
      reason: reasons.join(', ')
    };
  } else {
    return {
      classification: result === 'smishing' ? 'Smishing' : 'Not Smishing',
      reason: 'No specific reason detected'
    };
  }
}

// Create an array to store smishing reports
const smishingReports = [];

// Function to display smishing reports in the console
function displayReports() {
  console.log('Smishing Reports:');
  smishingReports.forEach((report, index) => {
    console.log(`Report ${index + 1}:`);
    console.log(`- Message: ${report.message}`);
    console.log(`- Classification: ${report.classification}`);
    console.log(`- Reasons: ${report.reasons.join(', ')}`);
    console.log('------------------');
  });
}

module.exports = { detectSmishing, displayReports, smishingReports };
