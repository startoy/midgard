var fs = require('fs-extra');
var monax = require('@monax/legacy-contracts');

burrowURL = "http://localhost:1337/rpc";
accountPath = "/.monax/chains/multichain/account.json";
contractPath = "./smart.bin";
contractABI = "./smart.abi";

account = fs.readJSONSync(accountPath);
binary = fs.readFileSync(contractPath);
ABI = fs.readJSONSync(contractABI);

// bind burrow, account, contract
var contractManager = monax.newContractManagerDev(burrowURL, account);

// create factory for contract with JSON interface(abi)
var contractFactory = contractManager.newContractFacotury(ABI);

// create new instance, deploy a contract use `new`:
var mycontract;

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