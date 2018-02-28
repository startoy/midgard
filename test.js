var assert = require('assert');
var fs = require('fs-extra');
var monax = require('@monax/legacy-contracts');

burrowURL = "http://localhost:1339/rpc"
accountPath = "./account.json"
contractPath = "./GetSet.bin"
contractABI = "./GetSet.abi"

account = fs.readJSONSync(accountPath)
binary = fs.readFileSync(contractPath)
ABI = fs.readJSONSync(contractABI)

testUint = 42
testBytes = "DEADBEEF00000000000000000000000000000000000000000000000000000000"
testString = "Hello World!"
testBool = true

var contractManager = monax.newContractManagerDev(burrowURL, account);

// Create a factory for the contract with the JSON interface 'myAbi'.
var ContractFactory = contractManager.newContractFactory(ABI);

// To create a new instance and simultaneously deploy a contract use `new`:
var TestContract;


describe('Contract Deployment', function(){
	it('Should deploy a contract', function(done){
		ContractFactory.new({data: binary}, function(error, contract){
		    if (error) {
		        return done(error)
		    }
		    TestContract = contract;
		    return done()
		});
	})
})

describe('Setting and Getting Values:', function(){
	it('Uint', function(done){
		TestContract.setUint(testUint, function(err){
			if (err) {return done(err);}

			TestContract.getUint(function(err, output){
				if (err) {return done(err);}

				assert.equal(output, testUint)
				return done()
			})
		})
	})

	it('Bool', function(done){
		TestContract.setBool(testBool, function(err){
			if (err) {return done(err);}

			TestContract.getBool(function(err, output){
				if (err) {return done(err);}

				assert.equal(output, testBool)
				return done()
			})
		})
	})

	it('Bytes', function(done){
		TestContract.setBytes(testBytes, function(err){
			if (err) {return done(err);}

			TestContract.getBytes(function(err, output){
				if (err) {return done(err);}

				assert.equal(output, testBytes)
				return done()
			})
		})
	})

	it('String', function(done){
		TestContract.setString(testString, function(err){
			if (err) {return done(err);}

			TestContract.getString(function(err, output){
				if (err) {return done(err);}

				assert.equal(output, testString)
				return done()
			})
		})
	})
})