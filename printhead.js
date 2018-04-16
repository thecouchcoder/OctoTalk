var builder = require('botbuilder');
var request = require('request');
var consts = require('./constants');

module.exports = {
    home: [function (session) {
        session.say("Homing Printer", { inputHint: builder.InputHint.ignoringInput });
        var apikey = process.env.OctoPrintAPIKey;

        var options = {
            url: 'http://75.66.157.35/api/printer/printhead',
            method: 'POST',
            headers: {
                'X-Api-Key': apikey
            },
            json: {
                "command": "home",
                "axes": ["x", "y", "z"]
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
    ],

    // TODO write code to make absolute positioning possible
    // TODO allow moving multiple directions at once
    jog: [
        function (session, args, next) {
            session.say("moving printhead");
            //Resolve entities
            var intent = args.intent;
            var direction = builder.EntityRecognizer.findEntity(intent.entities, 'Direction');
            var amount = builder.EntityRecognizer.findEntity(intent.entities, "builtin.number");

            //no amount is specified, use default amount
            //Normalize the amount if specified
            session.dialogData.amount = amount ? Math.abs(parseInt(amount.entity)) : consts.MOVE_DISTANCE;

            //must know which direction to move
            //TODO There's definitely a better way to do this through LUIS... need to figure it out
            if (!direction || !consts.DIRECTIONS.hasOwnProperty(direction.entity)) {
                builder.Prompts.choice(session, "Which direction?", "up|down|left|right|forward|back", { listStyle: 3 });
            }
            else {
                session.dialogData.direction = direction.entity;
                next();
            }
        },
        function (session, results) {
            if (results.response) {
                session.dialogData.direction = results.response.entity;
            }

            x = y = z = 0;

            //map to printer's language
            // 1) Determine which coordinate based on direction
            // 2) Add negative if necessary based on direction
            d = consts.DIRECTIONS[session.dialogData.direction];
            if (d.includes("x")) {
                x = d.includes("-") ? session.dialogData.amount * -1 : session.dialogData.amount;
            }
            else if (d.includes("y")) {
                y = d.includes("-") ? session.dialogData.amount * -1 : session.dialogData.amount;
            }
            else {
                z = d.includes("-") ? session.dialogData.amount * -1 : session.dialogData.amount;
            }
            session.say(`${x}, ${y}, ${z}`);
            var apikey = process.env.OctoPrintAPIKey;
            var options = {
                url: 'http://75.66.157.35/api/printer/printhead',
                method: 'POST',
                headers: {
                    'X-Api-Key': apikey
                },
                json: {
                    "command": "jog",
                    "x": x,
                    "y": y,
                    "z": z
                }
            }

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
    ]

};