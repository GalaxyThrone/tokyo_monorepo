const ChainCard = ({ img, title, selectChain, setShowModal }) => {
  return (
    <div
      onClick={() => {
        selectChain(title);
        setShowModal(false);
      }}
      className="w-full planet-item-card mb-5 bg-white/40 p-[1px] cursor-pointer"
    >
      <div className="planet-item-card">
        <div className="bg-black flex px-4 hover:bg-gray-300/60">
          <div className="flex items-center gap-1 w-3/4">
            <div className="p-1.5 rounded-full bg-white flex items-center justify-center">
              <img src={img} alt="resource-icon" className="w-5 h-5" />
            </div>
            <div className="py-5 mx-1 uppercase">{title}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChainCard;
