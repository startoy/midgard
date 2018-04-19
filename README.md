 Config
 1. เอา temp/dev_pipe.js ไปวางที่ /monax-ui/node_modules/@monax/legacy-contracts/lib/pipes$
 2. รันเซิฟเวอร์ ใช้คำสั่ง $PORT=8080 node main.js

*see main.js along with..

          var burrowURL = "http://localhost:1337/rpc";
          var contracts =     require('@monax/legacy-contracts');

  1. Declare ABI file
    
          // ที่ใช้อยู่เพื่อจะได้ไม่ต้องแก้ไฟล์ เวลา deploy smart contract ใหม่
          contractABI = "./smart.abi"; // PATH TO ABI FILE
          ABI = fs.readJSONSync(contractABI);
          
         
             // อันเดิม
             *    var address = require('./epm.output.json').deploySmart;
             *    var ABI = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'));


  2. Declare account
  
          // var accountPath = "/.monax/chains/multichain/account.json";
          // var account = fs.readJSONSync(accountPath);
          var accountData = require('/some/account/data.json');


  3. Create contract manager
  
              // shorten declaration
              var contractManager = contracts.newContractManagerDev(burrowRPCURL, accountData);
              
              // full declaration
              var burrowModule = require("@monax/legacy-db");
              var burrow = burrowModule.createInstance("http://localhost:1337/rpc");
              var pipe = new contracts.pipes.DevPipe(burrow, accountData.multichain_full_000);
              var contractManager = contracts.newContractManager(pipe);

      *       ถ้าจะใช้ฟังก์ชันใน smart contract, URL ต้องใช้ตัว url ที่มี /rpc !! 
      *       ( see: https://github.com/monax/legacy-contracts.js )
      *       account ที่ใช้เป็น constructor ประกอบด้วย address, pubKey, privKey (string)
      *       pipe ต่อ legacy-contract กับ burrow js API ใช้ในการ signing transaction, มี sign 2 แบบ DevPipe กับ LocalSignerPipe
      *       แต่ localsigning ยังไม่มี! ให้ใช้แบบ Devpipe แทน ซึ่งจะส่ง privKey พร้อมกับ Transaction ไปที่ Server (ให้ server sign)

  4. Create contract factory 
  
          // Create a factory (or contract template) from 'myJsonAbi'
          
          var myContractFactory = contractManager.newContractFactory(myJsonAbi);
          
          //ถ้ามี contract ตัวอื่นด้วย
          var myOtherContractFactory = contractManager.newContractFactory(myOtherJsonAbi);

  5. Create contract (X*, X**)
  
          var address = "...";
          var myContract = myContractFactory.at(address);
          
          //ถ้ามี contract ตัวอื่นด้วย
          var myOtherContract = myOtherContractFactory.

       *ถ้าย่อ 4. 5. ใช้ => 
       
          var myContract = contractManager.newContractFactory(abi).at(address);

  6. USE !!
  
          myContract.add(34, 22, addCallback);

--------------------------------------------- note ----------------------------------------------

Pipe ใช้งาน

          myContract.pipes
            Pipe.addAccount(accountData) Add to the list of available accounts
            Pipe.removeAccount(accountId)
            Pipe.setDefaultAccount(accountId) default from account
            
            ex.  pipe = contracts.pipes.Devpipe(burrow,accountData);
                 let Result = pipe.addAccount();



X* Create a new instance, Deploy the contract onto the chain

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

-- Write as Traditional Javascrpipt asyn

    myContract.add(34, 22, addCallback);

    function addCallback(error, sum){
      console.log(sum.toString()); // Would print: 56
    }

-- Write as ES6 (ES2015) Javascrpipt asyn

    myContract.add(34, 22, (error, sum) => {
      console.log(sum.toString()); // Would print: 56
    });




การเรียก/ส่งสตริงผ่านบราวเซอร์

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


