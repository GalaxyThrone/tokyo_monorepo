import Link from "next/link";

const Home = () => {
  return (
    <>
      <div className="w-[calc(100%-32px)] h-[calc(100%-140px)] flex items-center justify-center gap-12">
        <Link className="w-1/2" href="/game">
          <div className="rounded-xl h-[400px] shadow-2xl mt-14 bg-game-bg bg-cover border-2 border-gray-600/80 hover:border-4 hover:border-white text-white/80 hover:text-white backdrop-blur-sm p-10 cursor-pointer">
            <div className="text-3xl font-bold uppercase text-center">
              gt warfare
            </div>
          </div>
        </Link>
        <Link className="w-1/2" href="/bridge">
          <div className="rounded-xl h-[400px] shadow-2xl mt-14 bg-bridge-bg bg-cover border-2 border-gray-600/80 hover:border-4 hover:border-white text-white/80 hover:text-white backdrop-blur-sm p-10 cursor-pointer">
            <div className="text-3xl font-bold uppercase text-center">
              nft bridge
            </div>
          </div>
        </Link>
      </div>
      <div className="w-[calc(100%-32px)] rounded-xl h-1/3 shadow-2xl bg-purple-800/50 border-2 border-gray-600/80 backdrop-blur-sm p-4">
        [PROJECT EXPLAINATION]
      </div>
    </>
  );
};

export default Home;
