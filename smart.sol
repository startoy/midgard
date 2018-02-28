pragma solidity ^ 0.4 .4;
contract Library {
	struct Stock {
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
	}

	address[] public emp_list;
	mapping(address => Employee) employees;

	uint[] public stock_list;
	mapping(uint => Stock) stocks;

	/*---------------- STOCK -------------------*/

	function add_stock(uint _id, string _name, uint _amount, uint _price) returns(uint) {
		if (equal(stocks[_id].name, "")) {
			var stock = stocks[_id];
			stock.name = _name;
			stock.amount = _amount;
			stock.price = _price;

			stock_list.push(_id) - 1;
			return 1;
		}
		return 0;
	}

	function getStockList() public returns(string) {
		uint num = countStocks();
		var str = "";
		var amount = "";
		var price = "";
		for (uint i = 1; i <= num; i++) {
			str = strConcat(str, stocks[i].name);
			str = strConcat(str, " , ");

			amount = uintToString(stocks[i].amount);
			str = strConcat(str, amount);
			str = strConcat(str, " , ");

			price = uintToString(stocks[i].price);
			str = strConcat(str, price);
			str = strConcat(str, "\n\t\t\t\t\t\t");
		}
		return (str);
	}

	function getStock(uint _id) public returns(string, uint, uint) {
		return (stocks[_id].name, stocks[_id].amount, stocks[_id].price);
	}

	function countStocks() public returns(uint) {
		return stock_list.length;
	}

	function adjustStock(uint _id, string _name, uint _amount, uint _price) returns(uint) {
		stocks[_id].name = _name;
		stocks[_id].amount = _amount;
		stocks[_id].price = _price;
		return 1;
	}

	/*--------------- EMPLOOYEE FUNCTION ------------------*/


	function create_employee(address _address, uint _id, string _name) returns(uint) {
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

	function initial_onspot(address _address) returns(uint) {
		if (employees[_address].id != 0) {
			employees[_address].myWallet.onspot = 3;
			employees[_address].myWallet.ticket = 0;
			return 1;
		}
		return 0;
	}

	function clearData(address _addr) returns(uint) {
		uint num = countStocks();
		for (uint i = 1; i <= num; i++)
			delete employees[_addr].myStock[i];

		delete employees[_addr].count_myStock;
		delete employees[_addr].myWallet;
		return 1;

	}

	function getEmployeeList(uint pos) constant returns(address) {
		return emp_list[pos];
	}

	function getEmployee(address _addr) public returns(uint, string, uint, uint) {
		return (employees[_addr].id, employees[_addr].name, employees[_addr].myWallet.onspot, employees[_addr].myWallet.ticket);
	}

	function countEmployees() public returns(uint) {
		return emp_list.length;
	}

	function giving(address _sender, address _receiver) public returns(uint) {
		if (employees[_sender].myWallet.onspot <= 0)
			return 0;
		employees[_sender].myWallet.onspot -= 1;
		employees[_receiver].myWallet.ticket += 1;
		return 1;
	}

	function redeem(address _req, uint _stock_id) returns(uint) {
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

	function getEmployeeRedeem_count(address _req) returns(uint) {
		return employees[_req].count_myStock.length;
	}

	function getEmployeeRedeem(address _req) returns(string) {
		uint num = countStocks();
		var str = "";
		var count = "";
		for (uint i = 1; i <= num; i++) {
			if (employees[_req].myStock[i].amount != 0) {
				str = strConcat(str, employees[_req].myStock[i].name);
				str = strConcat(str, " = ");
				count = uintToString(employees[_req].myStock[i].amount);
				str = strConcat(str, count);
				str = strConcat(str, "\n\t\t\t\t\t");
			}
		}
		return (str);
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

	function uintToString(uint v) constant returns(string str) {

		uint maxlength = 100;
		bytes memory reversed = new bytes(maxlength);
		uint i = 0;
		while (v != 0) {
			uint remainder = v % 10;
			v = v / 10;
			reversed[i++] = byte(48 + remainder);
		}
		bytes memory s = new bytes(i + 1);

		for (uint j = 0; j <= i; j++) {
			s[j] = reversed[i - j];
		}
		str = string(s);
	}

	function compare(string _a, string _b) returns(int) {
		bytes memory a = bytes(_a);
		bytes memory b = bytes(_b);
		uint minLength = a.length;
		if (b.length < minLength) minLength = b.length;
		//@todo unroll the loop into increments of 32 and do full 32 byte comparisons
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

}