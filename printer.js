var builder = require('botbuilder');
var request = require('request');

module.exports = {
    status: [function (session) {
        session.say("Retrieving Status. Please wait.", { inputHint: builder.InputHint.ignoringInput });
        var apikey = process.env.OctoPrintAPIKey;

        var options = {
            url: 'http://75.66.157.35/api/printer',
            headers: {
                'X-Api-Key': apikey
            }
        };

        // TODO continue calling this until request is done.
        session.sendTyping();
        request(options, (error, response, body) => {
            if (error) {
                return console.error("Error: " + error);
            }
            if (response.statusCode == 200) {
                var body = JSON.parse(body);
                var operationalStatus = body.state.flags.operational ? "is" : "is not";
                var sdCardStatus = body.state.flags.sdReady ? "is" : "is not";
                var printerState = "unknown";
                if (body.state.flags.paused) {
                    printerState = "paused"
                }
                if (body.state.flags.printing) {
                    printerState = "printing"
                }
                if (body.state.flags.ready) {
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
    }
    ]
};