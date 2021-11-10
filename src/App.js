import React, { useEffect, useReducer } from "react";
import "./styles.css";
import styled from "styled-components";
import { useTable } from "react-table";

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;
function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

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

function getDuration(dateFuture, dateNow) {
  var seconds = Math.floor((dateFuture - dateNow) / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);

  hours = hours - days * 24;
  minutes = minutes - days * 24 * 60 - hours * 60;
  seconds = seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return minutes + ":" + seconds;
}

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
          errorMessage: null,
          startGameDate: new Date()
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
          errorMessage: null,
          history: [
            ...state.history,
            {
              startGameDate: state.startGameDate,
              endGameDate: new Date(),
              result: "Won",
              moves: state.moves.length / 2 + 1,
              duration: getDuration(new Date(), state.startGameDate)
            }
          ]
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
          ],
          history: [
            ...state.history,
            {
              startGameDate: state.startGameDate,
              endGameDate: new Date(),
              result: "Lost",
              moves: state.moves.length / 2,
              duration: getDuration(new Date(), state.startGameDate)
            }
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
        won: null,
        startGameDate: null,
        history: [...state.history]
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
    won: null,
    history: JSON.parse(localStorage.getItem("battleplanes5")) || [],
    startGameDate: null
  });
  console.log(game);
  useEffect(() => {
    localStorage.setItem("battleplanes5", JSON.stringify(game.history));
  }, [game.history.length]);

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
            <span style={{ color: "red" }}>
              {game.history[game.history.length - 1].moves}
            </span>
          </p>
          <button onClick={() => dispatch({ type: "restart" })}>
            Play Again!
          </button>
        </>
      )}
      {game.errorMessage && <p>{game.errorMessage}</p>}
      {ReactTable(game.history)}
    </div>
  );
}

function ReactTable(data) {
  const columns = [
    {
      Header: "Score table",
      columns: [
        {
          Header: "Date",
          accessor: "startGameDate"
        },
        {
          Header: "Result",
          accessor: "result"
        },
        {
          Header: "Moves",
          accessor: "moves"
        },
        {
          Header: "Duration",
          accessor: "duration"
        }
      ]
    }
  ];
  if (data.length > 0) {
    console.log("DATA:");
    console.log(data);
    data = data.map((el) => {
      return {
        ...el,
        startGameDate: new Date(el.startGameDate).toLocaleDateString()
      };
    });
    data.sort(function (a, b) {
      return b.moves - a.moves;
    });
  }
  return (
    <Styles>
      <Table columns={columns} data={data} />
    </Styles>
  );
}
