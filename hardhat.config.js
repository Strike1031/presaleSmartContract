/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ganache");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        bsc_test: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            accounts: [process.env.PRIVATE_KEY],
        },
        ethereum: {
            url: "https://eth.llamarpc.com",
            accounts: [process.env.PRIVATE_KEY],
        },
        sepolia: {
            url: "https://sepolia.drpc.org",
            accounts: [process.env.PRIVATE_KEY],
        },
        bsc: {
            url: "https://bsc-dataseed1.binance.org",
            accounts: [process.env.PRIVATE_KEY],
        },
    },
    mocha: {
        timeout: 1000000000,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    }
};
