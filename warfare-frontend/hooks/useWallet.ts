import { useState, useEffect } from "react";
import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";

const useWallet = () => {
  const [onboard, setOnboard] = useState<any>(null);

  useEffect(() => {
    const initOnboard = async () => {
      const injected = injectedModule();
      const onboardInstance = Onboard({
        wallets: [injected],
        chains: [
          {
            id: "0x13881",
            token: "MATIC",
            label: "Polygon Mumbai",
            rpcUrl:
              "https://polygon-mumbai.g.alchemy.com/v2/ct8fPH-_vgcHsMYghjfA2F6fFpFYJvQ_", // Replace with your Infura API key
          },
        ],
        accountCenter: {
          desktop: {
            enabled: false,
            containerElement: "body",
          },
          mobile: {
            enabled: false,
            containerElement: "body",
          },
        },
      });

      setOnboard(onboardInstance);
    };

    initOnboard();
  }, []);

  return { onboard };
};

export default useWallet;
