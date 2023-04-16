import { useEffect } from "react";
import { ethers } from "ethers";
import { init, useConnectWallet, useWallets } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import { useAppContext } from "context/AppReducer";

const injected = injectedModule();

init({
  wallets: [injected],
  chains: [
    {
      id: "0x28c5a",
      token: "Taiko",
      label: "Taiko Testnet",
      rpcUrl: "https://l2rpc.hackathon.taiko.xyz", // Replace with your Infura API key
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

const useConnect = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const wallets = useWallets();
  const [{ provider }, userDispatch] = useAppContext();

  useEffect(() => {
    if (wallet) {
      const { provider } = wallet;
      userDispatch({
        type: "SET_ADDRESS",
        address: wallet.accounts[0].address,
      });
      userDispatch({
        type: "SET_PROVIDER",
        provider: new ethers.providers.Web3Provider(provider),
      });
    }
  }, [wallet]);

  useEffect(() => {
    if (provider) {
      userDispatch({
        type: "SET_SIGNER",
        signer: provider.getSigner(),
      });
    }
  }, [provider]);

  const handleConnect = () => {
    if (!wallet && typeof window !== "undefined") {
      connect();
    } else if (!connecting && wallet) {
      disconnect({ label: wallet.label });

      userDispatch({
        type: "SET_ADDRESS",
        address: "",
      });
    }
  };

  useEffect(() => {
    const walletData = window.localStorage.getItem(
      "galaxyThroneConnectedWallets"
    );
    if (walletData) {
      const pastConnectedWallets = JSON.parse(walletData);
      if (pastConnectedWallets?.length > 0)
        connect({
          autoSelect: { label: pastConnectedWallets[0], disableModals: true },
        });
    }
  }, []);

  useEffect(() => {
    if (wallets) {
      let connected: string[] = [];
      if (wallets?.length > 0) {
        connected = wallets.map(({ label }: { label: any }) => label);
      }
      window.localStorage.setItem(
        "galaxyThroneConnectedWallets",
        JSON.stringify(connected)
      );
    }
  }, [wallets]);

  return {
    wallet,
    connecting,
    handleConnect,
  };
};

export default useConnect;
