const BridgeInput = ({ text, img, onChange, onClickBtn, isSource }) => {
  return (
    <div className="h-full relative">
      <input
        onChange={(e) => onChange(e.target.value)}
        placeholder={isSource ? "Source Contract" : "End Contract"}
        className="outline-none w-full h-full text-black text-2xl bg-gray-100 rounded-xl pt-1 px-5 capitalize"
      />
      <div
        onClick={onClickBtn}
        className="absolute rounded-full bg-white right-5 top-1/2 -translate-y-1/2 rounded-2xl bg-indigo-200 hover:bg-indigo-300 border border-gray-300 cursor-pointer h-7 w-28 flex items-center justify-between text-xs text-black px-1"
      >
        <img className="w-5" src={img} />
        <div>{text}</div>
        <img src="/brand/downArrow.png" className="w-3" />
      </div>
    </div>
  );
};

export default BridgeInput;
