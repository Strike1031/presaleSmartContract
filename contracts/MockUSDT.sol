// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract USDT is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens with 18 decimals
    constructor() ERC20("TetherUSD", "USDT") {
        _mint(msg.sender, 100000000000000000000000000);
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}