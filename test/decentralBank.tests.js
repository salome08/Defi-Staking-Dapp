const { assert } = require("chai");

const Tether = artifacts.require("Tether");
const RWD = artifacts.require("RWD");
const DecentralBank = artifacts.require("DecentralBank");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("DecentralBank", ([owner, customer]) => {
  // All the testing code goes here
  console.log("here");
  let tether, rwd, decentralBank;

  function tokens(number) {
    return web3.utils.toWei(number, "ether");
  }

  before(async () => {
    //load contracts
    tether = await Tether.new();
    rwd = await RWD.new();
    decentralBank = await DecentralBank.new(rwd.address, tether.address);
    //transfer all tokens to decentralBank (1 million)
    await rwd.transfer(decentralBank.address, tokens("1000000"));

    //transfer 100 mock tether to customer
    await tether.transfer(customer, tokens("100"), { from: owner });
  });

  describe("Mock Tether Deployment", async () => {
    it("matches name successfully", async () => {
      const name = await tether.name();
      assert.equal(name, "Mock Tether Token");
    });
  });

  describe("RWD token Deployment", async () => {
    it("matches name successfully", async () => {
      const name = await rwd.name();
      assert.equal(name, "Reward token");
    });
  });

  describe("DecentralBank Deployment", async () => {
    it("matches name successfully", async () => {
      const name = await decentralBank.name();
      assert.equal(name, "Decentral Bank");
    });

    it("contract has tokens", async () => {
      let balance = await rwd.balanceOf(decentralBank.address);
      assert.equal(balance, tokens("1000000"));
    });
  });

  describe("Yield Farming", async () => {
    it("rewards tokens for staking", async () => {
      let result;

      //Check Investor Balance
      result = await tether.balanceOf(customer);
      assert.equal(
        result.toString(),
        tokens("100"),
        "customer mock wallet balance before staking"
      );

      //Check staking For Customer
      await tether.approve(decentralBank.address, tokens("100"), {
        from: customer,
      });
      await decentralBank.depositToken(tokens("100"), { from: customer });

      // Check updated balance of customer
      result = await tether.balanceOf(customer);
      console.log("result 1", result.toString());
      assert.equal(
        result.toString(),
        tokens("0"),
        "customer mock wallet balance after staking 100 token"
      );

      // Check updated balance of decentral Bank
      result = await tether.balanceOf(decentralBank.address);
      assert.equal(
        result.toString(),
        tokens("100"),
        "decentralBank mock wallet balance after staking customer"
      );

      // Is Staking Balance
      result = await decentralBank.isStaking(customer);
      console.log("result 4", result.toString());
      assert.equal(
        result.toString(),
        "true",
        "customer is staking balance to be true"
      );

      // Unstake token [
      await decentralBank.unstakeTokens({ from: customer });
      // Check unstaking balances
      result = await tether.balanceOf(customer);
      console.log("result 1", result.toString());
      assert.equal(
        result.toString(),
        tokens("100"),
        "customer mock wallet balance after Unstaking 100 token"
      );

      // Check updated balance of decentral Bank
      result = await tether.balanceOf(decentralBank.address);
      assert.equal(
        result.toString(),
        tokens("0"),
        "decentralBank mock wallet balance after Unstaking customer"
      );

      // Is Staking Balance
      result = await decentralBank.isStaking(customer);
      console.log("result 4", result.toString());
      assert.equal(
        result.toString(),
        "false",
        "customer is staking balance to be true"
      );

      // ]

      // Issue tokens
      await decentralBank.issueTokens({ from: owner });
      await decentralBank.issueTokens({ from: customer }).should.be.rejected; // Ensure only the owner can issue token
    });
  });
});
