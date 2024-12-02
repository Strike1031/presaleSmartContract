// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract MintableToken is Initializable, ERC20BurnableUpgradeable, OwnableUpgradeable, PausableUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable {
    uint256 public tokenPrice; // Price of one token in wei

    event TokensMinted(address indexed buyer, uint256 amount);
    event PriceUpdated(uint256 newPrice);
    event MintingPaused();
    event MintingUnpaused();
    event FundsWithdrawn(address indexed owner, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    /**
     * @dev Initialize the token with a name, symbol, and initial token price.
     * This function replaces the constructor for upgradeable contracts.
     */
    function initialize(
        string memory name,
        string memory symbol,
        uint256 initialPrice
    ) public initializer {
        __ERC20_init(name, symbol);          // Initialize ERC20 name and symbol
        __Ownable_init();                    // Initialize ownership
        __Pausable_init();                   // Initialize pause functionality
        __UUPSUpgradeable_init();            // Initialize UUPSUpgradeable
        __ReentrancyGuard_init();            // Initialize reentrancy guard

        tokenPrice = initialPrice;           // Set initial price
    }

    /**
     * @dev Function to mint tokens by sending ETH.
     * Can only be called when the contract is not paused.
     * Uses decimals to account for token precision.
     */
    function buyTokens() public payable whenNotPaused nonReentrant {
        require(msg.value > 0, "No ETH sent");
        uint256 amountToMint = (msg.value * (10 ** decimals())) / tokenPrice;
        require(amountToMint > 0, "Insufficient ETH to mint tokens");

        _mint(msg.sender, amountToMint);
        emit TokensMinted(msg.sender, amountToMint);
    }

    /**
     * @dev Fallback function to handle direct ETH transfers and mint tokens.
     * Can only be executed when the contract is not paused.
     */
    receive() external payable whenNotPaused  {
        buyTokens(); // Call buyTokens
    }

    /**
     * @dev Update the price of the tokens.
     * The new price must be greater than the current price.
     * Restricted to the contract owner.
     */
    function setPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > tokenPrice, "New price must be higher than current price");
        tokenPrice = newPrice;
        emit PriceUpdated(newPrice);
    }

    /**
     * @dev Pause the minting functionality.
     * Restricted to the contract owner.
     */
    function pauseMinting() external onlyOwner {
        _pause(); // Pauses the contract
        emit MintingPaused();
    }

    /**
     * @dev Unpause the minting functionality.
     * Restricted to the contract owner.
     */
    function unpauseMinting() external onlyOwner {
        _unpause(); // Unpauses the contract
        emit MintingUnpaused();
    }

    /**
     * @dev Withdraw collected ETH to the owner's address.
     * Emits a FundsWithdrawn event.
     * Restricted to the contract owner.
     */
    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }

    /**
     * @dev Function to authorize upgrades.
     * Required by UUPSUpgradeable.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
