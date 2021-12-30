import { useState } from "react";
import { transferProposal } from "../functions/Index";

const CreateProposal = ({ sdk, address }) => {
  const [loading, setLoading] = useState(false);

  const voteModule = sdk.getVoteModule(
    "0x6c4729722d375f22cd8A70b731495677fd7e1b47"
  );

  const tokenModule = sdk.getTokenModule(
    "0x211BF33199978eFc021A77D958bd8c4C36EA9Ef5"
  );

  const handleClick = async () => {
    setLoading(true);
    alert("clicked");
    await transferProposal({
      address,
      amount: 6_900,
      tokenModule,
      voteModule,
    });
    setLoading(false);
  };

  return (
    <button onClick={handleClick}>
      Create Proposal? Loading: {loading.toString()}
    </button>
  );
};

export default CreateProposal;
