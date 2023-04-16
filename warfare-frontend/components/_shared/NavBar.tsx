import { useAppContext } from "context/AppReducer";
import useConnect from "hooks/useConnect";
import { addressShortFormat } from "lib";
import Link from "next/link";

interface Props {
  scrollToTop: () => void;
}

const NavBar = ({ scrollToTop }: Props) => {
  const { handleConnect } = useConnect();
  const [{ address }] = useAppContext();

  return (
    <div className="h-24 w-full flex flex-col lg:flex-row items-center">
      <div
        onClick={scrollToTop}
        className="h-24 w-full lg:w-1/2 flex items-center border-t border-l border-r cursor-pointer lg:border-b"
      >
        <div className="h-full w-2/5 bg-white flex items-center justify-center border-r">
          <Link href="/">
            <img
              src="/brand/galaxythrone-black.svg"
              className="w-full sm:w-1/2 lg:w-full"
            />
          </Link>
        </div>
        <div className="h-full w-3/5 bg-[#ffffff33] backdrop-blur-sm "></div>
      </div>
      <div className="h-24 w-full lg:w-1/2 flex items-center border">
        <a
          className="h-full cursor-pointer w-1/3 relative hover:bg-[#ffffff33] hover:backdrop-blur-sm"
          target="_blank"
          rel="noreferrer"
          href="https://galaxythrone.io/"
        >
          <div className="h-full font-orbitron uppercase text-xs lg:text-lg text-white flex items-center justify-center border-r">
            <div>about gt</div>
            <div className="hidden lg:block absolute bottom-0 left-1 leading-4 text-[8px] font-semibold">
              001
            </div>
          </div>
        </a>
        <a
          className="cursor-pointer h-full w-1/6  relative hover:bg-[#ffffff33] hover:backdrop-blur-sm"
          target="_blank"
          rel="noreferrer"
          href="https://discord.gg/9pfxZzuQdJ"
        >
          <div className="h-full font-orbitron uppercase text-xs lg:text-lg text-white flex items-center justify-center border-r">
            <img
              src="/brand/discord-logo.svg"
              className="w-1/2 sm:w-1/3 lg:w-1/4"
            />
            <div className="hidden lg:block absolute bottom-0 left-1 leading-4 text-[8px] font-semibold">
              002
            </div>
          </div>
        </a>
        <a
          className="cursor-pointer h-full w-1/6 relative hover:bg-[#ffffff33] hover:backdrop-blur-sm"
          target="_blank"
          rel="noreferrer"
          href="https://twitter.com/GalaxyThroneIO"
        >
          <div className="h-full font-orbitron uppercase text-xs lg:text-lg text-white flex items-center justify-center border-r">
            <img
              src="/brand/twitter-logo.svg"
              className="w-1/2 sm:w-1/3 lg:w-1/4"
            />
            <div className="hidden lg:block absolute bottom-0 left-1 leading-4 text-[8px] font-semibold">
              003
            </div>
          </div>
        </a>
        <div
          onClick={() => handleConnect()}
          className="w-1/3 h-full hover:bg-[#ffffff33] hover:backdrop-blur-sm relative cursor-pointer"
        >
          <div className="h-full font-orbitron uppercase text-xs lg:text-lg text-white flex items-center justify-center">
            <div>
              {address ? addressShortFormat(address) : "Connect wallet"}
            </div>
            <div className="hidden lg:block absolute bottom-0 left-1 leading-4 text-[8px] font-semibold">
              004
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
