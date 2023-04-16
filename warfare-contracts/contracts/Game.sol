// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Ships} from "./Ships.sol";

interface IShips {
    function ownerOf(uint256 tokenId) external view returns (address owner);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function killShip(uint256 shipId) external;

    function setHealth(uint256 shipId, uint256 amount) external;

    function setEnergy(uint256 shipId, uint256 amount) external;

    function setAttack(uint256 shipId, uint256 amount) external;

    function setDefense(uint256 shipId, uint256 amount) external;

    function reviveShip(uint256 shipId) external;

    function getShip(uint256 id) external view returns (Ships.Ship memory);
}

contract Game is Ownable, IERC721Receiver {
    uint256 constant TURN_TIME = 180;
    uint256 constant ENERGY_COST_HEAL = 20;
    uint256 constant ENERGY_COST_BOOST_ATTACK = 15;
    uint256 constant ENERGY_COST_BOOST_DEFENSE = 15;
    uint256 constant ENERGY_COST_RECHARGE_ENERGY = 10;
    uint256 constant ENERGY_COST_WEAKEN_ATTACK = 20;
    uint256 constant ENERGY_COST_WEAKEN_DEFENSE = 20;
    uint256 constant ENERGY_COST_MULTIPLE_STRIKE = 30;
    uint256 constant ENERGY_COST_DOUBLE_STRIKE = 25;

    IShips public ships;
    uint256 public nextGameId;
    mapping(uint256 => Match) private matches;
    address public playerWaiting;
    uint256[3] public teamWaiting;

    event TurnTaken(uint256 indexed gameId, address indexed player);

    struct Action {
        uint256 fromShip;
        uint256 toShip;
        uint256 action; // 1 = attack, 2 = special1 3 = special2 4 = rest
    }

    struct Match {
        address player1;
        uint256[3] team1;
        address player2;
        uint256[3] team2;
        uint8 turn; // 1 = player1, 2 = player2
        uint32 lastMoveAt;
    }

    constructor(IShips _ships) {
        ships = _ships;
        nextGameId = 1;
    }

    function register(uint256[3] calldata shipsIds) external {
        for (uint256 i = 0; i < shipsIds.length; i++) {
            ships.safeTransferFrom(msg.sender, address(this), shipsIds[i]);
        }
        if (playerWaiting == address(0)) {
            playerWaiting = msg.sender;
            teamWaiting[0] = shipsIds[0];
            teamWaiting[1] = shipsIds[1];
            teamWaiting[2] = shipsIds[2];
        } else {
            uint256[3] memory teamJoining;
            teamJoining[0] = shipsIds[0];
            teamJoining[1] = shipsIds[1];
            teamJoining[2] = shipsIds[2];
            matches[nextGameId] = Match(
                playerWaiting,
                teamWaiting,
                msg.sender,
                teamJoining,
                1,
                uint32(block.timestamp)
            );
            nextGameId++;
            playerWaiting = address(0);
            delete teamWaiting;
        }
    }

    function takeTurn(uint256 matchId, Action[3] calldata actions) external {
        Match storage match_ = matches[matchId];
        if (uint32(block.timestamp) - match_.lastMoveAt <= TURN_TIME) {
            require(
                (msg.sender == match_.player1 && match_.turn == 1) ||
                    (msg.sender == match_.player2 && match_.turn == 2),
                "It is not your turn."
            );
        } else if (
            uint32(block.timestamp) - match_.lastMoveAt <= TURN_TIME * 2
        ) {
            require(
                (msg.sender == match_.player1 && match_.turn == 2) ||
                    (msg.sender == match_.player2 && match_.turn == 1),
                "It is not your turn."
            );
        } else {
            require(
                (msg.sender == match_.player1) ||
                    (msg.sender == match_.player2),
                "not playing"
            );
        }

        // Determine the opponent's address and team based on the current player's turn
        address currentPlayer;
        address opponent;
        uint256[3] memory currentPlayerTeam;
        uint256[3] memory opponentTeam;

        if (match_.turn % 2 == 1) {
            currentPlayer = match_.player1;
            currentPlayerTeam = match_.team1;
            opponent = match_.player2;
            opponentTeam = match_.team2;
        } else {
            currentPlayer = match_.player2;
            currentPlayerTeam = match_.team2;
            opponent = match_.player1;
            opponentTeam = match_.team1;
        }

        for (uint256 i = 0; i < 3; i++) {
            if (actions[i].fromShip == 0) continue;
            for (uint256 j = i + 1; j < 3; j++) {
                require(
                    actions[i].fromShip != actions[j].fromShip,
                    "Each ship can only be used once per turn."
                );
            }
            require(
                isInTeam(actions[i].fromShip, currentPlayerTeam),
                "The ship is not part of your team."
            );
            if (actions[i].action == 1) {
                attack(actions[i], matchId);
            } else if (actions[i].action == 2) {
                // special 1
                Ships.Ship memory fromShip = ships.getShip(actions[i].fromShip);
                if (fromShip.special1 == 1) {
                    heal(actions[i]);
                } else if (fromShip.special1 == 2) {
                    boostAttack(actions[i]);
                } else if (fromShip.special1 == 3) {
                    boostDefense(actions[i]);
                } else if (fromShip.special1 == 4) {
                    rechargeEnergy(actions[i]);
                } else if (fromShip.special1 == 5) {
                    weakenAttack(actions[i]);
                } else if (fromShip.special1 == 6) {
                    weakenDefense(actions[i]);
                } else if (fromShip.special1 == 7) {
                    multipleStrike(actions[i], matchId);
                } else if (fromShip.special1 == 8) {
                    doubleStrike(actions[i], matchId);
                } else {
                    revert("Invalid special 1");
                }
            } else if (actions[i].action == 3) {
                // special 2
                Ships.Ship memory fromShip = ships.getShip(actions[i].fromShip);
                if (fromShip.special2 == 1) {
                    heal(actions[i]);
                } else if (fromShip.special2 == 2) {
                    boostAttack(actions[i]);
                } else if (fromShip.special2 == 3) {
                    boostDefense(actions[i]);
                } else if (fromShip.special2 == 4) {
                    rechargeEnergy(actions[i]);
                } else if (fromShip.special2 == 5) {
                    weakenAttack(actions[i]);
                } else if (fromShip.special2 == 6) {
                    weakenDefense(actions[i]);
                } else if (fromShip.special2 == 7) {
                    multipleStrike(actions[i], matchId);
                } else if (fromShip.special2 == 8) {
                    doubleStrike(actions[i], matchId);
                } else {
                    revert("Invalid special 2");
                }
            } else if (actions[i].action == 4) {
                rest(actions[i]);
            } else {
                revert("Invalid action.");
            }
        }

        match_.lastMoveAt = uint32(block.timestamp);
        if (match_.turn == 1) {
            match_.turn = 2;
        } else {
            match_.turn = 1;
        }

        emit TurnTaken(matchId, msg.sender);
    }

    function endMatch(uint256 matchId) external {
        Match storage match_ = matches[matchId];

        uint256[3] memory team1 = match_.team1;
        uint256[3] memory team2 = match_.team2;

        require(checkTeamDead(team1) || checkTeamDead(team2), "Match not over");

        for (uint256 i = 0; i < match_.team1.length; i++) {
            ships.reviveShip(match_.team1[i]);
            ships.safeTransferFrom(
                address(this),
                match_.player1,
                match_.team1[i]
            );
        }
        for (uint256 i = 0; i < match_.team2.length; i++) {
            ships.reviveShip(match_.team2[i]);
            ships.safeTransferFrom(
                address(this),
                match_.player2,
                match_.team2[i]
            );
        }
        delete matches[matchId];
    }

    function attack(Action memory action, uint256 matchId) internal {
        Ships.Ship memory attacker = ships.getShip(action.fromShip);
        Ships.Ship memory defender = ships.getShip(action.toShip);

        uint256 baseDamage;
        if (attacker.attack > defender.defense) {
            baseDamage = attacker.attack - defender.defense;
        } else {
            baseDamage = 0;
        }

        uint256 randomFactor = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    block.number,
                    matchId
                )
            )
        ) % 21;

        uint256 damage;
        unchecked {
            damage = baseDamage + randomFactor - 10;
        }

        if (damage >= defender.health) {
            ships.killShip(action.toShip);
        } else if (damage > 0) {
            ships.setHealth(action.toShip, defender.health - damage);
        }
    }

    function rest(Action memory action) internal {
        Ships.Ship memory ship = ships.getShip(action.fromShip);
        ships.setHealth(action.fromShip, ship.energy + 30);
    }

    function checkTeamDead(
        uint256[3] memory team
    ) internal view returns (bool) {
        for (uint256 i = 0; i < team.length; i++) {
            if (ships.getShip(team[i]).alive) {
                return false;
            }
        }
        return true;
    }

    function isInTeam(
        uint256 shipId,
        uint256[3] memory team
    ) private pure returns (bool) {
        for (uint256 i = 0; i < team.length; i++) {
            if (team[i] == shipId) {
                return true;
            }
        }
        return false;
    }

    function heal(Action memory action) internal {
        Ships.Ship memory fromShip = ships.getShip(action.fromShip);
        require(fromShip.energy >= ENERGY_COST_HEAL, "Not enough energy");
        ships.setEnergy(action.fromShip, fromShip.energy - ENERGY_COST_HEAL);
        ships.setHealth(
            action.toShip,
            ships.getShip(action.toShip).health + 50
        );
    }

    function boostAttack(Action memory action) internal {
        Ships.Ship memory fromShip = ships.getShip(action.fromShip);
        require(
            fromShip.energy >= ENERGY_COST_BOOST_ATTACK,
            "Not enough energy"
        );
        ships.setEnergy(
            action.fromShip,
            fromShip.energy - ENERGY_COST_BOOST_ATTACK
        );
        ships.setAttack(
            action.toShip,
            ships.getShip(action.toShip).attack + 20
        );
    }

    function boostDefense(Action memory action) internal {
        Ships.Ship memory fromShip = ships.getShip(action.fromShip);
        require(
            fromShip.energy >= ENERGY_COST_BOOST_DEFENSE,
            "Not enough energy"
        );
        ships.setEnergy(
            action.fromShip,
            fromShip.energy - ENERGY_COST_BOOST_DEFENSE
        );
        ships.setDefense(
            action.toShip,
            ships.getShip(action.toShip).defense + 20
        );
    }

    function rechargeEnergy(Action memory action) internal {
        Ships.Ship memory fromShip = ships.getShip(action.fromShip);
        require(
            fromShip.energy >= ENERGY_COST_RECHARGE_ENERGY,
            "Not enough energy"
        );
        ships.setEnergy(
            action.fromShip,
            fromShip.energy - ENERGY_COST_RECHARGE_ENERGY
        );
        ships.setEnergy(
            action.toShip,
            ships.getShip(action.toShip).energy + 20
        );
    }

    function weakenAttack(Action memory action) internal {
        Ships.Ship memory fromShip = ships.getShip(action.fromShip);
        require(
            fromShip.energy >= ENERGY_COST_WEAKEN_ATTACK,
            "Not enough energy"
        );
        ships.setEnergy(
            action.fromShip,
            fromShip.energy - ENERGY_COST_WEAKEN_ATTACK
        );
        ships.setAttack(
            action.toShip,
            ships.getShip(action.toShip).attack >= 15
                ? ships.getShip(action.toShip).attack - 15
                : 0
        );
    }

    function weakenDefense(Action memory action) internal {
        Ships.Ship memory fromShip = ships.getShip(action.fromShip);
        require(
            fromShip.energy >= ENERGY_COST_WEAKEN_DEFENSE,
            "Not enough energy"
        );
        ships.setEnergy(
            action.fromShip,
            fromShip.energy - ENERGY_COST_WEAKEN_DEFENSE
        );
        ships.setDefense(
            action.toShip,
            ships.getShip(action.toShip).defense >= 15
                ? ships.getShip(action.toShip).defense - 15
                : 0
        );
    }

    function multipleStrike(Action memory action, uint256 matchId) internal {
        Ships.Ship memory fromShip = ships.getShip(action.fromShip);
        require(
            fromShip.energy >= ENERGY_COST_MULTIPLE_STRIKE,
            "Not enough energy"
        );
        ships.setEnergy(
            action.fromShip,
            fromShip.energy - ENERGY_COST_MULTIPLE_STRIKE
        );
        Match storage match_ = matches[matchId];
        uint256[3] memory opponentTeam;

        if (match_.turn % 2 == 1) {
            opponentTeam = match_.team2;
        } else {
            opponentTeam = match_.team1;
        }

        for (uint256 i = 0; i < opponentTeam.length; i++) {
            Action memory newAction = Action({
                fromShip: action.fromShip,
                toShip: opponentTeam[i],
                action: 1
            });
            attack(newAction, matchId);
        }
    }

    function doubleStrike(Action memory action, uint256 matchId) internal {
        Ships.Ship memory fromShip = ships.getShip(action.fromShip);
        require(
            fromShip.energy >= ENERGY_COST_DOUBLE_STRIKE,
            "Not enough energy"
        );
        ships.setEnergy(
            action.fromShip,
            fromShip.energy - ENERGY_COST_DOUBLE_STRIKE
        );
        attack(action, matchId);
        attack(action, matchId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function setShips(IShips _ships) external onlyOwner {
        ships = _ships;
    }

    function getMatch(uint256 matchId) external view returns (Match memory) {
        return matches[matchId];
    }
}
