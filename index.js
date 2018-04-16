var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var printhead = require('./printhead');
var printer = require('./printer');

//TODO Testing 1!

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId, 
    appPassword: process.env.MicrosoftAppPassword 
});

var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = `https://${luisAPIHostName}/luis/v2.0/apps/${luisAppId}?subscription-key=${luisAPIKey}&verbose=true&timezoneOffset=-360&q=`;

// Listen for messages from users
server.post('/api/messages', connector.listen());

var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector, (session) =>{
    session.beginDialog('welcome');
}).set('storage', inMemoryStorage);

var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer); 

bot.dialog('welcome', (session)=>{
    session.say("Welcome to OctoTalk!", "Welcome to OctoTalk");
    session.say("What can I do for you?", "What can I do for you?", { inputHint: builder.InputHint.expectingInput });
});

bot.dialog('repeat', (session)=>{
    session.say("I didn't quite get that")
}).triggerAction({
    matches: "None"
});

bot.dialog('startPrint', (session)=>{
    session.say("You have attempted to start a print")
}).triggerAction({
    matches: "JobOperations.Start"
});

bot.dialog('stopPrint', (session)=>{
    session.say("You have attempted to stop a print")
}).triggerAction({
    matches: "JobOperations.Cancel"
});

bot.dialog('pausePrint', (session)=>{
    session.say("You have attempted to pause a print")
}).triggerAction({
    matches: "JobOperations.Pause"
});

bot.dialog('restartPrint', (session)=>{
    session.say("You have attempted to restart a print")
}).triggerAction({
    matches: "JobOperations.Restart"
});

bot.dialog('homePrinterHead', printhead.home).triggerAction({
    matches: "PrinterOperations.PrintHead.Home"
});

bot.dialog('jogPrintHead', printhead.jog).triggerAction({
    matches: "PrinterOperations.PrintHead.Jog"
});

bot.dialog('getStatus', printer.status).triggerAction({
    matches: "PrinterOperations.Status"
});