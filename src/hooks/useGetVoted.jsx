import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useGetVoted = ({ hasClaimedNFT, proposals, voteModule, address }) => {
  const [hasVoted, setHasVoted] = useState(false);
  // We also need to check if the user already voted.
  useEffect(() => {
    // if (!hasClaimedNFT) {
    //   return;
    // }

    // If we haven't finished retreieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }

    // Check if the user has already voted on the first proposal.
    voteModule
      .hasVoted(proposals[proposals.length - 1].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted");
        } else {
          console.log("User still needs to vote");
        }
        // console.log(
        //   ethers.utils.formatUnits(
        //     proposals[proposals.length - 1].votes[1].count.toString(),
        //     18
        //   )
        // );
      })
      .catch((err) => {
        console.error("failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

  return [hasVoted, setHasVoted];
};

export default useGetVoted;
