let firstPlayerNameInput = document.getElementById("firstPlayerName");
let secondPlayerNameInput = document.getElementById("secondPlayerName");
let cardFooter = document.getElementById("footer");
let playersNameForm = document.getElementById("playersNameForm");
let playButton = document.getElementById("playButton");
let replayButton = document.getElementById("replay");
const boardDiv = document.getElementById("game-board");

const player = (playerName, playerSign) => {
    let name = playerName;
    let sign = playerSign;

    return {
        name,
        sign
    };
}

firstPlayerNameInput.addEventListener("input", (event) => {
    playButton.disabled = !(event.target.value !== "" && secondPlayerNameInput.value !== "");
})

secondPlayerNameInput.addEventListener("input", (event) => {
    playButton.disabled = !(event.target.value !== "" && firstPlayerNameInput.value !== "");
})


playButton.addEventListener("click", () => {
    playersNameForm.hidden = true;
    screen = screenController();
    screen.updateScreen();
    boardDiv.addEventListener("click", screen.clickHandlerBoard);
})

replayButton.addEventListener("click", () => {
    location.reload();
})



const cell = () => {
    let content = undefined;

    const getContent = () => content;
    const isEmpty = () => !content;
    const addContent = (sign) => {
        if (!isEmpty()) return;

        content = sign;
    };

    return {
        getContent,
        addContent,
        isEmpty
    };
}

const gameBoard = (() => {
    const board = [
        [cell(), cell(), cell()],
        [cell(), cell(), cell()],
        [cell(), cell(), cell()]
    ];

    const checkInput = (input) => input && parseInt(input) >= 0 && parseInt(input) <= 2;

    const getCell = (row, column) => {
        if (!checkInput(row)) return;
        if (!checkInput(column)) return;

        return board[row][column];
    };
    const addSignToCell = (row, column, sign) => {
        if (!checkInput(row)) return;
        if (!checkInput(column)) return;

        let cell = board[row][column];
        if (!cell.isEmpty()) return;

        cell.addContent(sign);
    };

    const isFull = () => { return board.flat().filter((cell) => cell.isEmpty()).length === 0; };

    const diagonalsMatch = (sign) => {
        return [0, 1, 2].every(cell => board[cell][cell].getContent() === sign) ||
            [0, 1, 2].every(cell => board[cell][2 - cell].getContent() === sign);
    }
    const rowsMatch = (sign) => board.some(row => row.every(cell => cell.getContent() === sign));
    const columnsMatch = (sign) => [0, 1, 2].some(columnIndex => [0, 1, 2].every(rowIndex => board[rowIndex][columnIndex].getContent() === sign));
    const match = (sign) => diagonalsMatch(sign) || rowsMatch(sign) || columnsMatch(sign);

    return {
        board,
        getCell,
        addSignToCell,
        isFull,
        match
    };
})();

const gameController = (firstPlayer, secondPlayer) => {
    const players = [firstPlayer, secondPlayer];
    let activePlayer = players[0];
    let continueGame;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const playRound = (row, column) => {
        let cell = gameBoard.getCell(row, column);
        if (!cell.isEmpty()) return;

        gameBoard.addSignToCell(row, column, getActivePlayer().sign);

        if (gameBoard.match(getActivePlayer().sign) || gameBoard.isFull()) {
            continueGame = false;
        } else {
            switchPlayerTurn();
        }
    };

    const isGameOver = () => continueGame === false;

    return {
        isGameOver,
        getActivePlayer,
        playRound,
    };
};

const screenController = ()=> {
    const firstPlayer = player(firstPlayerNameInput.value, 'X');
    const secondPlayer = player(secondPlayerNameInput.value, 'O');
    const playerTurnDiv = document.querySelector("#turn");
    const boardDiv = document.querySelector("#game-board");
    let game = gameController(firstPlayer, secondPlayer);

    const updateScreen = () => {
        boardDiv.textContent = '';

        const board = gameBoard.board;
        const activePlayer = game.getActivePlayer();

        if (gameBoard.match(activePlayer.sign)) {
            playerTurnDiv.textContent = `The winner : ${activePlayer.name}  !`;
            cardFooter.hidden = false;
            replayButton.focus();
        } else if (gameBoard.isFull()) {
            playerTurnDiv.textContent = 'Draw : The board is full !';
            cardFooter.hidden = false;
            replayButton.focus();
        } else {
            playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;
        }

        board.forEach((row, rowIndex) => {
            const rowDiv = document.createElement("div")
            rowDiv.classList.add("board-row");
            boardDiv.appendChild(rowDiv);
            row.forEach((cell, columnIndex) => {
                const cellButtonDiv = document.createElement("div")
                cellButtonDiv.classList.add("btn-group");

                const cellButton = document.createElement("button");
                cellButton.classList.add("board-cell", "btn", "btn-lg");

                cellButton.dataset.row = `${rowIndex}`;
                cellButton.dataset.column = `${columnIndex}`;
                cellButton.textContent = cell.getContent();

                if (cell.isEmpty()) {
                    cellButton.classList.add("btn-outline-primary");
                } else {
                    cellButton.classList.add("btn-primary");
                    cellButton.disabled = true;
                }

                rowDiv.appendChild(cellButtonDiv);
                cellButtonDiv.appendChild(cellButton);
            });
        });
    };

    const clickHandlerBoard = (e)  => {
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;

        if (!selectedRow) return;
        if (!selectedColumn) return;

        if (!game.isGameOver()) game.playRound(selectedRow, selectedColumn);
        updateScreen();
    }

    return {
        updateScreen,
        clickHandlerBoard
    };
};
