const ShipCard = ({
  ship,
  bg,
  isSelected,
}: {
  ship: any;
  bg?: string;
  isSelected?: boolean;
}) => {
  const { name, image, attack, defense, health, energy, special1, special2 } =
    ship;

  return (
    <div
      className={`flex flex-col items-center gap-2 bg-black ${bg} ${
        isSelected && "bg-purple-800"
      } relative h-[270px] w-full cursor-pointer hover:opacity-90 active:opacity-80`}
    >
      <div className="absolute top-0 left-0 transform -translate-y-[1px] -translate-x-[1px] border-t border-l border-white w-1.5 h-1.5"></div>
      <div className="absolute top-0 right-0 transform -translate-y-[1px] translate-x-[1px] border-t border-r border-white w-1.5 h-1.5"></div>
      <div className="absolute bottom-0 left-0 transform translate-y-[1px] -translate-x-[1px] border-b border-l border-white w-1.5 h-1.5"></div>
      <div className="absolute bottom-0 right-0 transform translate-y-[1px] translate-x-[1px] border-b border-r border-white w-1.5 h-1.5"></div>
      <img src={image} alt={name} className="h-32 w-32" />
      <div className="text-sm font-bold">{name}</div>
      <div className="flex flex-col gap-2 text w-full uppercase px-5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold">Atk:</div>
            <div className="text-xs">{attack}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold">Def:</div>
            <div className="text-xs">{defense}</div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold">HP:</div>
            <div className="text-xs">{health}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold">Nrg:</div>
            <div className="text-xs">{energy}</div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold">Sp1:</div>
            <div className="text-xs">{special1}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold">Sp2:</div>
            <div className="text-xs">{special2}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipCard;
