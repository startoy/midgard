pragma solidity ^ 0.4.4;
contract TestContract {

    address public testAddress;

    event AddressSet(boolean indexed itWasSet);

    function getInts() constant returns (int a, int b) {
        a = -10;
        b = -50;
        AddressSet(false);
    }

    function getUints() constant returns (uint a, uint b) {
        a = 10;
        b = 50;
        AddressSet(false);
    }

    function setAddress(address addressIn) external {
        testAddress = addressIn;
        AddressSet(true);
    }

}