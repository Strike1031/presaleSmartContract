const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MintableToken", function () {
  let MintableToken, mintableToken, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the proxy contract
    MintableToken = await ethers.getContractFactory("MintableToken");
    mintableToken = await upgrades.deployProxy(
      MintableToken,
      ["MyToken", "MTK", ethers.utils.parseEther("0.001")],
      { initializer: "initialize" }
    );
    await mintableToken.deployed();
  });

  it("Should initialize correctly", async function () {
    expect(await mintableToken.name()).to.equal("MyToken");
    expect(await mintableToken.symbol()).to.equal("MTK");
    expect(await mintableToken.tokenPrice()).to.equal(ethers.utils.parseEther("0.001"));
    expect(await mintableToken.owner()).to.equal(owner.address);
  });

  it("Should mint tokens when ETH is sent", async function () {
    const amountToSend = ethers.utils.parseEther("0.01");
    const decimals = await mintableToken.decimals();
    const expectedTokens = amountToSend.mul(ethers.BigNumber.from(10).pow(decimals)).div(ethers.utils.parseEther("0.001"));

    await mintableToken.connect(addr1).buyTokens({ value: amountToSend });
    expect(await mintableToken.balanceOf(addr1.address)).to.equal(expectedTokens);
  });

  it("Should handle ETH transfer directly to the contract", async function () {
    const amountToSend = ethers.utils.parseEther("0.02");
    const decimals = await mintableToken.decimals();
    const expectedTokens = amountToSend.mul(ethers.BigNumber.from(10).pow(decimals)).div(ethers.utils.parseEther("0.001"));

    await addr1.sendTransaction({ to: mintableToken.address, value: amountToSend });
    expect(await mintableToken.balanceOf(addr1.address)).to.equal(expectedTokens);
  });

  it("Should allow the owner to set a new token price (higher only)", async function () {
    const newPrice = ethers.utils.parseEther("0.002");
    await mintableToken.setPrice(newPrice);
    expect(await mintableToken.tokenPrice()).to.equal(newPrice);

    await expect(mintableToken.setPrice(ethers.utils.parseEther("0.0005"))).to.be.revertedWith("New price must be higher than current price");
  });

  it("Should allow the owner to pause and unpause minting", async function () {
    await mintableToken.pauseMinting();
    await expect(mintableToken.connect(addr1).buyTokens({ value: ethers.utils.parseEther("0.01") })).to.be.revertedWith("Pausable: paused");

    await mintableToken.unpauseMinting();
    const amountToSend = ethers.utils.parseEther("0.01");
    const decimals = await mintableToken.decimals();
    const expectedTokens = amountToSend.mul(ethers.BigNumber.from(10).pow(decimals)).div(ethers.utils.parseEther("0.001"));

    await mintableToken.connect(addr1).buyTokens({ value: amountToSend });
    expect(await mintableToken.balanceOf(addr1.address)).to.equal(expectedTokens);
  });

  it("Should allow the owner to withdraw funds", async function () {
    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
    const amountToSend = ethers.utils.parseEther("0.05");

    await mintableToken.connect(addr1).buyTokens({ value: amountToSend });
    const contractBalance = await ethers.provider.getBalance(mintableToken.address);
    expect(contractBalance).to.equal(amountToSend);

    const tx = await mintableToken.withdrawFunds();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed.mul(tx.gasPrice);

    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
    expect(finalOwnerBalance.add(gasUsed)).to.equal(initialOwnerBalance.add(amountToSend));
  });

  it("Should emit events correctly", async function () {
    const amountToSend = ethers.utils.parseEther("0.01");
    const decimals = await mintableToken.decimals();
    const expectedTokens = amountToSend.mul(ethers.BigNumber.from(10).pow(decimals)).div(ethers.utils.parseEther("0.001"));
    const newPrice = ethers.utils.parseEther("0.002");

    await expect(mintableToken.connect(addr1).buyTokens({ value: amountToSend }))
      .to.emit(mintableToken, "TokensMinted")
      .withArgs(addr1.address, expectedTokens);

    await expect(mintableToken.setPrice(newPrice))
      .to.emit(mintableToken, "PriceUpdated")
      .withArgs(newPrice);

    await expect(mintableToken.pauseMinting())
      .to.emit(mintableToken, "MintingPaused");

    await expect(mintableToken.unpauseMinting())
      .to.emit(mintableToken, "MintingUnpaused");

    await expect(mintableToken.withdrawFunds())
      .to.emit(mintableToken, "FundsWithdrawn")
      .withArgs(owner.address, ethers.utils.parseEther("0.01"));
  });
});
