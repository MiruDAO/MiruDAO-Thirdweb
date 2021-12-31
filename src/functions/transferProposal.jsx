import { ethers } from "ethers";

const transferProposal = async ({
  address,
  amount,
  tokenModule,
  voteModule,
}) => {
  console.log({ address });
  try {
    // Create proposal to transfer ourselves 6,900 token for being awesome.
    await tokenModule.delegateTo(address);
    await voteModule.propose(
      "Should the DAO transfer " +
        amount +
        " tokens from the treasury to " +
        address +
        " for being awesome?",
      [
        {
          // Again, we're sending ourselves 0 ETH. Just sending our own token.
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            // We're doing a transfer from the treasury to our wallet.
            "transfer",
            [address, ethers.utils.parseUnits(amount.toString(), 18)]
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
