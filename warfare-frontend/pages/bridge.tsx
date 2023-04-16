import BridgeInput from "components/_shared/BridgeInput";
import RightModal from "components/_shared/Modals/ChainModal";
import { chainSelection, getChainImgUrl } from "lib";
import { useRef, useState } from "react";

const Home = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sourceContract, setSourceContract] = useState<string>("");
  const [endContract, setEndContract] = useState<string>("");
  const [sourceSelected, setSourceSelected] = useState(
    chainSelection[1].subchains[0].name
  );
  const [showModal, setShowModal] = useState(false);
  const [endChainSelected, setEndChainSelected] = useState("");
  const [isSource, setIsSource] = useState(false);
  const [NFT_ID, setNFT_ID] = useState<string>();

  console.log("sourceContract: ", sourceContract);
  console.log("endContract: ", endContract);
  console.log("sourceSelected: ", sourceSelected);
  console.log("endChainSelected: ", endChainSelected);

  return (
    <>
      <div className="w-[calc(100%-32px)] h-[calc(100%-140px)] flex items-center justify-center gap-12">
        <div className="rounded-xl h-[400px] shadow-2xl mt-14 w-3/5 bg-purple-800/50 border-2 border-gray-600/80 backdrop-blur-sm p-4">
          [inventory]
        </div>
        <div className="rounded-xl h-[400px] shadow-2xl mt-14 w-2/5 bg-purple-800/50 border-2 border-gray-600/80 backdrop-blur-sm p-10">
          <div className="text-2xl text-center mb-3">Bridge your assets</div>
          <div className="relative h-1/2 flex flex-col gap-1.5">
            <div className="h-1/2 text-5xl relative">
              <BridgeInput
                onClickBtn={() => {
                  setIsSource(true);
                  setShowModal(true);
                }}
                text={sourceSelected.substring(0, 8)}
                img={getChainImgUrl(sourceSelected)}
                onChange={(text) => setSourceContract(text)}
                isSource={true}
              />
              <div className="absolute bottom-0 translate-y-1/2 -translate-x-1/2 -left left-1/2 h-10 w-10 border-4 border-purple-800/90 bg-indigo-200 hover:bg-indigo-300 cursor-pointer rounded-xl z-50">
                <img src="/brand/arrow-down.svg" alt="arrow" className="w-8" />
              </div>
            </div>
            <div className="h-1/2 text-5xl">
              <BridgeInput
                onClickBtn={() => {
                  setIsSource(false);
                  setShowModal(true);
                }}
                text={endChainSelected.substring(0, 8)}
                img={
                  endChainSelected.length > 0
                    ? getChainImgUrl(endChainSelected)
                    : ""
                }
                onChange={(text) => setEndContract(text)}
                isSource={false}
              />
            </div>
          </div>
          <div className="mt-5 h-1/3">
            <input
              onChange={(e) => setNFT_ID(e.target.value)}
              placeholder="NFT ID TO BRIDGE"
              className="outline-none w-full h-full text-black text-2xl bg-gray-100 rounded-xl pt-1 px-5 capitalize"
            />
          </div>
        </div>
      </div>
      <div className="w-[calc(100%-32px)] rounded-xl h-1/3 shadow-2xl bg-purple-800/50 border-2 border-gray-600/80 backdrop-blur-sm p-4">
        [HOW BRIDGE WORKS]
      </div>
      <RightModal
        onClose={() => setShowModal(false)}
        setShowModal={setShowModal}
        showPopup={showModal}
        isSource={isSource}
        selectChain={isSource ? setSourceSelected : setEndChainSelected}
        sourceSelected={sourceSelected}
      />
    </>
  );
};

export default Home;
