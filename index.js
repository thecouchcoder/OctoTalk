var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');

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

var bot = new builder.UniversalBot(connector, (session) =>{
    session.beginDialog('welcome');
});

var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer); 

bot.dialog('welcome', (session)=>{
    session.say("Welcome to OctoTalk!", "Welcome to OctoTalk");
    session.say("What can I do for you?", "What can I do for you?", { inputHint: builder.InputHint.expectingInput });
})

bot.dialog('repeat', (session)=>{
    session.say("I didn't quite get that")
}).triggerAction({
    matches: "None"
})

bot.dialog('startPrint', (session)=>{
    session.say("You have attempted to start a print")
}).triggerAction({
    matches: "JobOperations.Start"
})

bot.dialog('stopPrint', (session)=>{
    session.say("You have attempted to stop a print")
}).triggerAction({
    matches: "JobOperations.Cancel"
})

bot.dialog('pausePrint', (session)=>{
    session.say("You have attempted to pause a print")
}).triggerAction({
    matches: "JobOperations.Pause"
})

bot.dialog('restartPrint', (session)=>{
    session.say("You have attempted to restart a print")
}).triggerAction({
    matches: "JobOperations.Restart"
})

bot.dialog('getStatus', (session)=>{
    session.say("Retrieving Status. Please wait.", { inputHint: builder.InputHint.ignoringInput });
    var apikey = process.env.OctoPrintAPIKey;

    var options = {
        url: 'http://75.66.157.35/api/printer',
        headers: {
            'X-Api-Key': apikey
        }
    };

    //TODO continue calling until request is done.
    session.sendTyping();
    request(options, (error, response, body) => {
        if (error){
            return console.error("Error: " + error);
        }
        if(response.statusCode == 200){
            var body = JSON.parse(body);
            var operationalStatus = body.state.flags.operational ? "is" : "is not";
            var sdCardStatus = body.state.flags.sdReady ? "is" : "is not";
            var printerState = "unknown";
            if (body.state.flags.paused){
                printerState = "paused"
            }
            if (body.state.flags.printing){
                printerState = "printing"
            }
            if (body.state.flags.ready){
                printerState = "ready for instructions"
            }
            var bedTemp = body.temperature.bed.actual;
            var extruderTemp = body.temperature.tool0.actual;
            var status = `Printer ${operationalStatus} operational and is ${printerState}.  The SD card ${sdCardStatus} available.  The bed temperature is ${bedTemp} and the extruder temperature is ${extruderTemp}`;
            session.say(status, status);
        
            
        }
    });

    // var options = {
    //     url: 'http://192.168.0.108/api/job',
    //     headers: {
    //         'X-Api-Key': apikey
    //     }
    // };

    // request(options, (error, response, body) => {
    //     if (error){
    //         return console.error("Error: " + error);
    //     }
    //     if(response.statusCode == 200){
    //         var body = JSON.parse(body);
    //         session.send(`The print is ${body.progress.completion.toFixed(0)}% done.`);
            
    //     }
    // });
}).triggerAction({
    matches: "PrinterOperations.Status"
});