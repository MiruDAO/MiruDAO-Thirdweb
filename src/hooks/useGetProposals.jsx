import { useState, useEffect } from "react";

const useGetProposals = ({ hasClaimedNFT, voteModule, setHasExecuted }) => {
  const [proposals, setProposals] = useState([]);
  const [goodProposals, setGoodProposals] = useState([]);

  // Retreive all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // A simple call to voteModule.getAll() to grab the proposals.
    voteModule
      .getAll()
      .then((proposals) => {
        // Set state!
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      })
      .catch((err) => {
        console.error("failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  useEffect(() => {
    if (proposals.length) {
      const properProposals = [];
      for (const proposal of proposals) {
        // console.log(proposal);
        if (proposal.state === 4) {
          properProposals.push(proposal.proposalId);
        }
      }
      console.log("good proposals", properProposals);
      setGoodProposals(properProposals);
      if (!goodProposals.length) {
        setHasExecuted(true);
      }
    }
  }, [proposals]);

  return [proposals, goodProposals];
  // return [proposals];
};

export default useGetProposals;
