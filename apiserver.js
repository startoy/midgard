/* require package */
const fs		= require('fs');
const contracts         = require('@monax/legacy-contracts');
const burrowModule      = require('@monax/legacy-db');
const express           = require('express')                          /* server provider, easy way to create node server with url handle */
const request           = require('request')                          /* make a http request to specific url */
const bodyParser        = require('body-parser');

/* import module from 'module'; */
const util 		= require('./module');

        /* variable */
_burrowURL        	= "http://0.0.0.0:1337";
_burrowrpcURL     	= "http://0.0.0.0:1337/rpc"
_keysURL          	= "http://0.0.0.0:4767";

        /* read config file */
var address             = require('./epm.output.json').deployNewSmartContract;
var ABI                 = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));
var accountData         = require('/home/ubuntu/.monax/chains/multichain/accounts.json');

        /* SHORT (ใช้ devpipe ไม่ได้) */
// var contractManager     = contracts.newContractManagerDev(burrowrpcURL, accountData.multichain_full_000); 

        /* FULL (newContractManagerDev)  */
var burrow 		= burrowModule.createInstance(_burrowrpcURL);  				/* legacy-db */
var pipe 		= new contracts.pipes.DevPipe(burrow, accountData.multichain_full_000); /* legacy-contract */
var contractManager 	= contracts.newContractManager(pipe);
var myContract          = contractManager.newContractFactory(ABI).at(address);

        /* express js */
const app       	= express();
const port      	= process.env.PORT || 8080;
const _url              = "http://0.0.0.0:" + port;
const _url_acc          = _url + "/acc";

        /* for .post request */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var account = express.Router();
var tx      = express.Router();
var sol	    = express.Router();
var stock   = express.Router();
var emp	    = express.Router();

/****************************************************************
 ******** ACCOUNT 
 *****************************************************************/

/* account.use( (req, res, next) => {
                console.log("Entering the account acc -> next()");
                next();
        }); */

account.get('/', (req, res) => {
        res.json({
                message: "this is first page of api"
        });
});

account.route('/gets')
        .get((req, res) => {

                res.json(pipe.listAccount());
        })

account.route('/create')
        .post((req, res) => {
                let whereIs = req.originalUrl;
                //call create account
                let options = {
                        url: _url_acc + '/generate'
                };
                request.get(options, (err, res2, body) => {
                        if (!err && res2.statusCode == 200) {
                                if (pipe.addAccount(JSON.parse(body))) {
                                        res.json(util.resLog("account added!", 1, whereIs, JSON.parse(body)));
                                } else {
                                        res.json(util.resLog("failed to add this account.", 0, whereIs));
                                }
                        } else {
                                res.json(util.resLog(err.message, 0, whereIs));
                        }
                });
        });

account.route('/generate')
        .get((req, res) => {
                let whereIs = req.originalUrl;
                let options = {
                        url: _burrowURL + '/' + 'unsafe/pa_generator'
                };
                request.get(options, (error, res2, body) => {
                        if (!error && res2.statusCode == 200) {
                                let obj = JSON.parse(body);
                                var address = obj.address;
                                var pub = obj.pub_key[1];
                                var pri = obj.priv_key[1];
                                let newDataObj = {
                                        address: address,
                                        pubKey: pub,
                                        privKey: pri
                                };
                                res.json(newDataObj);
                        } else {
                                res.json(util.resLog(error.message, 0, whereIs));
                        }
                });
        });


/****************************************************************
 ******** TRANSACTION 
 *****************************************************************/

tx.get('/', (req, res) => {
        res.json(util.resLog("this is first page of transaction api", 0));
});

tx.route('/sendtoken')
        .get((req, res) => {
                res.json(util.resLog("use POST method to send token", 0));
        })
        .post((req, res) => {
                let whereIs = req.originalUrl;
                /* TODO: no indicator if is error or not */
                let tx = burrow.txs();
                tx.sendAndHold(req.body.privkey,
                        req.body.address,
                        req.body.amount,
                        (i) => {
                                console.log("called" + i);
                        }
                );
                res.json(util.resLog("this call may take time, you can quit this page for now", 1, whereIs));
        });

/****************************************************************
 ******** SMART CONTRACT / SOLIDITY - CONFIG
 *****************************************************************/

sol.get('/', (req, res) => {
        res.json(util.resLog("this is first page of smart contract api", 1));
});

