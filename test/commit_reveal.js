const chai = require("chai");
const CommitReveal = artifacts.require("CommitReveal");
const BN = require("bn.js");
const Web3Wrapper = require("@0x/web3-wrapper").Web3Wrapper;
const BlockchainLifecycle = require("@0x/dev-utils").BlockchainLifecycle;
const moment = require("moment");
const chaiAsPromised = require("chai-as-promised");

const { advanceBlock, advanceTime } = require("./utils");

chai.use(chaiAsPromised);

contract("CommitReveal", async (accounts) => {
  let commitRevealWrapper = null;
  let web3Wrapper = null;
  let blockchainLifecycle = null;
  let tester1 = accounts[0];
  let tester2 = accounts[1];

  before("set up wrapper", async () => {
    commitRevealWrapper = await CommitReveal.deployed(10, "Yes", "No");
    web3Wrapper = new Web3Wrapper(web3.currentProvider);
    blockchainLifecycle = new BlockchainLifecycle(web3Wrapper);
  });

  // beforeEach("take snapshot", async () => {
  //   await blockchainLifecycle.startAsync();
  // });

  it("should record a proper commit Yes from tester1", async () => {
    const vote = "1~tester1Yes1";
    const commit = web3.utils.soliditySha3(vote);
    await commitRevealWrapper.commitVote(commit);
    const commitsArray = await commitRevealWrapper.getVoteCommitsArray();
    const voteStatus = await commitRevealWrapper.voteStatuses(commit);
    const numberOfVotes = await commitRevealWrapper.numberOfVotesCast();
    chai.expect(commitsArray[0]).to.equal(commit);
    chai.expect(voteStatus).to.equal("Committed");
    chai.expect(numberOfVotes.eq(new BN(1))).to.be.true;
  });

  it("commit No from tester2", async () => {
    const vote = "2~tester2No1";
    const commit = web3.utils.soliditySha3(vote);
    await commitRevealWrapper.commitVote(commit, { from: tester2 });
  });

  it("commit No from tester2", async () => {
    const vote = "2~tester2No2";
    const commit = web3.utils.soliditySha3(vote);
    await commitRevealWrapper.commitVote(commit, { from: tester2 });
  });

  it("commit No from tester1", async () => {
    const vote = "2~tester1No2";
    const commit = web3.utils.soliditySha3(vote);
    await commitRevealWrapper.commitVote(commit, { from: tester1 });
  });

  it("should record proper reveals", async () => {
    const vote1 = "1~tester1Yes1";
    const vote2 = "2~tester2No1";
    const vote3 = "2~tester2No2";
    const vote4 = "2~tester1No2";

    const commit1 = web3.utils.soliditySha3(vote1);
    const commit2 = web3.utils.soliditySha3(vote2);
    const commit3 = web3.utils.soliditySha3(vote3);
    const commit4 = web3.utils.soliditySha3(vote4);

    await commitRevealWrapper.revealVote(vote1, commit1);
    await commitRevealWrapper.revealVote(vote2, commit2, { from: tester2 });
    await commitRevealWrapper.revealVote(vote3, commit3, { from: tester2 });
    await commitRevealWrapper.revealVote(vote4, commit4);

    // const votesFor1 = await commitRevealWrapper.votesForChoice1();
    // const votesFor2 = await commitRevealWrapper.votesForChoice2();
    // const voteStatusCommit2 = await commitRevealWrapper.voteStatuses(commit2);
    // const voteStatusCommit1 = await commitRevealWrapper.voteStatuses(commit1);
    // chai.expect(votesFor2.eq(new BN(1))).to.be.true;
    // chai.expect(votesFor1.eq(new BN(1))).to.be.true;
    // chai.expect(voteStatusCommit2).to.equal("Revealed");
    // chai.expect(voteStatusCommit1).to.equal("Revealed");
  });

  it("advance time to get answer", async () => {
    await advanceTime(1000);
    await advanceBlock();
    await advanceBlock();
  });

  it("Output winner and how many votes", async () => {
    const winner = await commitRevealWrapper.getWinner();
    console.log("==winner==", winner);

    const voteCommits = await commitRevealWrapper.getVoteCommitsArray();
    console.log("Total votes casted", voteCommits.length);
  });

  // it("should not record an incorrect reveal", async () => {
  //   const badVote = "3~mybigsecret";
  //   const commit = web3.utils.soliditySha3(badVote);
  //   await commitRevealWrapper.commitVote(commit);
  //   await web3Wrapper.increaseTimeAsync(
  //     moment.duration(2, "minutes").asSeconds()
  //   );
  //   const tx = commitRevealWrapper.revealVote(badVote, commit);
  //   await chai.expect(tx).to.be.rejectedWith(Error);
  // });

  // it("should correctly get winner", async () => {
  //   const vote = "1~mybigsecret";
  //   const commit = web3.utils.soliditySha3(vote);
  //   await commitRevealWrapper.commitVote(commit);
  //   await web3Wrapper.increaseTimeAsync(
  //     moment.duration(2, "minutes").asSeconds()
  //   );
  //   await commitRevealWrapper.revealVote(vote, commit);
  //   const winner = await commitRevealWrapper.getWinner();
  //   chai.expect(winner).to.equal("YES");
  // });

  // afterEach("revert snapshot", async () => {
  //   await blockchainLifecycle.revertAsync();
  // });
});
