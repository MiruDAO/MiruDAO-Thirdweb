import { useState } from "react";
import { transferProposal } from "../functions/Index";

const CreateProposal = (props) => {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        alert("clicked");
        await transferProposal();
        setLoading(false);
      }}
    >
      Create Proposal? Loading: {loading.toString()}
    </button>
  );
};

export default CreateProposal;
