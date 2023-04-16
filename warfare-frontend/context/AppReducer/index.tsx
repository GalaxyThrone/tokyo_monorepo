import React, { createContext, useContext, useReducer } from "react";
import { Action, reducer } from "./reducer";
import { initialState, State } from "./store";

const AppContext = createContext<[State, React.Dispatch<Action>]>([
  initialState,
  () => null,
]);

const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const value = useReducer(reducer, initialState);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = (): [State, React.Dispatch<Action>] =>
  useContext(AppContext);

export default AppContextProvider;
export { useAppContext };
