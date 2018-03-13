

          var burrowURL = "http://localhost:1337/rpc";
          var contracts =     require('@monax/legacy-contracts');

  1. Declare ABI file
    
          contractABI = "./smart.abi"; // PATH TO ABI FILE
          ABI = fs.readJSONSync(contractABI);
          
       // ที่ใช้อยู่เพื่อจะได้ไม่ต้องแก้ไฟล์ เวลา deploy smart contract ใหม่

             *    var address = require('./epm.output.json').deploySmart;
             *    var ABI = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));

  2. Declare account
    
          // var accountPath = "/.monax/chains/multichain/account.json";
          // var account = fs.readJSONSync(accountPath);
          
          var accountData = require('/some/account/data.json');

  3. Create contract manager
  
              var contractManager = contracts.newContractManagerDev(burrowURL, accountData);

      *       newContractManagerDev คือ มี pipe (pipe มี burrow, account) เข้ามาแล้ว  
               ( see: https://github.com/monax/legacy-contracts.js )
      *       account เป็น constructor มี address, pubKey, privKey (string)
      *       pipe ต่อ legacy-contract กับ burrow js API ใช้ signing transaction มี DevPipe กับ LocalSignerPipe
      *       local signing ยังไม่มี ! ใช้ Devpipe ส่ง privKey พร้อมกับ Transaction ไปที่ Server (ทำให้)

  4. Create contract factory 
  
          // Create a factory (or contract template) from 'myJsonAbi'
          
          var myContractFactory = contractManager.newContractFactory(myJsonAbi);
          var myOtherContractFactory = contractManager.newContractFactory(myOtherJsonAbi);

  5. Create contract (X*, X**)
  
          var address = "...";
          var myContract myContractFactory.at(address);

       *ย่อ 4. 5. => var myContract = contractManager.newContractFactory(abi).at(address);

  6. USE !!
  
          myContract.add(34, 22, addCallback);


Pipe ใช้งานผ่าน

          myContract.pipes
            Pipe.addAccount(accountData) Add to the list of available accounts
            Pipe.removeAccount(accountId)
            Pipe.setDefaultAccount(accountId) default from account



* Create a new instance, Deploy the contract onto the chain

          var myContract;
          var myCode = "...";
          myContractFactory.new({data: myCode}, function(error, contract){
                  if(error) {throw error}
                  myContract = contract;
          });

X** Create a new instance, contract already exist on the chain

          var address = "...";
          var myContract;
          myContractFactory.at(address, function(error, contract){
                  if(error) {throw error}
                  myContract = contract;
          });
  // can omit the callback, no check is made see (5.)

** JavaScript syntax *

-- Tradition JS callback

    myContract.add(34, 22, addCallback);

    function addCallback(error, sum){
      console.log(sum.toString()); // Would print: 56
    }

-- ES6 (ES2015) JS callback

    myContract.add(34, 22, (error, sum) => {
      console.log(sum.toString()); // Would print: 56
    });



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


