import { chainSelection } from "lib";
import ChainCard from "../Card/ChainCard";
import GenericModal from "./GenericModal";

interface PopupProps {
  onClose: () => void;
  showPopup: boolean;
  isSource: boolean;
  setShowModal: any;
  selectChain: (chain: any) => void;
  sourceSelected?: string;
}

const ChainModal = ({
  onClose,
  showPopup,
  isSource,
  setShowModal,
  selectChain,
  sourceSelected,
}: PopupProps) => {
  const renderChainCards = () => {
    if (isSource) {
      return chainSelection.map((chain, i) => (
        <div key={i}>
          <h3>{chain.name}</h3>
          {chain.subchains.map((subchain, k) => (
            <ChainCard
              selectChain={selectChain}
              key={k}
              img={chain.img}
              title={subchain.name}
              setShowModal={setShowModal}
            />
          ))}
        </div>
      ));
    }

    const chainCardProps = {
      selectChain,
      setShowModal,
      img: "",
      title: "",
    };

    switch (sourceSelected) {
      case "SEPOLIA":
        chainCardProps.img = chainSelection[2].img;
        chainCardProps.title = chainSelection[2].subchains[0].name;
        break;
      case "GOERLI":
        chainCardProps.img = chainSelection[1].img;
        chainCardProps.title = chainSelection[1].subchains[0].name;
        break;
      case "ZK EVM TESTNET":
        chainCardProps.img = chainSelection[0].img;
        chainCardProps.title = chainSelection[0].subchains[1].name;
        break;
      case "TAIKO A2 HACKATHON TESTNET":
        chainCardProps.img = chainSelection[0].img;
        chainCardProps.title = chainSelection[0].subchains[0].name;
        break;
      default:
        return null;
    }

    return <ChainCard {...chainCardProps} />;
  };

  return (
    <GenericModal
      title={"select chain"}
      onClose={onClose}
      showPopup={showPopup}
    >
      {renderChainCards()}
    </GenericModal>
  );
};

export default ChainModal;
