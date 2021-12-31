import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
// import App from "./App.jsx";
import App from "./App1.jsx";

// Import ThirdWeb
import { ThirdwebWeb3Provider } from "@3rdweb/hooks";

// chains to support, 4 = Rinkeby
const supportedChainIds = [4];

// type of wallet to support, metamask is injected
const connectors = {
  injected: {},
};

// wrap app with 3rdweb
ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <div className="landing">
        <App />
      </div>
    </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
