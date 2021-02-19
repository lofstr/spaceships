import React, { Component, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Button from "./Button";
import { getNumberOfLevels, initParkinglot, park, unRegisterPark } from "./fb";

export default function Demo(props) {
  const [regnr, setInputValue] = useState("");
  const [startDate, setStartDate] = useState(new Date());

  const setUp = () => {
    initParkinglot().then((r) => console.log(r));
  };

  const getLevels = () => {
    getNumberOfLevels().then((r) => console.log(r));
  };

  const parkCar = () => {
    if (regnr === "") console.log("No registration number was entered");
    else park(regnr, startDate).then((r) => console.log(r));
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
          <h3 style={{ marginBottom: "-10px" }}>
            Select date (for parking) and registration number
          </h3>
          <p>Car will always be unregistered at current date.</p>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="Pp"
          />

          <input
            value={regnr}
            style={{ marginTop: "10px", padding: "10px", fontSize: "18px" }}
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
