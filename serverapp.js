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
//var chainURL = 'http://localhost:1337/rpc';
// var contracts =     require('@monax/legacy-contracts');                 /* my DEAR smart contract */
//var burrowFactory = require('@monax/legacy-db');                        
var fs =            require('fs');
var http =          require('http');
// var address =       require('./epm.output.json').deployStorageK;        /* get address of (compiled)smart contract */
// var abi = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));      /* parse */
// var accounts =      require('../../chains/multichain/accounts.json');   /* ONLY USE .json (should be an object) -> for 'Private Keys and Signing' */

    /* use an accountData object (address & private key) directly but no key/signing daemon is needed, DEV ONLY */
// var manager = contracts.newContractManagerDev(chainURL, accounts.library_chain_full_000);
// var contract = manager.newContractFactory(abi).at(address);                  /* point to smart contract that's on the chain */                  

/* Nodejs modules - Server */
const express = require('express')                                                          /* server provider, easy way to create node server with url handle */
const requestx = require('request')                                                         /* make a http request to specific url */
const bodyParser = require('body-parser')

const app = express()

const port = process.env.PORT
const webIP = "http://159.65.132.186";
    //const rpcPort = "46657";                                                /* 46657 for tendermint, 1337 for burrow (have doc) */
const rpcPort = "1337";
const webURL = webIP + ':' + rpcPort;                                     /* use http endpoint instead of legacy-db */
const rpcURL = webURL + '/rpc';

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
        let url = webIP + ':' + rpcPort + '/status';                                           /* expected url = http://188.166.176.43:46657/status */
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

    /* RPC 2.0 */
app.get('/transact', (request, response) => {
        let jsonDataObj = {};
        let data = ''; /* implement data here */
        /* let data = {'mes': 'hey dude', 'yo': ['im here', 'and here']}; */
        let res = requestRPC(data);
});

app.get('/rpcacc', (request, response) => {

        let jsonDataObj = {
                "jsonrpc": "2.0",
                "method": "burrow.getAccount",
                "params" : { "address" : "60EB2790441106175D5823A821C429E919D6A5DA" }
        }                    
        var options = {
                headers: {'content-type' : 'application/json'},
                url  :  rpcURL,
                body :  jsonDataObj,
                json :  true
        };
        
        let _error;
        let _response;
        let _body;

        /* Request to endpoint */
        //console.log(options);
        var reqq = requestx.post(options, (error, res, body) => {
        console.log('error:', error);
        console.log('statusCode:', res && res.statusCode);
        console.log('body:', body);

        _error = error;
        _response = res;
        _body = body;

        /* send body's RAW format (chrome extension) */
        /* if parse access by ->  msg.param1, msg.param2, msg[5],param1 */
        if (!error && res.statusCode == 200) {
            response.send(body);
        }else{
            console.log("request error", error);
            response.send(error);
        }
        });
        /* end requestx*/
});

    /* END POINT */
app.get('/c/:opt', (request, response) => {
        console.log("on chains end point request for >>> " + request.params.opt);
        let msg = '';
        let opt = request.params.opt;
        let url = (webURL + '/' + opt);                                                         /* expected url = http://188.166.176.43:46657/list_accounts */
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
        let url = (webURL + '/' + opt + '?' + parg1 + '=' + arg1);                              /* expected url = http://188.166.176.43:46657/subscribe?eventId=99999 */
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
});

/* start express server with port... */
app.listen(port, (err) => {
        if (err) {
            return console.log('Fail to intial server:', err);
        } else {
            console.log('server' + webIP + 'is listening on port' + port);
        }
});
