import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

const voteModule = sdk.getVoteModule(
  "0x6c4729722d375f22cd8A70b731495677fd7e1b47"
);

const tokenModule = sdk.getTokenModule(
  "0x211BF33199978eFc021A77D958bd8c4C36EA9Ef5"
);

const transferProposal = async () => {
  try {
    const amount = 6_900;
    // Create proposal to transfer ourselves 6,900 token for being awesome.
    await tokenModule.delegateTo(process.env.WALLET_ADDRESS);
    await voteModule.propose(
      "Should the DAO transfer " +
        amount +
        " tokens from the treasury to " +
        process.env.WALLET_ADDRESS +
        " for being awesome? 1",
      [
        {
          // Again, we're sending ourselves 0 ETH. Just sending our own token.
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            // We're doing a transfer from the treasury to our wallet.
            "transfer",
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),

          toAddress: tokenModule.address,
        },
      ]
    );

    console.log(
      "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create first proposal", error);
  }
};

export default transferProposal;
