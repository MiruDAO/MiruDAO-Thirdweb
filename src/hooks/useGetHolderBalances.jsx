import { useState, useEffect } from "react";

const useGetHolderBalances = ({ hasClaimedNFT, tokenModule, voteModule }) => {
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [votingModuleBalance, setVotingModuleBalance] = useState();
  // This useEffect grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab all the balances.
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts", amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("failed to get token amounts", err);
      });

    voteModule
      .balanceOfToken("0x211bf33199978efc021a77d958bd8c4c36ea9ef5")
      .then((balance) => {
        console.log("🤑 Balance of voting module", balance);
        setVotingModuleBalance(balance.displayValue);
      })
      .catch((err) => {
        console.error("failed to get balance of voting module", err);
      });
  }, [hasClaimedNFT]);

  return [memberTokenAmounts, votingModuleBalance];
};

export default useGetHolderBalances;
