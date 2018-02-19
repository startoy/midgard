/******************************************************************************************************
 * 
 * file : serverapp.js
 *      : create server handle client request (smart contract + blockchain )
 * 
 * blockchain : choose endpoint/legacydb
 * how to run :
 *      $ PORT=[number] node serverapp.js
 *   with debug :
 *      $ NODE_DEBUG=monax PORT=[number] node serverapp.js
 * 
 *******************************************************************************************************/

'use strict';

/* Nodejs modules - Blockchain */
var chainURL = 'http://localhost:1337/rpc';
var contracts =     require('@monax/legacy-contracts');                 /* my DEAR smart contract */
//var burrowFactory = require('@monax/legacy-db');                        /* in chain */
var fs =            require('fs');
var http =          require('http');
var address =       require('./epm.output.json').deployStorageK;        /* get address of (compiled)smart contract */
var abi = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));      /* parse */
var accounts =      require('../../chains/multichain/accounts.json');   /* ONLY USE .json (should be an object) */

var manager = contracts.newContractManagerDev(chainURL, accounts.library_chain_full_000);   /* my account */
var contract = manager.newContractFactory(abi).at(address);                                

/* Nodejs modules - Server */
const express = require('express')                                                          /* server provider, easy way to create node server with url handle */
const requestx = require('request')                                                         /* make a http request to specific url */
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT

const webURL = "http://10.32.10.52";
//const rpcPort = "46657";                                                /* 46657 for tendermint, 1337 for burrow (have doc) */
const rpcPort = "1337";
const rpcURL = webURL + ':' + rpcPort;                                  /* if use http endpoint */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/* default page (send html file to user's request) */
app.get('/', (request, response) => {
    response.sendFile('/var/www/html/index.html');
});

/******************** create case as you wish ***********************/
app.get('/chain', (request, response) => {
    response.sendFile('/root/.monax/apps/library/chains.html');
});

app.get('/status', (request, response) => {
    console.log("on chains REST api");
    let msg = '';
    let url = webURL + ':' + rpcPort + '/status';                                           /* expected url = http://188.166.176.43:46657/status */
    requestx(url, function (error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
        msg = body;
    });
    setTimeout(function () {
        response.send(msg);
    }, 500);
});

/* RPC2.0 END POINT */
app.get('/c/:opt', (request, response) => {
    console.log("on chains end point request for >>> " + request.params.opt);
    let msg = '';
    let opt = request.params.opt;
    let url = (rpcURL + '/' + opt);                                                         /* expected url = http://188.166.176.43:46657/list_accounts */
    console.log('pass1 ' + url)
    requestx(url, function (error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
        msg = body;
        console.log('pass2')
    });
    console.log('pass3')
    setTimeout(function () {
        //console.log("msg:"+ msg );
        console.log('pass4')
        response.send(JSON.parse(msg));
    }, 500);
    console.log('pass5')
});

/* Arg = 1 */
app.get('/s/:opt/:parg1/:arg1/', (request, response) => {
    console.log('1 argument..')
    let msg = ''
    let opt = request.params.opt
    let parg1 = request.params.parg1
    let arg1 = request.params.arg1
    let url = (rpcURL + '/' + opt + '?' + parg1 + '=' + arg1);                              /* expected url = http://188.166.176.43:46657/subscribe?eventId=99999 */
    console.log('req to '+url);
    requestx(url, (error, response, body) => {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
        msg = body;
    })
    setTimeout(() => {
        response.send(JSON.parse(msg));
    }, 500)
})

/* Arg = 2 */
app.get('/s/:opt/:parg1/:arg1/:parg2/:arg2', (request, response) => {
    console.log('2 argument..')
    let msg = ''
    let opt = request.params.opt
    let parg1 = request.params.parg1
    let arg1 = request.params.arg1
    let parg2 = request.params.parg2
    let arg2 = request.params.arg2
    let url = (rpcURL + '/' + opt + '?' + parg1 + '=' + arg1 + '&' + parg2 + '=' + arg2);     /* expected url = http://188.166.176.43:46657/sign_tx?tx=4213213&privAccounts=4AEOS09237X5129OKKM */
    console.log('req to '+url);
    requestx(url, (error, response, body) => {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
        msg = body;
    })
    setTimeout(() => {
        response.send(JSON.parse(msg));
    }, 500)
})

/* Arg = 3 */
app.get('/s/:opt/:parg1/:arg1/:parg2/:arg2', (request, response) => {
    console.log('3 argument..')
    let msg = ''
    let opt = request.params.opt
    let parg1 = request.params.parg1
    let arg1 = request.params.arg1
    let parg2 = request.params.parg2
    let arg2 = request.params.arg2
    let parg3= request.params.parg3
    let arg3 = request.params.arg3
    let url = (rpcURL + '/' + opt + '?' + parg1 + '=' + arg1 + '&' + parg2 + '=' + arg2 + '&' + parg3 + '=' + arg2);     /* expected url = http://188.166.176.43:46657/sign_tx?Address=RSA4221&code=1234%data=IWEOVIG9339 */
    console.log('req to '+url);
    requestx(url, (error, response, body) => {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
        msg = body;
    })
    setTimeout(() => {
        response.send(JSON.parse(msg));
    }, 500)
})

/* Arg = 2 /unsafe */
app.get('/s/unsafe/:opt/:parg1/:arg1/:parg2/:arg2', (request, response) => {
    console.log('2 argument..')
    let msg = ''
    let opt = request.params.opt
    let parg1 = request.params.parg1
    let arg1 = request.params.arg1
    let parg2 = request.params.parg2
    let arg2 = request.params.arg2
    let url = (rpcURL + '/unsafe/' + opt + '?' + parg1 + '=' + arg1 + '&' + parg2 + '=' + arg2);     /* expected url = http://188.166.176.43:46657/sign_tx?tx=4213213&privAccounts=4AEOS09237X5129OKKM */
    console.log('req to '+url);
    requestx(url, (error, response, body) => {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
        msg = body;
    })
    setTimeout(() => {
        response.send(JSON.parse(msg));
    }, 500)
})

/* Contract -> get */
app.get('/contracts/get', (request, response) => {
    console.log("Received request for details.");
    contract.get(function (error, result) {
        if (error) {
            response.statusCode = 500;
        } else {
            response.setHeader('Content-Type', 'application/json');
            response.status(200).send("You have requested details on: " + result);
        }
    });
});

/* Contract -> put */
app.put('/contracts/put/:name', (request, response) => {
    var name = request.params.name;                                                         /* express deprecated req.param(name): Use req.params, req.body, or req.query */
    console.log("Received request to set title to " + name + '.');
    request.on('end', function () {
        contract.set(name, function (error) {
            response.statusCode = error ? 500 : 200;
            response.send("Success");
        });
    });
});


/* start express server with port... */
app.listen(port, (err) => {
    if (err) {
        return console.log('Fail to intial server:', err);
    } else {
        console.log('server is listening on port' + port);
    }
});
