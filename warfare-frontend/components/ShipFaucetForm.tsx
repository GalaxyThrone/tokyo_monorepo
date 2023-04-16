// ShipFaucetForm.tsx
import React, { useState } from "react";
import { Ship } from "../lib/types/types";

interface ShipFaucetFormProps {
  onMint: (ships: Ship[]) => void;
}

const emptyShip = {
  name: "",
  attack: 0,
  defense: 0,
  health: 0,
  energy: 0,
  special1: 0,
  special2: 0,
  alive: false,
};

export const ShipFaucetForm: React.FC<ShipFaucetFormProps> = ({ onMint }) => {
  const [ships, setShips] = useState<Ship[]>([
    {
      name: "ship1",
      attack: 10,
      defense: 5,
      health: 100,
      energy: 20,
      special1: 1,
      special2: 2,
      alive: true,
    },
    {
      name: "ship2",
      attack: 8,
      defense: 7,
      health: 110,
      energy: 18,
      special1: 3,
      special2: 4,
      alive: true,
    },
    {
      name: "ship3",
      attack: 12,
      defense: 4,
      health: 90,
      energy: 22,
      special1: 5,
      special2: 6,
      alive: true,
    },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof Ship
  ) => {
    const newShips = [...ships];
    newShips[index] = { ...newShips[index], [field]: e.target.value };
    setShips(newShips);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMint(ships as Ship[]);
  };

  const addShip = () => {
    setShips([...ships, emptyShip]);
  };

  const handleRemoveShip = (index: number) => {
    setShips(ships.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit}>
      {ships.map((ship, index) => (
        <div key={index}>
          <h3>Ship {index + 1}</h3>
          {Object.keys(ship).map((field) => (
            <div key={field}>
              <label>
                {field}:
                <input
                  type="text"
                  value={ship[field] || ""}
                  onChange={(e) => handleChange(e, index, field as keyof Ship)}
                />
              </label>
            </div>
          ))}
          <button type="button" onClick={() => handleRemoveShip(index)}>
            Remove Ship
          </button>
        </div>
      ))}
      <button type="button" onClick={addShip}>
        Add Ship
      </button>
      <button type="submit">Mint Ships</button>
    </form>
  );
};
