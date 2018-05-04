        /****************************************************************
         ******** UTILITY
         *****************************************************************/

        /* if support JS ES6
	export function addAccount(jsonObj){
                return pipe.addAccount(jsonObj);
        }*/

        // commonJS way
        exports.addAccount = (jsonObj) => {
                return pipe.addAccount(jsonObj);
        }

        /* Response like LOG as JSON format */
        /* msg 	  = string
           status = int  [ -1, 0 = FALSE, ERROR, 1 = TRUE, SUCCESS, DEFAULT ]
	   *strict msg and status have to return
        */

        exports.resLog = (status, msg, body) => {
                //callback && callback();   // if have callback, call that
                if (!msg) msg = "calling success";
                if (!status) status = 1;
                return {
                        message: msg,
                        status: status,
                        body
                };
        }

        exports.resLogCallBack = (status, msg, body, callback) => {
                callback && callback(); // if have callback, call that
                if (!msg) msg = "calling success";
                if (!status) status = 1;
                return {
                        message: msg,
                        status: status,
                        body
                };
        }

        exports.resSolLog = (statusReturn, successMsg, failMsg) => {
                /* default value */
                if (!successMsg) sc = "calling success";
                if (!failMsg) fa = "calling failed";
                /* if Number then return as number status */
                if (isNumber(statusReturn)) {
                        s = Number(statusReturn);
                        if (s == 0 || s == -1) s = 0;
                        return ( s ? { message: sc, status: s } : { message: fa, status: s });
                } else if (statusReturn == "") {
                        return resLog("null status return from sol", 0);
                } else {
                        /* if is string and lot of msg, send as body */
                        return resLog(sc, s, statusReturn);
                }
        }

        exports.isNumber = (victim) => {
                if (typeof Number(victim) === "number" && Math.floor(Number(victim)) === Number(victim) && victim != "")
                        return 1;
                return 0;
        }
