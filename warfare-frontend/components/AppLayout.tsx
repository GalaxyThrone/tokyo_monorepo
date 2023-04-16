import { useEffect, useRef } from "react";
import NavBar from "./_shared/NavBar";
import { useAppContext } from "context/AppReducer";
import { fetchOwnedShips, getContracts } from "context/AppReducer/actions";

const AppLayout = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [{ signer, contracts, address }, dispatch] = useAppContext();
  const { ships } = contracts;

  const scrollToTop = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (signer) {
      getContracts(signer, dispatch);
    }
  }, [signer]);

  useEffect(() => {
    if (address && contracts) {
      fetchOwnedShips(contracts, address, dispatch);
    }
  }, [address, contracts]);

  return (
    <div
      ref={scrollRef}
      className="h-[100vh] w-[100vw] p-4 z-50 bg-game-bg bg-cover bg-no-repeat text-white flex flex-col items-center"
    >
      <div className="w-[calc(100%-32px)] z-50">
        <NavBar scrollToTop={scrollToTop} />
      </div>
      {children}
    </div>
  );
};

export default AppLayout;
