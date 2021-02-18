import React, { Component, useState } from "react";
import Button from "./Button";
import {
  getNumberOfLevels,
  initParkinglot,
  park,
  unRegisterPark,
} from "./Firebase/fb";

export default function Demo(props) {
  const [regnr, setInputValue] = useState("");

  const setUp = () => {
    initParkinglot().then((r) => console.log(r));
  };

  const getLevels = () => {
    getNumberOfLevels().then((r) => console.log(r));
  };

  const parkCar = () => {
    park(regnr).then((r) => console.log(r));
  };

  const unregister = () => {
    unRegisterPark(regnr).then((r) => console.log(r));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button onClick={setUp} text="Setup"></Button>
        <Button onClick={getLevels} text="Garage Floors"></Button>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3>Registreringsnummer</h3>
          <input
            value={regnr}
            style={{ padding: "10px", fontSize: "18px" }}
            onChange={(evt) => setInputValue(evt.target.value)}
          ></input>
          <div
            style={{ display: "flex", flexDirection: "row", marginTop: "20px" }}
          >
            <Button onClick={parkCar} text="Park"></Button>
            <Button onClick={unregister} text="Unregister"></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
