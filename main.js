        /* require package */
const fs         = require('fs-extra');
const monax      = require('@monax/legacy-contracts');
const express    = require('express')                                                          /* server provider, easy way to create node server with url handle */
const requestx   = require('request')                                                         /* make a http request to specific url */
const bodyParser = require('body-parser')

        /* variable */
burrowURL        = "http://0.0.0.0:1337";
burrowrpcURL     = "http://localhost:1337/rpc"
keysURL          = "http://localhost:4767";

/*     
        
        var burrowURL = "http://localhost:1337/rpc";
        var contracts =     require('@monax/legacy-contracts'); 
         *มี contracts.pipe
        1. Declare ABI file
                contractABI = "./smart.abi"; // PATH TO ABI FILE
                ABI = fs.readJSONSync(contractABI);
                // ที่ใช้อยู่เพื่อจะได้ไม่ต้องแก้ไฟล์ เวลา deploy smart contract ใหม่
                        var address = require('./epm.output.json').deployStorageK;
                        var ABI = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));

        2. Declare account
                // var accountPath = "/.monax/chains/multichain/account.json";
                // var account = fs.readJSONSync(accountPath);
                var accountData = require('/some/account/data.json');

        3. Create contract manager
                var contractManager = contracts.newContractManagerDev(burrowURL, accountData);

         * newContractManagerDev คือ มี pipe (pipe มี burrow, account) เข้ามาแล้ว  https://github.com/monax/legacy-contracts.js
         * account เป็น constructor มี address, pubKey, privKey (string)
         * pipe ต่อ legacy-contract กับ burrow js API ใช้ signing transaction มี DevPipe กับ LocalSignerPipe
         * local signing ยังไม่มี ! ใช้ Devpipe ส่ง privKey พร้อมกับ Transaction ไปที่ Server (ทำให้)
         *      Pipe.addAccount(accountData) Add to the list of available accounts
         *      Pipe.removeAccount(accountId)
         *      Pipe.setDefaultAccount(accountId) default from account
        
        4. Create contract factory 
                // Create a factory (or contract template) from 'myJsonAbi'
                var myContractFactory = contractManager.newContractFactory(myJsonAbi);
                var myOtherContractFactory = contractManager.newContractFactory(myOtherJsonAbi);
        
        5. Create contract (X*, X**)
                var address = "...";
                var myContract myContractFactory.at(address);
        
        ย่อ 4. 5. => var myContract = contractManager.newContractFactory(abi).at(address);

        6. USE !!
                myContract.add(34, 22, addCallback);
*/

/* 
 Pipe ใช้งานผ่าน
        myContract.pipes

 X* Create a new instance, Deploy the contract onto the chain
        var myContract;
        var myCode = "...";
        myContractFactory.new({data: myCode}, function(error, contract){
                if(error) {throw error}
                myContract = contract;
        });

 X** Create a new instance, contract already exist on the chain
can omit the callback, no check is made
        var address = "...";
        var myContract;
        myContractFactory.at(address, function(error, contract){
                if(error) {throw error}
                myContract = contract;
        });

 -- Tradition JS
        myContract.add(34, 22, addCallback);

        function addCallback(error, sum){
        console.log(sum.toString()); // Would print: 56
        }

 -- ES6 (ES2015) JS

        myContract.add(34, 22, (error, sum) => {
                console.log(sum.toString()); // Would print: 56
        });
*/

        /* express */
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

app.listen(port, (err) => {
        if (err) {
            return console.log('Fail to intial server:', err);
        } else {
            console.log('server' + ' is listening on port ' + port);
        }
});
