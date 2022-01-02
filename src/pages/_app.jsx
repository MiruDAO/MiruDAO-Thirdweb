import React from "react";
// import "../styles/index.css";
import "../styles/output.css";
import '../index.css'
// Import ThirdWeb
import { ThirdwebWeb3Provider } from "@3rdweb/hooks";

// chains to support, 4 = Rinkeby
const supportedChainIds = [4];

// type of wallet to support, metamask is injected
const connectors = {
  injected: {},
};

function MyApp({ Component, pageProps }) {
  return (
    <React.StrictMode>
      <ThirdwebWeb3Provider
        connectors={connectors}
        supportedChainIds={supportedChainIds}
      >
          <h1 className="text-3xl text-black font-bold underline">
      Hello world!
    </h1>
        <div className="landing">
          <Component {...pageProps} />
        </div>
      </ThirdwebWeb3Provider>
    </React.StrictMode>
  );
}

export default MyApp;
