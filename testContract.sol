pragma solidity ^ 0.4.4;
contract TestContract {

    uint onspotEnd;
		uint redeemEnd;

    uint[] public stock_list;
    mapping (uint => Stock) stocks;
    address public testAddress;

    struct Stock {
		uint    id;
		string 	name;	
		uint 	amount;
		uint 	price;
    }

	event AddressSet(bool indexed itWasSet);

	function getInts() constant returns (int a, int b) {
		a = -10;
		b = -50;
		AddressSet(false);
	}

	function getUints(uint x) constant  returns (uint a, uint b) {
		a = 10 + x;
		b = 50;
		AddressSet(false);
	}

	function setAddress(address addressIn) external {
		testAddress = addressIn;
		AddressSet(true);
	}

	function add_stock(uint _id,string _name,uint _amount,uint _price)  returns (uint)
	{
		if(equal(stocks[_id].name,""))
		{
			var stock = stocks[_id];
			stock.id   = _id;
			stock.name = _name;
			stock.amount = _amount;
			stock.price = _price;

			stock_list.push(_id) -1;
			return 1;
		}
		return 0;
	}

	function compare(string _a, string _b) returns (int) {
		bytes memory a = bytes(_a);
		bytes memory b = bytes(_b);
		uint minLength = a.length;
		if (b.length < minLength) minLength = b.length;
		//@TODO: unroll the loop into increments of 32 and do full 32 byte comparisons
		for (uint i = 0; i < minLength; i ++)
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

	function equal(string _a, string _b) returns (bool) {
		return compare(_a, _b) == 0;
	}

	function contractTime_test(uint serverUnixTime) returns (uint now_time, uint onspot_time, uint redeem_time)
	{
		// now_time 	= now;
		now_time = serverUnixTime;
		onspot_time = onspotEnd;
		redeem_time = redeemEnd;
	}

}
