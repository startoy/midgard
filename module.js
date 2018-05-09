        /****************************************************************
         ******** UTILITY
         *****************************************************************/

        /* if support JS ES6
	export function addAccount(jsonObj){
                return pipe.addAccount(jsonObj);
        }*/

        // commonJS way --no-use
        exports.addAccount = (jsonObj) => {
                return pipe.addAccount(jsonObj);
        }

        /* Response like LOG as JSON format */
        /* msg 	  = string
           status = int  [ -1, 0 = FALSE, ERROR, 1 = TRUE, SUCCESS, DEFAULT ]
	   *strict msg and status have to return
        */

        exports.resLog = (msg, statusNum, whereIs, body) => {
                //callback && callback();   // if have callback, call it
                if (!msg) msg = "calling success";
                if (!this.isNumber(statusNum) && statusNum != 0) statusNum = 1;
                this.serverLog(msg, whereIs);
                return {
                        message: msg,
                        status: statusNum,
                        body
                };
        }

        exports.resLogCallBack = (msg, status, body, callback) => {
                callback && callback(); // if have callback, call it
                // default value if null
                if (!msg) msg = "calling success";
                if (!this.isNumber(status) && statusNum != 0) status = 1;
                return {
                        message: msg,
                        status: status,
                        body
                };
        }

        exports.resSolLog = (statusReturn, successMsg, failMsg, whereIs) => {
                /* default value */
                sc = successMsg;
                fa = failMsg;
                s  = statusReturn ;

                if (!successMsg) sc = "calling success";
                if (!failMsg)    fa = "calling failed";
                if (this.isNumber(s)) {
                        /* if statusReturn from smart contract is number */
                        s = Number(statusReturn);
                        if (s == 0 || s == -1) s = 0;
                        //return ( s ? { message: sc, status: s } : { message: fa, status: s });
                        return ( s ? this.resLog(sc, s, whereIs) : this.resLog(fa, s, whereIs));
                } else if (s == "") {
                        /* if is nothing/null */
                        return this.resLog("null status return from sol/smart contract", 1, whereIs);
                } else {
                        /* if is not number and not null, would be a body -> send as body*/
                        return this.resLog(sc, 1, whereIs, statusReturn);
                }
        }

        exports.serverLog = (msg, WhereIs) => {
                //if(unixTimeFlag) console.log("[Unix:"+Math.floor(Date.now() / 1000)+"]");
		let d = new Date(new Date().getTime() + 7*60*60*1000); // 7 hours later
                //console.log("SERVER_LOG:[ ("+d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()+" "+d.get+") on (" + WhereIs +") : " + msg + "]");
                console.log("SERVER_LOG:[("+ d.toLocaleDateString()+" "+d.toLocaleTimeString()+") on (" + WhereIs +") : " + msg + "]");
        }
/*
new Date().toLocaleTimeString(); // 11:18:48 AM
//---
new Date().toLocaleDateString(); // 11/16/2015
//---
new Date().toLocaleString(); // 11/16/2015, 11:18:48 PM
*/

        exports.isNumber = (victim) => {
                // is type number( ex. "123" , 123) AND not null with "" (which is string null)
                if (typeof Number(victim) === "number" && Math.floor(Number(victim)) === Number(victim) && victim != "")
                        return 1;
                return 0;
        }
