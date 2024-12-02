# Token Mint Smart Contract

## Overview

The `PresaleToken` contract is an upgradeable ERC20-based smart contract designed for minting tokens in exchange for ETH at a predefined price. 
The functionality is minimalistic, focusing on minting, price adjustments, and contract pausing/unpausing. 
The contract also ensures safety and scalability with OpenZeppelin's upgradeable framework.

## Setup

Requirements:
​
- Node >= v12
Install dependencies
```
$ npm install       
```

## Compiling
​
To compile contract run:
​
```
$ npm run compile
```

## Deploying

```
$ npm run deploy -- --network <network_name>
For Example: npm run deploy -- --network sepolia
```

## Verifying the smart contract after deployment
```
npm run verify <contract_address> -- --network <network_name>
For Example: npm run verify -- --network sepolia
```

## Testing
​
First, make sure Ganache is running. To run rpc, run:
​
```
First, in one window:
$ npm run rpc
Second, in another window:
$ npm run test
```
