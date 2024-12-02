const { ethers, upgrades } = require("hardhat");

async function main() {
    const MintableToken = await ethers.getContractFactory("MintableToken");
    console.log("Deploying MintableToken...");
    const mintableToken = await upgrades.deployProxy(MintableToken, ["MyToken", "MTK", ethers.utils.parseEther("0.001")], { initializer: "initialize", kind: "transparent" });
    await mintableToken.deployed();
    console.log("MintableToken deployed to:", mintableToken.address);
}

// async function main_standalone() {
//     const MintableToken = await ethers.getContractFactory("MintableToken");
//     console.log("Deploying MintableToken...");
//     const contract = await MintableToken.deploy();
//     console.log("MintableToken:", contract.address);
// }

async function upgrade() {
    const MintableToken = await ethers.getContractFactory("MintableToken");
    console.log("Upgrading MintableToken...");
    const upgraded = await upgrades.upgradeProxy("<proxy-address>", MintableToken);
    console.log("MintableToken upgraded at:", upgraded.address);
}

// main_standalone();
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });