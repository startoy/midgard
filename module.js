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

        exports.resLog = (msg, statusNum, body) => {
                //callback && callback();   // if have callback, call it
                if (!msg) msg = "calling success";
                if (!this.isNumber(statusNum) && statusNum != 0) statusNum = 1;
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

        exports.resSolLog = (statusReturn, successMsg, failMsg) => {
                /* default value */
                sc = successMsg;
                fa = failMsg;
                s  = statusReturn ;

                if (!successMsg) sc = "calling success";
                if (!failMsg)    fa = "calling failed";

                if (this.isNumber(statusReturn)) {
                        /* if statusReturn from smart contract is number */
                        s = Number(statusReturn);
                        if (s == 0 || s == -1) s = 0;
                        return ( s ? { message: sc, status: s } : { message: fa, status: s });
                } else if (statusReturn == "") {
                        /* if is nothing/null */
                        return this.resLog("null status return from sol/smart contract", 1);
                } else {
                        /* if is not number and not null, would be a body -> send as body*/
                        return this.resLog(sc, 1, statusReturn);
                }
        }

        exports.isNumber = (victim) => {
                // is type number( ex. "123" , 123) AND not null with "" (which is string null)
                if (typeof Number(victim) === "number" && Math.floor(Number(victim)) === Number(victim) && victim != "")
                        return 1;
                return 0;
        }
