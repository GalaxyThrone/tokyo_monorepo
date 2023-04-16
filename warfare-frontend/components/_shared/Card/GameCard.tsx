const GameCard = ({ bg, title }) => {
  return (
    <div className="w-full planet-item-card mb-5 bg-white/40 p-[1px] cursor-pointer">
      <div className="planet-item-card">
        <div className={`${bg} bg-cover flex px-4 hover:opacity-90`}>
          <div className="py-5 mx-1 uppercase text-xl text-white">{title}</div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
