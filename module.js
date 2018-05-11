/****************************************************************
******** UTILITY
*****************************************************************/

/* ------------------- LOG ----------------------- */

exports.resLog = (msg, statusNum, whereIs, bodyPa) => {
        //callback && callback();   // if have callback, call it
        if (!msg) msg = "calling success";
        if (!this.isNumber(statusNum) && statusNum != 0) statusNum = 1;
        let logLevel = 1 ; // 1 = INFO, 0 = ERROR
        if (statusNum == 0) logLevel = 0;
        this.serverLog(logLevel, msg, whereIs);

        let body = eval(bodyPa);
        return {
                message: msg,
                status: statusNum,
                body : body
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

exports.serverLog = (logLevel, msg, WhereIs) => {
        //if(unixTimeFlag) console.log("[Unix:"+Math.floor(Date.now() / 1000)+"]");
        let d = new Date(new Date().getTime() + 7*60*60*1000); // 7 hours later
        /*// string pad left
        var padding = Array(256).join(' ');
        pad(padding, 3213, true);

        // number pad left, stick to right use false
        pad('00000000000', 123, true); */
        let msgLv = logLevel ? "[INFO ]" : "[ERROR]";
        let tempmsg = Array(19).join(' ');
        let printmsg = "[SERVER_LOG]"+msgLv+"["+ d.toLocaleDateString()+" "+d.toLocaleTimeString()+"] on [" + this.pad(tempmsg, WhereIs, true) +"] : " + msg + "";
        console.log("%s", printmsg);
        //console.log("SERVER_LOG:"+msgLv+"[("+ d.toLocaleDateString()+" "+d.toLocaleTimeString()+") on (" + WhereIs +") : " + msg + "]");
}
/*
new Date().toLocaleTimeString(); // 11:18:48 AM
new Date().toLocaleDateString(); // 11/16/2015
new Date().toLocaleString(); // 11/16/2015, 11:18:48 PM
*/

/* ------------------------ MONGODB --------------------------- */
const User		= require('./apps/models/user');

// insert
exports.addAccountToDB = (emp_id, account, adminFlag) => {
        if(adminFlag){    
                let user = new User({
                        emp_id : emp_id,
                        address : account.address,
                        pubkey : account.pubKey,
                        prikey : account.priKey,
                        active : true,
                        admin : true
                });
        }else{
                let user = new User({
                        emp_id : emp_id,
                        address : account.address,
                        pubkey : account.pubKey,
                        prikey : account.priKey,
                        active : true
                });
        }
        user.save((err)=>{
                if (err) return false;
                return true;
        });
}

//update
exports.updateAccountFromDB = (emp_id, updateObj) => {
        let query = { emp_id : emp_id };
        User.findOneAndUpdate(query, { updateObj }, (err) => {
                if(err) return false;
                return true;
        })
}

//delete : address should not delete ? so change active status instead
exports.deleteAccountFromDB = (emp_id, updateObj) => {
        let query = { emp_id : emp_id };
        // updateObj should be { active : false }
        User.findOneAndUpdate(query, { updateObj }, (err) => {
                if(err) return false;
                return true;
        })
}

//query
exports.queryAccountFromDB = (query) => {
        User.find(query,(err, user) => {
                if(err) return err;
                if(!user || user == "") return "err : no user provided";
                return user;
        });
}



/* ------------------------ UTIL --------------------------- */

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

exports.isNumber = (victim) => {
        // is type number( ex. "123" , 123) AND not null with "" (which is string null)
        if (typeof Number(victim) === "number" && Math.floor(Number(victim)) === Number(victim) && victim != "")
                return 1;
        return 0;
}

exports.pad = (pad, str, padLeft) => {
        if (typeof str === 'undefined') 
                return pad;
        if (padLeft) {
                return (pad + str).slice(-pad.length);
        } else {
                return (str + pad).substring(0, pad.length);
        }
}