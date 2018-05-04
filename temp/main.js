        /* require package */
const fs		= require('fs');
const contracts         = require('@monax/legacy-contracts');
const burrowModule      = require('@monax/legacy-db');
const express           = require('express')                          /* server provider, easy way to create node server with url handle */
const requestx          = require('request')                          /* make a http request to specific url */
const bodyParser        = require('body-parser')

        /* variable */
burrowURL        	= "http://0.0.0.0:1337";
burrowrpcURL     	= "http://0.0.0.0:1337/rpc"
keysURL          	= "http://0.0.0.0:4767";

        /* read config file */
var address             = require('./epm.output.json').deploySmart;
var ABI                 = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));
var accountData         = require('/home/ubuntu/.monax/chains/multichain/accounts.json');

        /* SHORT (ใช้ devpipe ไม่ได้) */
// var contractManager     = contracts.newContractManagerDev(burrowrpcURL, accountData.multichain_full_000); 

	/* FULL (newContractManagerDev)  */
var burrow 		= burrowModule.createInstance(burrowrpcURL);
var pipe 		= new contracts.pipes.DevPipe(burrow, accountData.multichain_full_000);
var contractManager 	= contracts.newContractManager(pipe);

var myContract          = contractManager.newContractFactory(ABI).at(address);

        /* express js */
const app       	= express();
const port      	= process.env.PORT;
        /* for .post request */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/* Module - TEST */
// TODO:
// import mymodule from 'module';
// mymodule.convert();


// FIXME:
/* default api */
app.get('/', (request, response) => {
        response.send('<div align="center"><h1>THIS IS BLOCKCHAIN API</h1></div><br>')
});

/* FOR TEST ACCOUNT */
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
		response.send(newDataObj);
            }else{
		response.send(error);
            }
        });
});

app.get('/addacc', (request, response) => {
	let acc = {
		address : "AAA3AC34CE13B2307FB3F6048E9F27D697EEB1A3",
		pubKey : "E66621B1ACD210CD6567A19CA64A4D934CEE8EE336F8909183C62BDC2E70510E",
		privKey : "7E805EE897AE58D36E830F389E146F3E967ABA0C863CA5561E3654CB345FAF92E66621B1ACD210CD6567A19CA64A4D934CEE8EE336F8909183C62BDC2E70510E"};
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

app.get('/send', (request, response) => {
	let privkey = request.query.privkey;
        let address = request.query.address;
        let tx = burrow.txs();
 	tx.sendAndHold(privkey, address, 150, sendTokenCallback() );
	response.send("the server is working on token command... The Result will come later, You can quit this page.");
});

function sendTokenCallback(){
	console.log("Sending Token... ");
}

app.get('/setaccback', (request,response) => {
        let account = request.query.account;
        let res = pipe.setDefaultAccount(account);
        console.log(res);
        response.send(res);
})

app.get('/testset', (request, response) => {
        //always include callback
	let result;
        myContract.setAddress.call("0000000000000000000000000000000000009999",(error, res) => {
                if (!error) {
                        result = res;    
                }else{ result = error; }
                console.log("Result " + result);
                response.send("Result => " + result);
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
        console.log("is test 333");
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


app.get('/rpc', (request, response) => {
        let method = 'burrow.' + request.query.method;
        console.log("request method >> " + method);
        let jsonDataObj = {
                "jsonrpc": "2.0",
                "method": method,
        }

        let options = {
                headers: {
                        'content-type': 'application/json'
                },
                url: burrowrpcURL,
                body: jsonDataObj,
                json: true
        };
        
        console.log(options);

        /* Requestx */
        let reqq = requestx.post(options, (error, res, body) => {
            console.log('error:', error);
            console.log('statusCode:', res && res.statusCode);
            console.log('body:', body);
    
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

/* ex. 
http://13.229.109.182/url?method=accounts/F1DE4090E06ED638B7C8E4AF90C5B8DF37931896/storage 
*/
app.get('/url', (request, response) => {
        let method = request.query.method;
        console.log("request web method >> " + method);

        let options = {
                url: burrowURL + '/' + method
        };

        console.log(options);
        
        /* Requestx */
        let reqq = requestx.get(options, (error, res, body) => {
            console.log('error:', error);
            console.log('statusCode:', res && res.statusCode);
            console.log('body:', body);

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

/* same as do as on smart contract if you know the data byte */
app.post('/post/tx', (request, response) => {
	let priv_key = request.body.priv_key;
	let data = request.body.data;
	let address = request.body.address;
	let fee = request.body.fee;
	let gas_limit = request.body.gas_limit;

	let jsonDataObj = {
                "jsonrpc": "2.0",
                "method": "burrow.transactAndHold",
                "params" : {
			"priv_key": priv_key,
			"data":      data,
			"address":   address,
			"fee":       1,
			"gas_limit": 20000 
                           }
        }

        let options = {
                headers: {
                        'content-type': 'application/json'
                },
                url: burrowrpcURL,
                body: jsonDataObj,
                json: true
        };
/* Requestx */
        let reqq = requestx.post(options, (error, res, body) => {

            console.log('error:', error);
            console.log('statusCode:', res && res.statusCode);
            console.log('body:', body);


            /* send body with RAW format (chrome extension) */
            if (!error && res.statusCode == 200) {
                response.send("response : "+ JSON.stringify(body));
            }else{
                console.log("request error : ", error);
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


/* 
return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
*/
