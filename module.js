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

	exports.resLog = (msg, status, body) => {
		//callback && callback();   // if have callback, call that
		if(!msg){ msg = "" };
		if(!status){ status = 1; }
		return { message : msg, status : status, body };
	}

        exports.resLogCallBack = (msg, status, body, callback) => {
                callback && callback();   // if have callback, call that
		if(!msg){ msg = "" };
		if(!status){ status = 1; }
                return { message : msg, status : status, body };
        }


