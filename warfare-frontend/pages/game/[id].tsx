import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Game } from "../../lib/types/types";
import { useAppContext } from "context/AppReducer";
import { checkPlayerTurn, fetchOwnedShips } from "context/AppReducer/actions";
import { addressShortFormat, isBigNumber } from "lib";
import { player2ShipImages, shipImages, ships } from "lib/ships";

type ShipAction = {
  action: number;
  fromShip: number;
  toShip: number;
};

const GamePage: React.FC = () => {
  const [{ contracts, address, isPlayer1Turn }, dispatch] = useAppContext();
  const [team1Ships, setTeam1Ships] = useState([]);
  const [team2Ships, setTeam2Ships] = useState([]);
  const [game, setGame] = useState<Game | null>(null);
  const [targetIsAlly, setTargetIsAlly] = useState(false);
  const [attackerIndex, setAttackerIndex] = useState<number | null>(null);
  const [player1, setPlayer1] = useState<string>("");
  const [player2, setPlayer2] = useState<string>("");
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [actions, setActions] = useState<ShipAction[]>([]);

  const router = useRouter();
  const { id: gameId } = router.query;

  const actionsNames = ["attack", "special1", "special2", "rest"];

  const userTeamLostShips = () => {
    const died = [];
    if (isPlayer1Turn)
      team1Ships.forEach((ship) => {
        if (!ship.alive) died.push(ship);
      });
    else
      team2Ships.forEach((ship) => {
        if (!ship.alive) died.push(ship);
      });
    if (died.length > 0) return true;
    return false;
  };

  const fetchShipData = async (teamIds: number[]) => {
    const shipsPromises = teamIds.map((tokenId) =>
      contracts.ships
        .getShip(tokenId)
        .then((ship) => ({ ...ship, id: tokenId }))
    );

    const ships = await Promise.all(shipsPromises);

    ships.forEach((ship) => {
      Object.keys(ship).forEach((key) => {
        if (isBigNumber(ship[key])) {
          ship[key] = ship[key].toString();
        }
      });
      ship.image = shipImages[ship.name.toLowerCase()];
    });

    return ships;
  };

  const handleAction = (action: number) => {
    const fromShip = isPlayer1Turn
      ? team1Ships[attackerIndex].id
      : team2Ships[attackerIndex].id;

    const toShip =
      isPlayer1Turn && targetIsAlly
        ? team1Ships[targetIndex].id
        : !isPlayer1Turn && targetIsAlly
        ? team2Ships[targetIndex].id
        : isPlayer1Turn && !targetIsAlly
        ? team2Ships[targetIndex].id
        : team1Ships[targetIndex].id;

    setActions([...actions, { fromShip, toShip, action }]);

    setAttackerIndex(null);
    setTargetIndex(null);
  };

  const fetchGameData = async () => {
    if (gameId && contracts) {
      const gameData = await contracts.game.getMatch(Number(gameId));

      setGame(gameData);
      console.log("gameData", gameData);

      const player1Ships = gameData.team1.map((id) => id.toNumber());
      const player2Ships = gameData.team2.map((id) => id.toNumber());

      setPlayer1(gameData.player1);
      setPlayer2(gameData.player2);

      const team1Ships = await fetchShipData(player1Ships);
      console.log("team1Ships", team1Ships);
      setTeam1Ships(team1Ships);

      const team2Ships = await fetchShipData(player2Ships);
      console.log("team2Ships", team2Ships);
      setTeam2Ships(team2Ships);
    }
  };

  const shipToCheck = (team, index) => {
    return (
      <div>
        <div>NAME: {team[index].name}</div>
        <div>HP: {team[index].health}</div>
        <div>ATK: {team[index].attack}</div>
        <div>DEF: {team[index].defense}</div>
        <div>SP1: {ships[team[index].name.toLowerCase()].special1}</div>
        <div>SP2: {ships[team[index].name.toLowerCase()].special2}</div>
      </div>
    );
  };

  const takeTurn = async () => {
    try {
      console.log("actions", actions);
      console.log("gameId", gameId);
      const tx = await contracts.game.takeTurn(gameId, actions, {
        gasLimit: 5000000,
      });
      const recipt = await tx.wait();
      if (Number(recipt.status) === 1) {
        console.log("Take turn successful");
        // Update game state and ship data after the turn
        fetchGameData();
        checkPlayerTurn(game, address, dispatch);
      }
    } catch (error) {
      console.error("Take turn failed", error);
    }
  };

  const endMatch = async () => {
    try {
      const tx = await contracts.game.endMatch(gameId, {
        gasLimit: 5000000,
      });
      const recipt = await tx.wait();
      if (Number(recipt.status) === 1) {
        fetchOwnedShips(contracts, address, dispatch);
        alert("NFTs have been returned");
        router.push("/game");
        // Update game state and ship data after the turn
      }
    } catch (error) {
      console.error("End match failed", error);
    }
  };

  useEffect(() => {
    if (gameId && contracts?.game) {
      fetchGameData();
    }
  }, [gameId, contracts]);

  useEffect(() => {
    if (actions.length === 3) {
      takeTurn();
      setActions([]);
    }
  }, [actions]);

  useEffect(() => {
    if (game && address) {
      checkPlayerTurn(game, address, dispatch);
    }
  }, [game, address]);

  return (
    <>
      <div className="w-[calc(100%-32px)] h-[calc(100%-140px)] flex items-center justify-center gap-12">
        <div className="rounded-xl w-full h-[400px] bg-purple-800/60 shadow-2xl mt-14 border-2 border-gray-600/80 text-white/80 hover:text-white backdrop-blur-sm p-10">
          <div className="w-full flex items-center justify-between relative">
            <div className="w-full">
              <div className="text-3xl font-bold uppercase text-center absolute -top-10 left-10">
                Team 1: {addressShortFormat(player1)}
              </div>
              <div className="flex flex-col justify-center gap-1">
                {team1Ships.map((ship, index) => (
                  <img
                    key={index}
                    src={ship.image}
                    onClick={
                      isPlayer1Turn && attackerIndex === null
                        ? () => setAttackerIndex(index)
                        : isPlayer1Turn && attackerIndex !== null
                        ? () => {
                            setTargetIndex(index);
                            setTargetIsAlly(true);
                          }
                        : () => {
                            setTargetIndex(index);
                            setTargetIsAlly(false);
                          }
                    }
                    className="w-28 animate-bounce cursor-pointer hover:w-36"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationDuration: `${1 + index * 0.2}s`,
                      animationTimingFunction: `cubic-bezier(0.2, ${
                        0.8 + index * 0.05
                      }, 0.6, 1)`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="w-full self-end">
              <div className="text-3xl font-bold uppercase text-center absolute -top-10 right-10">
                Team 2: {addressShortFormat(player2)}
              </div>
              <div className="flex flex-col items-end justify-center gap-1">
                {team2Ships.map((ship, index) => {
                  if (!ship.alive) {
                    return;
                  }
                  return (
                    <img
                      key={index}
                      src={player2ShipImages[ship.name.toLowerCase()]}
                      onClick={
                        !isPlayer1Turn && attackerIndex === null
                          ? () => setAttackerIndex(index)
                          : !isPlayer1Turn && attackerIndex !== null
                          ? () => {
                              setTargetIndex(index);
                              setTargetIsAlly(true);
                            }
                          : () => {
                              setTargetIsAlly(false);
                              setTargetIndex(index);
                            }
                      }
                      className="w-28 animate-bounce cursor-pointer hover:w-36"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animationDuration: `${1 + index * 0.2}s`,
                        animationTimingFunction: `cubic-bezier(0.2, ${
                          0.8 + index * 0.05
                        }, 0.6, 1)`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[calc(100%-32px)] rounded-xl h-1/3 shadow-2xl bg-purple-800/50 border-2 border-gray-600/80 backdrop-blur-sm p-4">
        {team1Ships.every((item) => !item.alive) ||
          (team2Ships.every((item) => !item.alive) && (
            <>
              <div>Game Over</div>
              <div>
                Winner:{" "}
                {team1Ships.every((item) => !item.alive) ? "Team 2" : "Team 1"}
              </div>
              <div
                onClick={() => endMatch()}
                className="rounded-full bg-black text-white text-sm px-4 py-1.5 hover:bg-white cursor-pointer hover:text-black"
              >
                End Match
              </div>
            </>
          ))}
        {attackerIndex === null && (
          <div className="text-center">
            choose one of your ship to take action
          </div>
        )}
        {attackerIndex !== null && targetIndex === null && (
          <div className="text-center">
            choose one of the opponent ship to attack or one of yours to health
          </div>
        )}
        <div className="flex items-center justify-between">
          {attackerIndex !== null && isPlayer1Turn
            ? shipToCheck(team1Ships, attackerIndex)
            : attackerIndex !== null && shipToCheck(team2Ships, attackerIndex)}
          {attackerIndex !== null && targetIndex !== null && (
            <div className="uppercase text-center font-bold flex flex-col gap-2">
              {actionsNames.map((action, index) => (
                <div
                  key={index}
                  onClick={() => handleAction(index + 1)}
                  className="hover:text-lg cursor-pointer"
                >
                  {action}
                </div>
              ))}
            </div>
          )}
          {targetIndex !== null && isPlayer1Turn && !targetIsAlly
            ? shipToCheck(team2Ships, targetIndex)
            : targetIndex !== null && targetIsAlly && isPlayer1Turn
            ? shipToCheck(team1Ships, targetIndex)
            : targetIndex !== null && shipToCheck(team2Ships, targetIndex)}
        </div>
        <div className="flex items-center justify-center gap-4">
          <div
            onClick={() => {
              setAttackerIndex(null);
              setTargetIndex(null);
            }}
            className="rounded-full bg-black text-white text-sm px-4 py-1.5 hover:bg-white cursor-pointer hover:text-black"
          >
            reset
          </div>
          {userTeamLostShips && (
            <div
              onClick={() => {
                setActions([...actions, { action: 0, fromShip: 0, toShip: 0 }]);
              }}
              className="rounded-full bg-black text-white text-sm px-4 py-1.5 hover:bg-white cursor-pointer hover:text-black"
            >
              set died
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GamePage;
