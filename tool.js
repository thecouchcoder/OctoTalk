var builder = require('botbuilder');
var request = require('request');

module.exports = {
    targetTemp: [
        function (session, args, next) {
            var temp = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.temperature');

            if (!temp){
                builder.Prompts.number(session, "What temperature?");
            }
                


        session.say(`Setting temperature to ${temp} degrees Celsius`, { inputHint: builder.InputHint.ignoringInput });
        var apikey = process.env.OctoPrintAPIKey;

        var options = {
            url: 'http://75.66.157.35/api/printer/tool',
            method: 'POST',
            headers: {
                'X-Api-Key': apikey
            },
            json: {
                "command": "target",
                "targets": {
                    "tool0": temp
                }
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode !== 204) {
                session.say("Error communicating with printer");
                console.log('error: ' + response.statusCode);
                console.log(body);
            }
            // TODO endConversation is probably not appropriate here
            session.endConversation();
        });
    }
        }
    ]
};