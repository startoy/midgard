        /* require package */
const fs		= require('fs');
const contracts         = require('@monax/legacy-contracts');
const express           = require('express')                          /* server provider, easy way to create node server with url handle */
const requestx          = require('request')                          /* make a http request to specific url */
const bodyParser        = require('body-parser')

        /* variable */
burrowURL        	= "http://0.0.0.0:1337";
burrowrpcURL     	= "http://0.0.0.0:1337/rpc"
keysURL          	= "http://0.0.0.0:4767";
        /* smart contract */
var address             = require('./epm.output.json').deploySmart;
var ABI                 = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));
var accountData         = require('/home/ubuntu/.monax/chains/multichain/accounts.json');

	/* if SHORTEN -> but can't use pipe account */
// var contractManager     = contracts.newContractManagerDev(burrowrpcURL, accountData.multichain_full_000); 

	/* FULL (newContractManagerDev)  */
var burrowModule 	= require("@monax/legacy-db");
var burrow 		= burrowModule.createInstance("http://localhost:1337/rpc");
var pipe 		= new contracts.pipes.DevPipe(burrow, accountData.multichain_full_000);
var contractManager 	= contracts.newContractManager(pipe);

var myContract          = contractManager.newContractFactory(ABI).at(address);

        /* express js */
const app       	= express();
const port      	= process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/* default page*/
app.get('/', (request, response) => {
        response.send('<h1>Hello !!</h1><br>')
        // response.send(new Buffer('WoofWoof'))
        // response.send({ some : "json" });
        // response.send(404, 'SOrry, Can\'t find that');
});

app.get('/test', (request, response) => {
        //always include callback
	let result;
        myContract.getInts((error, res) => {
                if (!error) {
                        result = res;    
                }else{ result = error; }
                console.log("Result " + result);
                response.send(result.toString());
              });
});



/*  
 accountData <object>
 accountAddress <string>

 <- TO USE ->
 pipe = contracts.pipes.Devpipe(burrow,accountData);
 let Result = pipe.addAccount();


DevPipe.prototype.addAccount = function (accountData)
DevPipe.prototype.removeAccount = function (accountAddress)
DevPipe.prototype.setDefaultAccount = function (accountAddress)      
DevPipe.prototype.hasAccount = function (accountAddress)

DevPipe.prototype.transact = function (txPayload, callback)
DevPipe.prototype.call = function (txPayload, callback)


 // CUstom Function

DevPipe.prototype.listAccount = function (){
        return this._accountData
}


*/

	/* generate a new account and return as a obj */
app.get('/genacc', (request, response) => {
	/* Requestx */
        let options = {
                url: burrowURL + '/' + 'unsafe/pa_generator'
        };
        let reqq = requestx.get(options, (error, res, body) => {
            console.log('error:', error);
            console.log('statusCode:', res && res.statusCode);
            console.log('body:', body);

            if (!error && res.statusCode == 200) {

		let obj     = JSON.parse(body);
    		var address = obj.address;
    		var pub     = obj.pub_key[1];
    		var pri     = obj.priv_key[1];
    
		let newDataObj = {
        		address : address,
        		pubKey : pub,
        		privKey : pri
		}
		console.log("sending... " + newDataObj);
		response.send(newDataObj);
            }else{

                console.log("request error", error);
		response.send(error);
            }
        });
});

app.get('/addacc', (request, response) => {
	let acc = {
		address : "B7BBBAA281CC4062894E5D8F16D8C59D35537F09",
		pubKey : "F5EAB8DEC2CB84AE3841BEDE7CFC3BA9701D4D02A847DA1FD9E8466A50D0DC18",
		privKey : "5A0F2ABE788DD507C7AED82A673689A47FEB589F27DD6922AC03F8C0BB35E32FF5EAB8DEC2CB84AE3841BEDE7CFC3BA9701D4D02A847DA1FD9E8466A50D0DC18"};
	let res = pipe.addAccount(acc);
		console.log(res);
		response.send(res);
});

