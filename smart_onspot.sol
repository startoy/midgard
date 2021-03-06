pragma solidity ^0.4.4;

contract Onspot {

	uint onspotEnd;
	uint redeemEnd;

	struct Stock {
		uint id;
		string name;
		uint amount;
		uint price;
	}

	struct Wallet {
		uint onspot;
		uint ticket;
	}

	struct Employee {
		uint id;
		string name;
		Wallet myWallet;
		uint[] count_myStock;
		mapping(uint => Stock) myStock;
		uint count_myHistory;
		mapping(uint => History) myHistory;
	}

	struct History {
		uint id_sender;
		uint core_type;
		string description;
	}

	address[] public emp_list;
	mapping(address => Employee) employees;

	uint[] public stock_list;
	mapping(uint => Stock) stocks;

	/*----------------- CONFIG SETTING --------------*/

	function onspot(uint _startTime, uint _endTime, uint _startTime2, uint _endTime2) returns(uint onspot_time, uint redeem_time) {
		onspotEnd = _startTime + (_endTime - _startTime);
		redeemEnd = _startTime2 + (_endTime2 - _startTime2);
		onspot_time = onspotEnd;
		redeem_time = redeemEnd;
	}

	function contractTime_test(uint serverUnixTime) returns(uint now_time, uint onspot_time, uint redeem_time) {
		now_time = serverUnixTime;
		onspot_time = onspotEnd;
		redeem_time = redeemEnd;
	}

	function adjust_activityTime(uint _startTime, uint _endTime, uint _startTime2, uint _endTime2) returns(uint onspotEnd, uint redeemEnd) {
		onspotEnd = _startTime + (_endTime - _startTime);
		redeemEnd = _startTime2 + (_endTime2 - _startTime2);
	}

	/*---------------- STOCK -------------------*/

	function add_stock(uint _id, string _name, uint _amount, uint _price) returns(int) {
		if (equal(stocks[_id].name, "")) {
			var stock = stocks[_id];
			stock.id = _id;
			stock.name = _name;
			stock.amount = _amount;
			stock.price = _price;
			stock_list.push(_id) - 1;

			return 1;
		}

		return 0;
	}

	function delete_stock(uint _id) returns(int) {
		delete stocks[_id];
		for (uint i = 0; i < stock_list.length; i++) {
			if (stock_list[i] == _id) {
				stock_list[i] = stock_list[stock_list.length - 1];
				break;
			}
		}
		stock_list.length--;
		return 1;
	}

	function getStockList() constant returns(string) {
		uint num = countStocks();
		if(num==0) return "0";
		var str = "";
		var id = "";
		var amount = "";
		var price = "";
		bool isPass1Loop = false;

		str = strConcat(str, "[");
		for (uint i = 0; i < num; i++) {
			if(isPass1Loop) str = strConcat(str, ", ");
			str = strConcat(str, "{");

			uint j = stock_list[i];
			id = uint2str(stocks[j].id);
			str = strConcat(str, "id : ");
			str = strConcat(str, id);

			str = strConcat(str, ",");
			str = strConcat(str, "'name' : '");
			str = strConcat(str, stocks[j].name);
			str = strConcat(str, "'");
			
			str = strConcat(str, ",");
			amount = uint2str(stocks[j].amount);
			str = strConcat(str, "'amount' : ");
			str = strConcat(str, amount);
			
			str = strConcat(str, ",");
			price = uint2str(stocks[j].price);
			str = strConcat(str, "'price' : ");
			str = strConcat(str, price);

			str = strConcat(str, "}");
			isPass1Loop = true;
		}
		str = strConcat(str, "]");

		return (str);
	}

	function adjust_stock(uint _id, string _name, uint _amount, uint _price) returns(int) {
		if (equal(stocks[_id].name, ""))
			return 0;

		stocks[_id].name = _name;
		stocks[_id].amount = _amount;
		stocks[_id].price = _price;

		return 1;
	}

	function countStocks() returns(uint) {
		return stock_list.length;
	}

	function getStockItem(uint _id) constant returns(uint, string, uint, uint) {
		return (stocks[_id].id, stocks[_id].name, stocks[_id].amount, stocks[_id].price);
	}

	/*--------------- EMPLOOYEE FUNCTION ------------------*/

	function create_employee(address _address, uint _id, string _name) returns(int) {
		if (employees[_address].id == 0) {
			var epm = employees[_address];
			epm.id = _id;
			epm.name = _name;
			epm.myWallet.onspot = 3;
			epm.myWallet.ticket = 0;
			emp_list.push(_address) - 1;
			return 1;
		}
		return 0;
	}

	function give_onspot(address _sender, address _receiver, uint _coreValue, string _description, uint serverUnixTime) returns(int) {
		if (onspotEnd > serverUnixTime) {
			if (employees[_sender].myWallet.onspot <= 0)
				return 0;
			employees[_sender].myWallet.onspot -= 1;
			employees[_receiver].myWallet.ticket += 1;

			uint num = employees[_receiver].count_myHistory;

			employees[_receiver].myHistory[num].id_sender = employees[_sender].id;
			employees[_receiver].myHistory[num].core_type = _coreValue;
			employees[_receiver].myHistory[num].description = _description;
			employees[_receiver].count_myHistory += 1;
			return 1;
		}
		return -1;
	}

	function redeem_gift(address _req, uint _stock_id, uint serverUnixTime) returns(int) {
		if (redeemEnd > serverUnixTime) {
			if (employees[_req].myWallet.ticket < stocks[_stock_id].price)
				return 0;

			if (stocks[_stock_id].amount == 0)
				return 0;

			employees[_req].myWallet.ticket -= stocks[_stock_id].price;
			stocks[_stock_id].amount -= 1;

			employees[_req].count_myStock.push(_stock_id);
			employees[_req].myStock[_stock_id].name = stocks[_stock_id].name;
			employees[_req].myStock[_stock_id].amount += 1;
			return 1;
		}
		return -1;
	}

	function getHistory(address _req) constant returns(string) {
		uint num = employees[_req].count_myHistory;
		if(num==0) return "0";
		var str = "";
		var count = "";
		bool isPass1Loop = false;

		str = strConcat(str, "[ ");
		for (uint i = 0; i < num; i++) {
			if(isPass1Loop) str = strConcat(str, ", ");
			str = strConcat(str, "{");

			count = uint2str(employees[_req].myHistory[i].id_sender);
			str = strConcat(str, "\"id_sender\" : ");
			str = strConcat(str, count);
			
			str = strConcat(str, ",");
			count = uint2str(employees[_req].myHistory[i].core_type);
			str = strConcat(str, "\"core_type\" : ");
			str = strConcat(str, count);

			str = strConcat(str, ",");
			str = strConcat(str, "\"description\" : \"");
			str = strConcat(str, employees[_req].myHistory[i].description);
			str = strConcat(str, "\"");			

			str = strConcat(str, "}");
			isPass1Loop = true;
		}
		str = strConcat(str, " ]");
		return (str);
	}

	function getEmployeeRedeem(address _req) constant returns(string) {
		uint num = countStocks();
		if(num==0) return "0";
		var str = "";
		var count = "";
		uint i = 0;
		bool isPass1Loop = false;
		str = strConcat(str, "[ ");
		for (uint j = 0; j < num; j++) {
			i = stock_list[j];
			if (employees[_req].myStock[i].amount != 0) {
				if(isPass1Loop) str = strConcat(str, ", ");
				str = strConcat(str, "{");

				str = strConcat(str, "\"name\" : \"");
				str = strConcat(str, employees[_req].myStock[i].name);
				str = strConcat(str, "\"");

				str = strConcat(str, ",");
				count = uint2str(employees[_req].myStock[i].amount);
				str = strConcat(str, "\"amount\" : ");
				str = strConcat(str, count);

				str = strConcat(str, "}");
				isPass1Loop = true;
			}
		}
		str = strConcat(str, " ]");
		return (str);
	}

	function getEmployeeRedeem_count(address _req) returns(uint) {
		return employees[_req].count_myStock.length;
	}

	function getEmployee(address _addr) constant returns(string) {
		var str = "[";
		str = strConcat(str, "{");
		str = strConcat(str, "\"id\" : ");
		str = strConcat(str, uint2str(employees[_addr].id));
		str = strConcat(str, ",");

                str = strConcat(str, "\"name\" : \"");
                str = strConcat(str, employees[_addr].name);
		str = strConcat(str, "\",");

                str = strConcat(str, "\"onspot\" : ");
                str = strConcat(str, uint2str(employees[_addr].myWallet.onspot));
		str = strConcat(str, ",");

                str = strConcat(str, "\"ticket\" : ");
                str = strConcat(str, uint2str(employees[_addr].myWallet.ticket));
		str = strConcat(str, "}]");
		return str;
	}

	/*function getEmployee(address _addr) constant returns(uint, string, uint, uint) {
		return (employees[_addr].id, employees[_addr].name, employees[_addr].myWallet.onspot, employees[_addr].myWallet.ticket);
	}*/

	function countEmployees() public returns(uint) {
		return emp_list.length;
	}

	function clearData(address _addr) returns(int) {
		uint num = countStocks();

		for (uint i = 1; i <= num; i++)
			delete employees[_addr].myStock[i];

		delete employees[_addr].count_myStock;
		//delete employees[_addr].myWallet;
		employees[_addr].myWallet.onspot = 3;
		employees[_addr].myWallet.ticket = 0;
		return 1;
	}

	/*--------------------- UTIL FUNCTION -------------------------*/

	function strConcat(string _a, string _b) internal returns(string) {
		return strConcat(_a, _b, "", "", "");
	}

	function strConcat(string _a, string _b, string _c, string _d, string _e) internal returns(string) {
		bytes memory _ba = bytes(_a);
		bytes memory _bb = bytes(_b);
		bytes memory _bc = bytes(_c);
		bytes memory _bd = bytes(_d);
		bytes memory _be = bytes(_e);
		string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
		bytes memory babcde = bytes(abcde);
		uint k = 0;
		for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
		for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
		for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
		for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
		for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
		return string(babcde);
	}

	function compare(string _a, string _b) returns(int) {
		bytes memory a = bytes(_a);
		bytes memory b = bytes(_b);
		uint minLength = a.length;
		if (b.length < minLength) minLength = b.length;
		//@TODO: unroll the loop into increments of 32 and do full 32 byte comparisons
		for (uint i = 0; i < minLength; i++)
			if (a[i] < b[i])
				return -1;
			else if (a[i] > b[i])
			return 1;
		if (a.length < b.length)
			return -1;
		else if (a.length > b.length)
			return 1;
		else
			return 0;
	}

	function equal(string _a, string _b) returns(bool) {
		return compare(_a, _b) == 0;
	}

	function indexOf(string _haystack, string _needle) returns(int) {
		bytes memory h = bytes(_haystack);
		bytes memory n = bytes(_needle);
		if (h.length < 1 || n.length < 1 || (n.length > h.length))
			return -1;
		else if (h.length > (2 ** 128 - 1))
			return -1;
		else {
			uint subindex = 0;
			for (uint i = 0; i < h.length; i++) {
				if (h[i] == n[0]) {
					subindex = 1;
					while (subindex < n.length && (i + subindex) < h.length && h[i + subindex] == n[subindex]) {
						subindex++;
					}
					if (subindex == n.length)
						return int(i);
				}
			}
			return -1;
		}
	}

	function uint2str(uint i) public returns(string) {
		if (i == 0) return "0";
		uint j = i;
		uint length;
		while (j != 0) {
			length++;
			j /= 10;
		}
		bytes memory bstr = new bytes(length);
		uint k = length - 1;
		while (i != 0) {
			bstr[k--] = byte(48 + i % 10);
			i /= 10;
		}
		return string(bstr);
	}
}
