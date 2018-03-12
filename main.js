        /* require package */
const fs         = require('fs-extra');
const contracts      = require('@monax/legacy-contracts');
const express    = require('express')                          /* server provider, easy way to create node server with url handle */
const requestx   = require('request')                          /* make a http request to specific url */
const bodyParser = require('body-parser')

        /* variable */
burrowURL        = "http://0.0.0.0:1337";
burrowrpcURL     = "http://0.0.0.0:1337/rpc"
keysURL          = "http://0.0.0.0:4767";
        /* smart contract */
var address = require('./epm.output.json').deploySmart;
var ABI = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));
var accountData = require('/home/ubuntu/.monax/chains/multichain/accounts.json');
var contractManager = contracts.newContractManagerDev(burrowURL, accountData.multichain_full_000);
var myContract = contractManager.newContractFactory(ABI).at(address);

        /* express js */
const app = express();
const port = process.env.PORT;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/* default page*/
app.get('/', (request, response) => {
        response.send('<h1>Hello !</h1><br>')
        // response.send(new Buffer('WoofWoof'))
        // response.send({ some : "json" });
        // response.send(404, 'SOrry, Can\'t find that');
});



app.get('/test', (request, response) => {
        //always include callback
        myContract.getInts((error, res) => {
                let result = error;
                console.log("Res Str = " + res.toString());
                console.log("Res = " + res);
                if (!error && res.statusCode == 200) {
                        result = res;    
                }
                console.log("Result " + result);
                response.send(result);
              });
});

app.get('/testset', (request, response) => {
        //always include callback
        myContract.setAddress("0000000000000000000000000000000000000000",(error, res) => {
                let result = error;
                console.log("Res Str = " + res.toString());
                console.log("Res = " + res);
                if (!error && res.statusCode == 200) {
                        result = res;    
                }
                console.log("Result " + result);
                response.send(result);
              });
});

app.get('/rpc', (request, response) => {
        // only use req.query for convenient dev
        let method = 'burrow.' + request.query.method ;
        console.log("request method >> " + method);
	let address = request.query.addr;	

        let jsonDataObj = {
                "jsonrpc": "2.0",
                "method": method
        }                    
        var options = {
                headers: {'content-type' : 'application/json'},
                url  :  burrowURL,
                body :  jsonDataObj,
                json :  true
        };
        
        let _error;
        let _response;
        let _body;
        
        console.log(options);
        /* Requestx */
        var reqq = requestx.post(options, (error, res, body) => {
            console.log('error:', error);
            console.log('statusCode:', res && res.statusCode);
            console.log('body:', body);
    
            _error = error;
            _response = res;
            _body = body;
    
            /* send body with RAW format (chrome extension) */
            if (!error && res.statusCode == 200) {
                response.send(body);
            }else{
                console.log("request error", error);
                response.send(error);
            }
        });
        /* end requestx*/
});

app.get('/url', (request, response) => {
        let method = request.query.method ;
        console.log("request web method >> " + method);

        var options = {
                url  :  burrowURL + '/' + method 
        };

        let _error;
        let _response;
        let _body;

        console.log(options);
        /* Requestx */
        var reqq = requestx.get(options, (error, res, body) => {
            console.log('error:', error);
            console.log('statusCode:', res && res.statusCode);
            console.log('body:', body);

            _error = error;
            _response = res;
            _body = body;

            /* send body with RAW format (chrome extension) */
            if (!error && res.statusCode == 200) {
                response.send(JSON.parse(body));
            }else{
                console.log("request error", error);
                response.send(error);
            }
        });
        /* end requestx*/
});

/* 
// GET /search?q=tobi+ferret
req.query.q
// => "tobi ferret"

// GET /shoes?order=desc&shoe[color]=blue&shoe[type]=converse
req.query.order
// => "desc"

req.query.shoe.color
// => "blue"

req.query.shoe.type
// => "converse"
 */

app.listen(port, (err) => {
        if (err) {
            return console.log('Fail to intial server:', err);
        } else {
            console.log('server' + ' is listening on port ' + port);
        }
});
