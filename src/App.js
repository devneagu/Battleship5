import { useReducer } from "react";
import "./styles.css";
import styled from "styled-components";

const RowItems = styled.div`
  padding: 0;
  margin: 0;
  line-height: 0;
`;
const BoxItem = styled.div`
  border: 1px solid black;
  width: 30px;
  height: 30px;
  display: inline-block;
  background: white;
  transition: 0.5s;
  &.userMove {
    background: gray;
  }
  &.userShip {
    background: orange;
  }
  &.computerShip {
    background: red;
  }
  &.computerMove {
    background: blue;
  }
  &.destroyed {
    background: black;
  }
`;

function fnReducer(state, action) {
  console.log("hi");
  switch (action.type) {
    case "selected":
      console.log(action);
      if (!state.hasStarted) {
        var userPlane = { i: action.i, j: action.j };
        var computerPlane = {
          i: parseInt(Math.random() * state.gridN),
          j: parseInt(Math.random() * state.gridN)
        };
        while (
          computerPlane.i === userPlane.i &&
          userPlane.j === computerPlane.j
        ) {
          computerPlane = {
            i: parseInt(Math.random() * state.gridN),
            j: parseInt(Math.random() * state.gridN)
          };
        }
        return {
          ...state,
          computerPlane,
          userPlane,
          hasStarted: true,
          move: 0,
          errorMessage: null
        };
      }
      if (
        action.i === state.computerPlane.i &&
        action.j === state.computerPlane.j
      ) {
        return {
          ...state,
          gameFinished: true,
          won: true,
          errorMessage: null
        };
      }
      if (state.gameFinished) {
        return {
          ...state,
          errorMessage: null
        };
      }

      var computerMove = {
        i: parseInt(Math.random() * state.gridN),
        j: parseInt(Math.random() * state.gridN)
      };
      while (
        (state.computerPlane.i === computerMove.i &&
          state.computerPlane.j === computerMove.j) ||
        state.moves.some(
          (el) => el.i === computerMove.i && el.j === computerMove.j
        ) ||
        (action.i === computerMove.i && action.j === computerMove.j)
      ) {
        computerMove = {
          i: parseInt(Math.random() * state.gridN),
          j: parseInt(Math.random() * state.gridN)
        };
      }
      if (state.moves.some((el) => el.i === action.i && el.j === action.j)) {
        console.log("Grid already bombed");
        return {
          ...state,
          errorMessage: "Grid already Bombed!"
        };
      }
      if (
        computerMove.i === state.userPlane.i &&
        computerMove.j === state.userPlane.j
      ) {
        return {
          ...state,
          gameFinished: true,
          won: false,
          errorMessage: false,
          move: state.move + 1,
          moves: [
            ...state.moves,
            { i: action.i, j: action.j, by: "user" },
            { i: computerMove.i, j: computerMove.j, by: "computer" }
          ]
        };
      }
      return {
        ...state,
        move: state.move + 1,
        moves: [
          ...state.moves,
          { i: action.i, j: action.j, by: "user" },
          { i: computerMove.i, j: computerMove.j, by: "computer" }
        ],
        errorMessage: null
      };
    case "restart":
      return {
        gridN: 5,
        hasStarted: false,
        gameFinished: false,
        move: null,
        moves: [],
        errorMessage: null,
        won: null
      };
    default:
      console.log("default");
      return state;
  }
}
export default function App() {
  const [game, dispatch] = useReducer(fnReducer, {
    gridN: 5,
    hasStarted: false,
    gameFinished: false,
    move: null,
    moves: [],
    errorMessage: null,
    won: null
  });
  console.log(game);

  return (
    <div>
      {!game.hasStarted && !game.gameFinished && (
        <p>Select your battle position</p>
      )}
      {!game.gameFinished && game.move != null && (
        <p>Destroy your opponent !</p>
      )}
      {[...Array(game.gridN).keys()].map((i, index) => (
        <RowItems key={Math.random() * 100000000}>
          {[...Array(game.gridN).keys()].map((j, index) => (
            <BoxItem
              key={Math.random() * 100000000}
              className={`
                  ${
                    game.moves?.some(
                      (el) => el.i === i && el.j === j && el.by === "computer"
                    )
                      ? "computerMove"
                      : ""
                  }    
                  ${
                    game.userPlane?.i === i && game.userPlane?.j === j
                      ? "userShip"
                      : ""
                  }
                  ${
                    game.gameFinished &&
                    game.computerPlane?.i === i &&
                    game.computerPlane?.j === j
                      ? "computerShip"
                      : ""
                  }
                  
                  ${
                    game.moves?.some(
                      (el) => el.i === i && el.j === j && el.by === "user"
                    )
                      ? "userMove"
                      : ""
                  }
                  ${
                    game.gameFinished &&
                    game.won === false &&
                    i === game.userPlane.i &&
                    j === game.userPlane.j
                      ? "destroyed"
                      : ""
                  }
                  }`}
              onClick={() => dispatch({ type: "selected", i, j })}
            />
          ))}
        </RowItems>
      ))}
      {game.gameFinished && (
        <>
          {game.won && <p>You've won !</p>}
          {!game.won && <p>Unfortunately, you've lost...</p>}
          <p>
            Number of moves :{" "}
            <span style={{ color: "red" }}>{game.moves.length / 2 + 1}</span>
          </p>
          <button onClick={() => dispatch({ type: "restart" })}>
            Play Again!
          </button>
        </>
      )}
      {game.errorMessage && <p>{game.errorMessage}</p>}
    </div>
  );
}
