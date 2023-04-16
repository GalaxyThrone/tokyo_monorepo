const GenericModal = ({ showPopup, title, children, onClose }) => {
  return (
    <>
      <div
        className={`fixed z-[999] h-[100vh] ${
          showPopup
            ? "right-0"
            : "right-[-100%] lg:right-[-41%] 2xl:right-[-25%]"
        }  top-[1px] h-[calc(100%-1.5px)] w-full bg-brand-modal transition-all duration-300 md:w-[calc(100%-36%)] lg:w-2/5 2xl:w-1/4`}
      >
        <div className="z-50 flex h-full flex-col bg-black">
          <div className="absolute top-0 left-0 transform -translate-y-[1px] -translate-x-[1px] border-t border-l border-white w-2 h-2"></div>
          <div className="absolute bottom-0 left-0 transform translate-y-[1px] -translate-x-[1px] border-b border-l border-white w-2 h-2"></div>
          <div className="w-full">
            <div className="w-full flex justify-between py-7 border-b border-white/25">
              <div className="pl-10 w-full">
                <div className="text-xl font-medium mb-2 uppercase">
                  {title}
                </div>
                <div className="flex items-center gap-4 w-full"></div>
              </div>
              <div
                onClick={() => onClose()}
                className="pr-10 cursor-pointer font-bold normal-case"
              >
                X
              </div>
            </div>
            <div className="w-full p-6">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GenericModal;
