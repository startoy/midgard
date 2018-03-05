        /* require package */
const fs = require('fs-extra');
const monax = require('@monax/legacy-contracts');
const express = require('express')                                                          /* server provider, easy way to create node server with url handle */
const requestx = require('request')                                                         /* make a http request to specific url */
const bodyParser = require('body-parser')

        /* variable */
burrowURL = "http://0.0.0.0:1337"; //using json
burrowrpcURL = "http://localhost:1337/rpc"
keysURL = "http://localhost:4767";
//accountPath = "/.monax/chains/multichain/account.json";
contractPath = "./smart.bin";
contractABI = "./smart.abi";

// account = fs.readJSONSync(accountPath);
// binary = fs.readFileSync(contractPath);
// ABI = fs.readJSONSync(contractABI);

/* traditional way */
// address = require('./epm.output.json').deployStorageK;
// ABI = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));

// bind burrow, account, contract
// var contractManager = monax.newContractManagerDev(burrowURL, account.multichain_full_000);

// create factory for contract with JSON interface(abi)
// .at(address) old version| compiled smart contract
// var contractFactory = contractManager.newContractFactory(ABI).at(address);

// create new instance, deploy a contract use `new`:
// var mycontract;

/* 
describe('Contract Deplyment', function(){
        it('Should deploy a contract', function(done){
                contractFactory.new({data: binary}, function(error, contract){
                        if(error){
                                return done(error);
                        }

                        mycontract = contract;
                        return done()
                });
        });
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

app.get('/end', (request, response) => {
        // only use req.query for convenient dev
        let method = 'burrow.' + request.query.method ;
        console.log("request method >> " + method);
	let address = request.query.addr;	

        let jsonDataObj = {
                'jsonrpc': '2.0',
                'method': method
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

app.get('/web', (request, response) => {
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
