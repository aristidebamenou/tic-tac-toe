class Player {

    #name;
    #sign;

    constructor(name, sign) {
        this.#name = name;
        this.#sign = sign;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = value;
    }

    get sign() {
        return this.#sign;
    }

    set sign(value) {
        this.#sign = value;
    }
}

class Cell {

    #content;

    get content() {
        return this.#content;
    }

    set content(value) {
        if (!this.isEmpty()) {
            throw new Error("Cell is not empty");
        }

        this.#content = value;
    }

    isEmpty = () => !this.content;
}

class GameBoard {

    #board = [
        [new Cell(), new Cell(), new Cell()],
        [new Cell(), new Cell(), new Cell()],
        [new Cell(), new Cell(), new Cell()]
    ];

    get board() {
        return this.#board;
    }

    checkInput = (input) => input && parseInt(input) >= 0 && parseInt(input) <= 2;

    getCell = (row, column) => {
        if (!this.checkInput(row)) {
            throw new Error("Invalid row index");
        }

        if (!this.checkInput(column)) {
            throw new Error("Invalid column index");
        }

        return this.board[row][column];
    };

    addSignToCell = (row, column, sign) => {
        if (!this.checkInput(row)) {
            throw new Error("Invalid row index");
        }

        if (!this.checkInput(column)) {
            throw new Error("Invalid column index");
        }

        let cell = this.board[row][column];
        if (!cell.isEmpty()) {
            throw new Error(`Cell[${row}][${column}] is not empty`);
        }

        cell.content = sign;
    };

    isFull = () => { return this.board.flat().filter((cell) => cell.isEmpty()).length === 0; };

    diagonalsMatch = (sign) => {
        return [0, 1, 2].every(cell => this.board[cell][cell].content === sign) ||
            [0, 1, 2].every(cell => this.board[cell][2 - cell].content === sign);
    }

    rowsMatch = (sign) => this.board.some(row => row.every(cell => cell.content === sign));

    columnsMatch = (sign) => [0, 1, 2].some(columnIndex => [0, 1, 2].every(rowIndex => this.board[rowIndex][columnIndex].content === sign));

    match = (sign) => this.diagonalsMatch(sign) || this.rowsMatch(sign) || this.columnsMatch(sign);
}

class GameController {

    #firstPlayer;
    #secondPlayer;
    #players;
    #activePlayer;
    #continueGame;
    #gameBoard;

    constructor(firstPlayer, secondPlayer, gameBoard) {
        if (!firstPlayer instanceof Player || !secondPlayer instanceof Player) {
            throw new Error("Invalid player");
        }

        if (!gameBoard instanceof GameBoard) {
            throw new Error("Invalid gameBoard");
        }

        this.#firstPlayer = firstPlayer;
        this.#secondPlayer = secondPlayer;
        this.#players = [firstPlayer, secondPlayer];
        this.#activePlayer = this.#players[0]
        this.#gameBoard = gameBoard;
    }

    get players() {
        return this.#players;
    }

    get activePlayer() {
        return this.#activePlayer;
    }

    get continueGame() {
        return this.#continueGame;
    }

    set continueGame(value) {
        if (value !== true && value !== false) {
            throw new Error("Invalid continueGame value");
        }
        this.#continueGame = value;
    }

    get gameBoard() {
        return this.#gameBoard;
    }

    switchPlayerTurn = () => {
        this.#activePlayer = this.activePlayer === this.players[0] ? this.players[1] : this.players[0];
    };

    playRound = (row, column) => {
        let cell = this.gameBoard.getCell(row, column);
        if (!cell.isEmpty()) {
            throw new Error(`Cell [${row}][${column}] is not empty`);
        }

        this.gameBoard.addSignToCell(row, column, this.activePlayer.sign);

        if (this.gameBoard.match(this.activePlayer.sign) || this.gameBoard.isFull()) {
            this.continueGame = false;
        } else {
            this.switchPlayerTurn();
        }
    };

    isGameOver = () => this.continueGame === false;
}

class ScreenController {

    #firstPlayer;
    #secondPlayer;
    #gameBoard;
    #gameController;
    #playerTurnDiv;
    #boardDiv;
    #cardFooter;

    constructor() {
        this.#firstPlayer = new Player(firstPlayerNameInput.value, 'X');
        this.#secondPlayer = new Player(secondPlayerNameInput.value, 'O');
        this.#gameBoard = new GameBoard();
        this.#gameController = new GameController(this.#firstPlayer, this.#secondPlayer, this.#gameBoard);
        this.#playerTurnDiv = document.querySelector("#turn");
        this.#boardDiv = document.querySelector("#game-board");
        this.#cardFooter = document.getElementById("footer");
    }

    get gameBoard() {
        return this.#gameBoard;
    }

    get gameController() {
        return this.#gameController;
    }

    get playerTurnDiv() {
        return this.#playerTurnDiv;
    }

    get cardFooter() {
        return this.#cardFooter;
    }

    updateScreen = () => {
        const board = this.gameBoard.board;
        const activePlayer = this.gameController.activePlayer;

        boardDiv.textContent = '';

        if (this.gameBoard.match(activePlayer.sign)) {
            this.playerTurnDiv.textContent = `The winner : ${activePlayer.name}  !`;
            this.cardFooter.hidden = false;
            replayButton.focus();
        } else if (this.gameBoard.isFull()) {
            this.playerTurnDiv.textContent = 'Draw : The board is full !';
            this.cardFooter.hidden = false;
            replayButton.focus();
        } else {
            this.playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;
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
                cellButton.textContent = cell.content;

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

    clickHandlerBoard = (e) => {
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;


        if (!selectedRow) {
            throw new Error("Invalid row index");
        }

        if (!selectedColumn) {
            throw new Error("Invalid column index");
        }

        if (!this.gameController.isGameOver()) this.gameController.playRound(selectedRow, selectedColumn);
        this.updateScreen();
    }
}

let firstPlayerNameInput = document.getElementById("firstPlayerName");
let secondPlayerNameInput = document.getElementById("secondPlayerName");
let playersNameForm = document.getElementById("playersNameForm");
let playButton = document.getElementById("playButton");
let replayButton = document.getElementById("replay");
const boardDiv = document.getElementById("game-board");

firstPlayerNameInput.addEventListener("input", (event) => {
    playButton.disabled = !(event.target.value !== "" && secondPlayerNameInput.value !== "");
})

secondPlayerNameInput.addEventListener("input", (event) => {
    playButton.disabled = !(event.target.value !== "" && firstPlayerNameInput.value !== "");
})


playButton.addEventListener("click", () => {
    playersNameForm.hidden = true;
    let screen = new ScreenController();
    screen.updateScreen();
    boardDiv.addEventListener("click", screen.clickHandlerBoard);
})

replayButton.addEventListener("click", () => {
    location.reload();
})
