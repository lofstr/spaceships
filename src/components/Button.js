import React from "react";

export default function Button(props) {
  return (
    <div onClick={props.onClick} style={styles}>
      <p style={text}> {props.text} </p>
    </div>
  );
}

const styles = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#F63D3D",
  borderRadius: "8px",
  margin: "10px",
  cursor: "pointer",
};

const text = {
  color: "white",
  fontSize: "24px",
  letterSpacing: "1px",
  padding: "10px 30px",
  cursor: "pointer",
};