sol.route('/cnf-onspot')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.onspot(
                        req.body.startTime,
                        req.body.endTime,
                        req.body.startRedeemTime,
                        req.body.endRedeemTime,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                util.serverLog("config onspot time...", whereIs);
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "initial onspot success", "initial onspot fail", whereIs))
                                }
                        }
                )
        })

sol.route('/cnf-adjtime')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.adjust_activityTime(
                        req.body.startTime,
                        req.body.endTime,
                        req.body.startRedeemTime,
                        req.body.endRedeemTime,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                util.serverLog("config new onspot time...", whereIs);
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "adjust activity time success", "adjust activity time fail", whereIs))
                                }
                        }
                )
        })

/****************************************************************
 ******** SMART CONTRACT / SOLIDITY - STOCK
 *****************************************************************/

stock.route('/add')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.add_stock(
                        req.body.id,
                        req.body.name,
                        req.body.amount,
                        req.body.price,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
				}else{
                                	res.json(util.resSolLog(res2, "stock added!", "stock fail to added!", whereIs))
				}
                        }
                )
        })

stock.route('/delete')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.delete_stock(
                        req.body.id,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "delete success", "delete fail", whereIs))
                                }
                        }
                )
        })

/* FIXME: can't use this func ?!? */
stock.route('/get')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.getStockList(
                        {from : req.body.callerAddress},
                        (error, res2) => {
				console.log("getStockList : " + res2);
                                console.log("error : " + error);
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "get stock success!", "get stock fail!", whereIs))
                                }
                        }
                )
        })

stock.route('/update')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.adjust_stock(
                        req.body.id,
                        req.body.name,
                        req.body.amount,
                        req.body.price,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "update stock success!", "update stock fail!", whereIs))
                                }
                        }
                )
        })

/****************************************************************
 ******** SMART CONTRACT / SOLIDITY - EMPLOYEES
 *****************************************************************/

emp.route('/create')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.create_employee(
                        req.body.address,
                        req.body.id,
                        req.body.name,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "emp created!", "emp create fail!", whereIs))
                                }
                        }
                )
        })    

emp.route('/give')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.give_onspot(
                        req.body.sender,
                        req.body.reciever,
                        req.body.coreValue,
                        req.body.description,
                        Math.floor(Date.now() / 1000),
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "give onspot success!", "give onspot fail", whereIs))
                                }
                        }
                )
        })        

emp.route('/redeem')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.redeem_gift(
                        req.body.address,
                        req.body.stockid,
                        Math.floor(Date.now() / 1000),
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "redeem gift success!", "redeem gift fail!", whereIs))
                                }
                        }
                )
        })

/* FIXME: can't use this */
emp.route('/history')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.getHistory(
                        req.body.address,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "get history success!", "get history fail!", whereIs))
                                }
                        }
                )
        })

/* FIXME: can't use this */
emp.route('/empredeem')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.getEmployeeRedeem(
                        req.body.address,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "get emp redeem success!", "get emp redeem fail!", whereIs))
                                }
                        }
                )
        })

emp.route('/get')
        .post((req ,res) => {
                var whereIs = req.originalUrl;
                myContract.getEmployee(
                        req.body.address,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.send(util.resLog(error.message, 0, whereIs)); 
				}else{
                                        res.json(util.resSolLog(res2, "get emp info success!", "get emp info fail!", whereIs))
                                }
                        }
                )
        })  

emp.route('/clear')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.clearData(
                        req.body.address,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "delete emp data success!", "delete emp data fail!", whereIs))
                                }
                        }
                )
        })  
/* PATTERN *//*   
sol.route('/onspot')
        .post((req ,res) => {
                myContract.xxx(
                        req.body.id,
                        req.body.name,
                        req.body.amount,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                res.json(util.resSolLog(res2, "msgsuccess", "msgfail", whereIs))
                        }
                )
        })
 */

app.use('/acc', account);       /* All account request prefix with "/acc" */
app.use('/tx',  tx);            /* All transaction request prefix with "/tx" */
app.use('/sol', sol);           /* All smart contract/solidity job prefix with "/sol" */
app.use('/sol/stock',   stock); 
app.use('/sol/emp',     emp) 
app.listen(port, (err) => {
        if (err) {
                return console.log('Fail to intial server:', err);
        } else {
                console.log('server' + ' is listening on port ' + port);
        }
});
