/* require package */
const fs		= require('fs');
const contracts         = require('@monax/legacy-contracts');
const burrowModule      = require('@monax/legacy-db');
const express           = require('express')                          /* server provider, easy way to create node server with url handle */
const request           = require('request')                          /* make a http request to specific url */
const bodyParser        = require('body-parser');

// mondb
const mongoose 		= require('mongoose');
const config 		= require('./config');
// Schema ตั่งต่าง
const User		= require('./apps/models/user');
mongoose.connect(config.database);

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
/*var utl     = express.Router();*/
var mondb   = express.Router();

/****************************************************************
 ******** ACCOUNT 
 *****************************************************************/

/* account.use( (req, res, next) => {
                console.log("Entering the account acc -> next()");
                next();
        }); */

account.route('/gets')
        .get((req, res) => {

                res.json(pipe.listAccount());
        })

account.route('/create')
        .post((req, res) => {
                let whereIs = req.originalUrl;
                let options = { url: _url_acc + '/generate' };
                request.get(options, (err, res2, body) => {
                        if (!err && res2.statusCode == 200) {
                                let userBody = JSON.parse(body);
                                let emp_id = req.body.emp_id;
				util.addAccountToDB(emp_id, userBody).then(pipe.addAccount(userBody))
				.then(()=>{
                                        res.json(util.resLog("The account has been added to list", 1, whereIs, userBody));
				})
				.catch((error)=>{
					res.json(util.resLog(error, 0, whereIs));
				})
                        } else {
                                res.json(util.resLog(err.message, 0, whereIs));
                        }
                });
        });

        /* restrict admin */
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

        /* restrict admin */
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

        /* restrict admin */
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
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "initial onspot success", "initial onspot fail", whereIs))
                                }
                        }
                )
        })

                /* restrict admin */
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
        /* restrict admin All */
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

stock.route('/get')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.getStockList(
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "get stocks succesful!", "getting stock fail! is stock has a item ?", whereIs))
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
                                        res.json(util.resSolLog(res2, "update stock successful!", "update stock fail!", whereIs))
                                }
                        }
                )
        })

stock.route('/getitem')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.getStockItem(
                        req.body.id,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "get item successful", "no item, something went wrong ?", whereIs))
                                }
                        }
                )
        })



/****************************************************************
 ******** SMART CONTRACT / SOLIDITY - EMPLOYEES
 *****************************************************************/
        /* restrict admin */
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
                                        res.json(util.resSolLog(res2, "give onspot successful!", "give onspot fail", whereIs))
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
                                        res.json(util.resSolLog(res2, "redeem gift successful!", "redeem gift fail!", whereIs))
                                }
                        }
                )
        })

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
                                        res.json(util.resSolLog(res2, "get history successful!", "get history fail!", whereIs))
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
                                        res.json(util.resSolLog(res2, "get emp redeem successful!", "get emp redeem fail!", whereIs))
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
                                        res.json(util.resSolLog(res2, "get emp info successful!", "get emp info fail!", whereIs))
                                }
                        }
                )
        }) 

        /* restrict admin */
// clear the ticket to 0, what about onspot ?!? 
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
                                        res.json(util.resSolLog(res2, "delete emp data successful!", "delete emp data fail!", whereIs))
                                }
                        }
                )
        })  

/****************************************************************
 ******** MONGODB - MONGOOSE
 *****************************************************************/

        /* restrict admin */
/* query accounts from db */
mondb.route('/accounts')
	.get((req, res) => {
                let whereIs = req.originalUrl;
                util.queryAccountFromDB()
                .then(result => {
                        res.json(util.resSolLog(result, "query accounts from database successful!", "fail to query!", whereIs));
                })
                .catch( (err)=>{
                        res.json(util.resLog("error : " + err, 0, whereIs));
                })
        })

	.post((req, res) => {
                let whereIs = req.originalUrl;
                let query = {emp_id : req.body.emp_id};
		util.queryAccountFromDB(query)
		.then(result => {
                	res.json(util.resSolLog(result, "query accounts from database successful!", "fail to query!", whereIs));                
		})
		.catch( (err)=>{
			res.json(util.resLog("error : " + err, 0, whereIs));
		})
	});

/*
 
DO NOT USE, DEV ONLY 
 since address on chain should not be deletefrom db cuz  we can't find it back (or don't know how) so just find and update that account field to not active instead

always execute success -> no return false or error 
TODO: fix to use from module
*/
mondb.route('/cleardata')
	.delete((req, res) => {
		let whereIs = req.originalUrl;
		User.remove({}, (err)=>{
			if(err) res.json(util.resLog("error on clear data?", 0, whereIs, err));
			res.json(util.resLog("clear data from database successful!", 1, whereIs));
		})
		/*
		util.clearDataFromDB()
		.then( ()=> {
			res.json(util.resSolLog(result, "clear data from database successful!", "something went wrong on clearing data from database!", whereIs));
		})
		.catch( (err) => {
			res.json(util.resLog("error on clear data?", 0, whereIs, err));
		})
		*/

	})

/* map each address from db to app layer  */
mondb.route('/setup')
        .get((req, res) => {
                let whereIs = req.originalUrl;
                User.find().stream()
		.on('data', (doc) => {
			var obj = { 	
                                        address : doc.address,
			    		pubkey : doc.pubkey,
			    		privkey : doc.privkey
				}
			pipe.addAccountApp(obj);
		})
		.on('error', (err)=> {
			res.json(util.resLog("error on setup accounts", 0, whereIs, err));
		})
		.on('end', () => {
			res.json(util.resLog("executed!, please check manually", 1, whereIs));
		}); 
        });


/* ------------------------- MORE FUNCTION -------------------------
 *      - foreach addr in db -> clear  
 *      - stocks should store in db too ?!?
 *      - password separate from hr api
 *      - insert update delete function
 */

/****************************************************************
 ******** UTILITY / TEST SOME FUNCTION
 *****************************************************************/
/*
utl.route('/uint')
        .post((req ,res) => {
                let whereIs = req.originalUrl;
                myContract.uintToString(
                        req.body.intx,
                        {from : req.body.callerAddress},
                        (error, res2) => {
                                if(error) {
                                        res.json(util.resLog(error.message, 0, whereIs));
                                }else{
                                        res.json(util.resSolLog(res2, "get uint!", "fail to get uint!", whereIs))
                                }
                        }
                )
        })
*/
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

 // insert
function addAccountToDB(emp_id, account, adminFlag) {
        return new Promise( (fullfill, reject) => {
                if(adminFlag){    
                        let user = new User({
                                emp_id : emp_id,
                                address : account.address,
                                pubkey : account.pubKey,
                                privkey : account.privKey,
                                active : true,
                                admin : true
                        });
                }else{
                        let user = new User({
                                emp_id : emp_id,
                                address : account.address,
                                pubkey : account.pubKey,
                                privkey : account.privKey,
                                active : true
                        });
                }
                user.save((err)=>{
                        if (err) reject(err);
                        return fulfill(true);
                });
        })
}

app.use('/acc', account);       /* All account request prefix with "/acc" */
app.use('/tx',  tx);            /* All transaction request prefix with "/tx" */
app.use('/sol', sol);           /* All smart contract/solidity job prefix with "/sol" */
app.use('/sol/stock', stock); 
app.use('/sol/emp', emp); 
/*app.use('/util', utl);*/
app.use('/db', mondb);
app.listen(port, (err) => {
        if (err) {
                return console.log('Fail to intial server:', err);
        } else {
                console.log('server' + ' is listening on port ' + port);
        }
});