app.get('/addacc2', (request, response) => {
	let addr = request.query.address; 
	let pubk = request.query.pub;
	let prik = request.query.pri;

        let acc = {
                address : addr, 
                pubKey : pubk,
                privKey : prik };
        let res = pipe.addAccount(acc);
                console.log(res);
                response.send(res);
});


app.get('/genandadd', (request, response) => {
 	let options = {
                url: 'http://0.0.0.0:8080' + '/genacc'
        };
        let reqq = requestx.get(options, (error, res, body) => {

            if (!error && res.statusCode == 200) {

                let obj     = JSON.parse(body);
                var address = obj.address;
                var pub     = obj.pubKey;
                var pri     = obj.privKey;

		options = { url : 'http://0.0.0.0:8080' + '/addacc2?address=' + address + '&pub=' + pub + '&pri=' + pri};
		
		console.log("response gen account ->" + JSON.stringify(options));
		let req2 = requestx.get(options, (error2, res2, body2) => {
			if (!error2 && res2.statusCode == 200) {
				console.log("send !");
				response.send(body2 + "\nwith address = " + obj.address);
			}else{
				console.log("error !" + error2);
				response.send(error2);
			}		
		});
            }else{

                console.log("request error", error);
                response.send(error);
            }
        });

	
});


app.get('/rmvacc', (request, response) => {
        let acc = "B7BBBAA281CC4062894E5D8F16D8C59D35537F09";
        let res = pipe.removeAccount(acc);
        console.log(res);
        response.send(res);
});

app.get('/getacc', (request, response) => {
	let res = pipe.listAccount();
	console.log(res);
	response.send(res);
});

app.get('/hasacc', (request, response) => {
	let res = pipe.hasAccount("B7BBBAA281CC4062894E5D8F16D8C59D35537F09");
	console.log(res);
	response.send(res);
});


app.get('/setdefacc', (request, response) => {
	let address = request.query.address;
        let res = pipe.setDefaultAccount(address);
        console.log(res);
        response.send(res);
});

app.get('/testset', (request, response) => {
        //always include callback
	let result;
        myContract.setAddress.call("0000000000000000000000000000000000009999",(error, res) => {
                if (!error) {
                        result = res;    
                }else{ result = error; }
                console.log("Result " + result);
                response.send("is have result => " + result);
              });
});

app.get('/testconstant', (request, response) => {
	let result;
	myContract.getInts( (error, res)=>{
		if(!error){
			result = res;
		}else{ result = error}
		console.log("Result " + result);
		response.send("Result = " + result);
	});
});


app.get('/test2', (request, response) => {
	let address = request.query.address;
	let x = request.query.x;
	let result;
	console.log("is test 2");
	myContract.getUints.call( x ,{from : address}, (error, res)=>{
		if(!error){
			result = res;
		}else{
			result = error;
		}
		console.log("test2 ->" + result);
		response.send("test2 ->" + result);
	});
});

app.get('/test3', (request, response) => {
        let address = request.query.address;
        let id = request.query.id;
        let name = request.query.name;
        let amount = request.query.amount;
        let price = request.query.price;
        let result;
        console.log("is test 2");
        myContract.add_stock( id, name, amount, price, {from : address}, (error, res)=>{
                if(!error){
                        result = res;
                }else{
                        result = error;
                }
                console.log("test2 ->" + result);
                response.send("test2 ->" + result);
        });
});


app.post('/rpc', (request, response) => {
        // only use req.query for convenient dev
        let method = 'burrow.' + request.query.method;
        console.log("request method >> " + method);
        let address = request.query.addr;
        let jsonDataObj = {
                "jsonrpc": "2.0",
                "method": method
        }
        let options = {
                headers: {
                        'content-type': 'application/json'
                },
                url: burrowURL,
                body: jsonDataObj,
                json: true
        };
        
        let _error;
        let _response;
        let _body;
        
        console.log(options);
        /* Requestx */
        let reqq = requestx.post(options, (error, res, body) => {
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
        let method = request.query.method;
        console.log("request web method >> " + method);

        let options = {
                url: burrowURL + '/' + method
        };

        let _error;
        let _response;
        let _body;

        console.log(options);
        /* Requestx */
        let reqq = requestx.get(options, (error, res, body) => {
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
