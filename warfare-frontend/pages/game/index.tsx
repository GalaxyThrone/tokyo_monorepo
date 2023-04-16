import { useEffect, useState } from "react";
import { useAppContext } from "context/AppReducer";
import { ships } from "lib/ships";
import ShipCard from "components/_shared/Card/ShipCard";
import { batchMint } from "context/AppReducer/actions";
import GameCard from "components/_shared/Card/GameCard";
import Link from "next/link";
import GenericModal from "components/_shared/Modals/GenericModal";
import { addressShortFormat } from "lib";

export default function Home() {
  const [team, setTeam] = useState<number[]>([0, 0, 0]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [playerWaiting, setPlayerWaiting] = useState<string | null>(null);
  const [hasApprovedAll, setHasApprovedAll] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [{ contracts, address, signer, ownedShips, matches }, dispatch] =
    useAppContext();
  const allIdsSelected = team.every((id) => id !== 0);
  const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

  const handleShipIdChange = (id: number) => {
    const newTeam = [...team];

    // Check if there is an available slot at the start of the team array
    if (newTeam[0] === 0) {
      newTeam[0] = id;
    } else if (newTeam[1] === 0) {
      newTeam[1] = id;
    } else {
      // Check if the last slot in the team array is taken
      if (newTeam[newTeam.length - 1] !== 0) {
        // Move all values in the array one index to the left
        for (let i = 0; i < newTeam.length - 1; i++) {
          newTeam[i] = newTeam[i + 1];
        }
      }
      // Add the id to the end of the team array
      newTeam[newTeam.length - 1] = id;
    }

    setTeam(newTeam);
  };

  const registerGame = async () => {
    if (contracts.game && team.every((id) => id !== 0)) {
      try {
        const tx = await contracts.game.register(team);
        setIsRegistering(true);
        const recipt = await tx.wait();
        if (Number(recipt.status) == 1) {
          alert("Registered for a game successfully!");
          setTeam([0, 0, 0]);
          setIsRegistering(false);
        }
      } catch (error) {
        setIsRegistering(false);
        console.log(error);
      }
    }
  };

  const fetchPlayerWaiting = async () => {
    if (contracts.game) {
      const player = await contracts.game.playerWaiting();
      setPlayerWaiting(player);
    }
  };

  const checkApprovalForAll = async () => {
    if (contracts.game && address) {
      const isApproved = await contracts.ships.isApprovedForAll(
        address,
        contracts.game.address
      );
      setHasApprovedAll(isApproved);
    }
  };

  const setApprovalForAll = async () => {
    if (contracts && address) {
      const tx = await contracts.ships.setApprovalForAll(
        contracts.game.address,
        true
      );
      setIsApproving(true);
      await tx.wait();
      setHasApprovedAll(true);
      setIsApproving(false);
    }
  };

  const fetchGames = async () => {
    if (contracts.game) {
      const gameCount = (await contracts.game.nextGameId()).toNumber();
      const gamesPromises = [];

      for (let i = 1; i < gameCount; i++) {
        gamesPromises.push(contracts.game.getMatch(i));
      }

      const games = (await Promise.all(gamesPromises)).map((game) => ({
        player1: game.player1,
        player2: game.player2,
        team1: game.team1,
        team2: game.team2,
        turn: game.turn,
        lastMoveAt: game.lastMoveAt,
      }));

      dispatch({
        type: "SET_MATCHES",
        matches: games,
      });
    }
  };

  useEffect(() => {
    if (contracts) {
      fetchGames();
    }
  }, [contracts, isRegistering]);

  useEffect(() => {
    fetchPlayerWaiting();
  }, [contracts]);

  useEffect(() => {
    checkApprovalForAll();
  }, [contracts, address]);

  return (
    <>
      <div className="w-[calc(100%-32px)] h-[calc(100%-140px)] flex items-center justify-center gap-12">
        <div className="rounded-xl h-[400px] max-h-[400px] overflow-y-auto w-3/5 shadow-2xl mt-14 bg-purple-800/50 border-2 border-gray-600/80 text-white/80 backdrop-blur-sm p-10">
          <div className="flex items-center justify-between w-full text-xl uppercase mb-4">
            <div>Mint nfts to play</div>
            <div
              onClick={() => batchMint(contracts, signer, dispatch)}
              className="py-1.5 px-5 rounded-full text-lg bg-black/70 hover:bg-white hover:text-black cursor-pointer"
            >
              mint here
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5 font-orbitron">
            {Object.values(ships).map((ship, index) => (
              <ShipCard ship={ship} key={index} />
            ))}
          </div>
        </div>
        <div className="rounded-xl h-[400px] w-2/5 shadow-2xl mt-14 bg-purple-800/50 border-2 border-gray-600/80 text-white/80 backdrop-blur-sm p-10 flex flex-col justify-center gap-8">
          {playerWaiting && playerWaiting !== ADDRESS_ZERO && (
            <div className="text-sm uppercase">
              a player is waiting:{" "}
              <span className="font-bold text-indigo-200">
                {addressShortFormat(playerWaiting)}
              </span>
            </div>
          )}
          <div>
            <div onClick={() => setShowModal(true)}>
              <GameCard title={"register to a game"} bg={"bg-game-bg"} />
            </div>
            {allIdsSelected && (
              <div
                onClick={() =>
                  hasApprovedAll ? registerGame() : setApprovalForAll()
                }
              >
                <GameCard
                  title={
                    hasApprovedAll
                      ? "confirm"
                      : isApproving
                      ? "approving..."
                      : "approve nfts"
                  }
                  bg={"bg-landing"}
                />
              </div>
            )}
          </div>
          <Link href={`/game/${matches.length}`}>
            <GameCard title={"go to the lobby"} bg={"bg-game-bg-2"} />
          </Link>
        </div>
      </div>
      <div className="w-[calc(100%-32px)] overflow-auto rounded-xl h-1/3 shadow-2xl bg-purple-800/50 border-2 border-gray-600/80 backdrop-blur-sm p-4 text-center uppercase text-sm flex flex-col gap-2 items-center">
        <div className="text-3xl font-bold mb-4">
          How To Play: Galaxy Throne Warfare
        </div>
        <div className="max-w-[75%]">
          Galaxy Throne Warfare is a strategic turn-based space game where
          players command fleets of ships in 3vs3 battles. The game revolves
          around turn-based combat with each player executing actions for all
          their ships on their respective turns. The goal is to destroy your
          opponent's fleet by reducing the health of all their ships to zero.
        </div>

        <div className="text-xl font-bold mb-2">Ship Types:</div>
        <div className="max-w-[75%]">
          In Galaxy Throne Warfare, there are ten unique ship types, each with
          their own characteristics and special abilities. These ships are:
        </div>
        <ul>
          <li>Fighter</li>
          <li>Defender</li>
          <li>Healer</li>
          <li>Scout</li>
          <li>Assassin</li>

          <li>Tank</li>
          <li>Support</li>
          <li>Sniper</li>
          <li>Shielder</li>
          <li>Berserker</li>
        </ul>
        <div className="max-w-[75%]">
          Each ship has attributes such as attack, defense, health, and energy,
          as well as two unique special abilities. These abilities can be used
          strategically during the game to heal allies, boost attack or defense,
          weaken enemies, or perform additional attacks.
        </div>

        <div className="text-xl font-bold mb-2">Gameplay</div>
        <div className="max-w-[75%]">
          The gameplay revolves around alternating turns where each player
          executes actions for all their ships. During each turn, a player can
          choose to attack, rest, or use a special ability on their own ships or
          their opponent's ships.
        </div>
        <div className="text-xl font-bold mb-2">Attacking</div>
        <div className="max-w-[75%]">
          When a ship attacks, it deals damage to the target ship based on its
          attack attribute minus the target ship's defense attribute. The damage
          is modified by a random factor between 0.9 and 1.1, which means the
          actual damage dealt can vary slightly. If the attack is less than or
          equal to the defense, no damage is dealt.
        </div>
        <div className="text-xl font-bold mb-2">Resting</div>
        <div className="max-w-[75%]">
          A ship can choose to rest, which recharges its energy. Resting is
          important because energy is required to use special abilities. If a
          ship does not have enough energy, it cannot use its special abilities.
        </div>
        <div className="text-xl font-bold mb-2">Special Abilities</div>
        <div className="max-w-[75%]">
          Each ship has two unique special abilities that can be used
          strategically during the game. These abilities can heal allies, boost
          attack or defense, weaken enemies, or perform additional attacks. Each
          ability consumes a certain amount of energy, and a ship cannot use an
          ability if it does not have enough energy. Some examples of special
          abilities include:
        </div>

        <ul>
          <li>Heal: Restore health to a friendly ship.</li>
          <li>
            Boost Attack: Temporarily increase the attack attribute of a
            friendly ship.
          </li>
          <li>
            Boost Defense: Temporarily increase the defense attribute of a
            friendly ship.
          </li>
          <li>Recharge Energy: Restore energy to a friendly ship.</li>
          <li>
            Weaken Attack: Temporarily decrease the attack attribute of an enemy
            ship.
          </li>
          <li>
            Weaken Defense: Temporarily decrease the defense attribute of an
            enemy ship.
          </li>
          <li>
            Multiple Strike: Perform multiple attacks on a single enemy ship in
            one turn.
          </li>
          <li>
            Double Strike: Perform two attacks on different enemy ships in one
            turn.
          </li>
        </ul>
        <div className="text-xl font-bold mb-2">Winning the Game</div>
        <div className="max-w-[75%]">
          The game continues with players taking turns until one player has
          destroyed all of their opponent's ships by reducing their health to
          zero. The first player to achieve this is declared the winner.
        </div>
        <div className="text-xl font-bold mb-2">Game Mechanics</div>
        <div className="max-w-[75%]">
          Each game is played in a 3vs3 format, with each player commanding
          three ships.
          <br />
          Players take turns executing actions for all their ships.
          <br />
          Ships have attributes such as attack, defense, health, and energy.
          <br />
          Ships can attack, rest, or use special abilities during their turns.
          <br />
          Special abilities consume energy, and ships must have enough energy to
          use them.
          <br />
          The game ends when one player's entire fleet is destroyed, and the
          surviving player is declared the winner.{" "}
        </div>
      </div>
      <GenericModal
        title={"select ships"}
        showPopup={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[calc(100vh-90px)]">
          {ownedShips.map((ship, index) => (
            <div onClick={() => handleShipIdChange(Number(ship.id))}>
              <ShipCard
                bg={"bg-gray-700"}
                ship={ship}
                key={index}
                isSelected={team.includes(Number(ship.id))}
              />
            </div>
          ))}
        </div>
      </GenericModal>
    </>
  );
}
