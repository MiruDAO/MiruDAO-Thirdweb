import { useEffect, useMemo, useState } from "react";

import { ethers } from "ethers";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";

import { ThirdwebSDK } from "@3rdweb/sdk";

import { UnsupportedChainIdError } from "@web3-react/core";

import CreateProposal from "../CreateProposal";
import useGetProposals from "../../hooks/useGetProposals";
import { shortenAddress } from "../../helpers";
import useGetVoted from "../../hooks/useGetVoted";
import useGetMemberAddresses from "../../hooks/useGetMemberAddresses";
import useGetHolderBalances from "../../hooks/useGetHolderBalances";

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

const bundleDropModule = sdk.getBundleDropModule(
  "0xB375409a0b3BCd62B35Edb6925803b45ecEA0000"
);

const tokenModule = sdk.getTokenModule(
  "0x211BF33199978eFc021A77D958bd8c4C36EA9Ef5"
);

const voteModule = sdk.getVoteModule(
  "0x6c4729722d375f22cd8A70b731495677fd7e1b47"
);

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();

  console.log("👋 Address:", address);

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(true);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  const [isVoting, setIsVoting] = useState(false);

  const [hasExecuted, setHasExecuted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const [proposals, goodProposals] = useGetProposals({
    hasClaimedNFT,
    voteModule,
    setHasExecuted,
  });

  const [hasVoted, setHasVoted] = useGetVoted({
    hasClaimedNFT,
    proposals,
    voteModule,
    address,
  });

  const [memberAddresses] = useGetMemberAddresses({
    hasClaimedNFT,
    bundleDropModule,
  });

  const [memberTokenAmounts, votingModuleBalance] = useGetHolderBalances({
    hasClaimedNFT,
    tokenModule,
    voteModule,
  });

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't
          // hold any of our token.
          memberTokenAmounts[address] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    // If they don't have an connected wallet, exit!
    if (!address) {
      return;
    }

    // Check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to call nft balance", error);
      });
  }, [address]);

  // useEffect(() => {
  //   if (!proposals.length) {
  //     return;
  //   }

  //   const proposalCards = proposals.map((proposal, index) => (
  //     // if (proposal.state !== 1 ) {

  //     // }
  //     <div key={proposal.proposalId} className="card">
  //       <h5>{proposal.description}</h5>
  //       <div>
  //         {proposal.votes.map((vote) => (
  //           <div key={vote.type}>
  //             <input
  //               type="radio"
  //               id={proposal.proposalId + "-" + vote.type}
  //               name={proposal.proposalId}
  //               value={vote.type}
  //               //default the "abstain" vote to chedked
  //               defaultChecked={vote.type === 2}
  //               disabled={proposal.state!==1}
  //             />
  //             <label htmlFor={proposal.proposalId + "-" + vote.type}>
  //               {vote.label}
  //             </label>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   ));
  // }, [proposals]);

  const delegate = async () => {
    try {
      const delegation = await tokenModule.getDelegationOf(address);
      // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
      if (delegation === ethers.constants.AddressZero) {
        //if they haven't delegated their tokens yet, we'll have them delegate them before voting
        await tokenModule.delegateTo(address);
      }
    } catch (err) {
      console.error("failed to delegate tokens", err);
    }
  };

  const executeProposals = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    //before we do async things, we want to disable the button to prevent double clicks
    setIsExecuting(true);
    console.log("executing...");

    delegate();
    try {
      await Promise.all(
        goodProposals.map(async (proposalId) => {
          return voteModule.execute(proposalId);
        })
      );
    } catch (err) {
      console.log("Failed to execute proposals", err);
    } finally {
      setIsExecuting(false);
    }
  };

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks in
          your connected wallet.
        </p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="">
        <h1 className="font-bold text-5xl pt-20 pb-8">Welcome to MiruDAO 🧠</h1>
        <button onClick={() => connectWallet("injected")} className="bg-black p-4 hover:bg-white hover:text-black duration-700 ">
          Connect your wallet
        </button>
      </div>
    );
  }

  return (
    <div className="member-page">
      <img
        src="/miru.png"
        alt="Logo"
        style={{
          width: "80px",
          height: "80px",
          position: "relative",
          top: "140px",
          left: "-20px",
        }}
      />
      <h1>MiruDAO Dashboard</h1>
      <p>Lets accelerate neurotech together!</p>
      <div>
        <div>
          <h2>Member List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Address</th>
                <th>Token Amount</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => {
                return (
                  <tr key={member.address}>
                    <td>{shortenAddress(member.address)}</td>
                    <td>{member.tokenAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="card">
            <h3>Treasury Balance: {votingModuleBalance}</h3>
          </div>
          {!goodProposals.length
            ? [
                <button
                  key={1}
                  disabled={isExecuting || hasExecuted}
                  onClick={executeProposals}
                >
                  {isExecuting
                    ? "Executing..."
                    : hasExecuted
                    ? "Successful proposals have been executed"
                    : "Execute successful proposals"}
                </button>,
              ]
            : null}
          <CreateProposal sdk={sdk} address={address} />
        </div>
        <div>
          <h2>Active Proposals</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              //before we do async things, we want to disable the button to prevent double clicks
              setIsVoting(true);

              // lets get the votes from the form for the values
              const votes = proposals.map((proposal) => {
                let voteResult = {
                  proposalId: proposal.proposalId,
                  //abstain by default
                  vote: 2,
                };
                proposal.votes.forEach((vote) => {
                  const elem = document.getElementById(
                    proposal.proposalId + "-" + vote.type
                  );

                  if (elem.checked) {
                    voteResult.vote = vote.type;
                    return;
                  }
                });
                return voteResult;
              });

              // first we need to make sure the user delegates their token to vote
              try {
                //we'll check if the wallet still needs to delegate their tokens before they can vote
                const delegation = await tokenModule.getDelegationOf(address);
                // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                if (delegation === ethers.constants.AddressZero) {
                  //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                  await tokenModule.delegateTo(address);
                }
                // then we need to vote on the proposals
                try {
                  await Promise.all(
                    votes.map(async (vote) => {
                      // before voting we first need to check whether the proposal is open for voting
                      // we first need to get the latest state of the proposal
                      const proposal = await voteModule.get(vote.proposalId);
                      // then we check if the proposal is open for voting (state === 1 means it is open)
                      if (proposal.state === 1) {
                        // if it is open for voting, we'll vote on it
                        const voted = await voteModule.hasVoted(
                          proposal.proposalId,
                          address
                        );
                        if (!voted) {
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                      }
                      // if the proposal is not open for voting we just return nothing, letting us continue
                      return;
                    })
                  );
                  try {
                    // if any of the propsals are ready to be executed we'll need to execute them
                    // a proposal is ready to be executed if it is in state 4
                    await Promise.all(
                      votes.map(async (vote) => {
                        // we'll first get the latest state of the proposal again, since we may have just voted before
                        const proposal = await voteModule.get(vote.proposalId);

                        //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                        if (proposal.state === 4) {
                          return voteModule.execute(vote.proposalId);
                        }
                      })
                    );
                    // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                    setHasVoted(true);
                    // and log out a success message
                    console.log("successfully voted");
                  } catch (err) {
                    console.error("failed to execute votes", err);
                  }
                } catch (err) {
                  console.error("failed to vote", err);
                }
              } catch (err) {
                console.error("failed to delegate tokens");
              } finally {
                // in *either* case we need to set the isVoting state to false to enable the button again
                setIsVoting(false);
              }
            }}
          >
            {proposals.map((proposal, index) => (
              <div key={proposal.proposalId} className="card bg-emerald-500">
                <h5>{proposal.description}</h5>
                <div>
                  {proposal.votes.map((vote) => (
                    <div key={vote.type}>
                      <input
                        type="radio"
                        id={proposal.proposalId + "-" + vote.type}
                        name={proposal.proposalId}
                        value={vote.type}
                        //default the "abstain" vote to chedked
                        defaultChecked={vote.type === 2}
                        disabled={proposal.state !== 1}
                      />
                      <label htmlFor={proposal.proposalId + "-" + vote.type}>
                        {vote.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button disabled={isVoting || hasVoted} type="submit">
              {isVoting
                ? "Voting..."
                : hasVoted
                ? "You Already Voted"
                : "Submit Votes"}
            </button>
            <small>
              This will trigger multiple transactions that you will need to
              sign.
            </small>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
