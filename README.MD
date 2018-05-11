"midgard" made from nodejs as server-side, Created RESTful-api using Expressjs. make communicate to blockchain 'hyperledger burrow' or platform monax. glue with @monax legacy-contract, legacy-db to call deployed smart-contract, call burrow method on blockchain. also using mongodb to manage accounts. this is private use but if anyone have a question or suggest me about this project. feel free to ask me :)

      In the major way, I intend to develope a general distributed ledger which accounts have a wallet, send something to each other. all of this up on blockchain (or db to help manage the interface) 

Instruction
      
      1. create monax chain
      2. deploy smart contract (replace/edit testContract.sol, epm.yaml)
      3. run 'npm install'
      4. copy 'temp/dev_pipe.js' and replace in 'node_modules/@monax/legacy-contracts/lib/pipes'
      5. run 'npm start'
         
All available api see: apiserver.js
