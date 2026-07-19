const cell = () => {
    let content = undefined;

    const getContent = () => content;
    const addContent = (sign) => content = sign;
    const isEmpty = () => content === undefined;
    const display = () => { console.log(content) }

    return {
        getContent,
        addContent,
        isEmpty,
        display,
    };
}

const gameBoard = (() => {
    let firstRow = [cell(), cell(), cell()];
    let secondRow = [cell(), cell(), cell()];
    let thirdRow = [cell(), cell(), cell()];
    let board = [firstRow, secondRow, thirdRow];

    const getCell = (row, column) => board[row][column];
    const setCell = (row, column, sign) => board[row][column].addContent(sign);

    const isFull = () => { return board.flat().filter((cell) => cell.isEmpty()).length === 0; }

    const diagonalsMatch = (sign) => {
        return [0, 1, 2].every(cell => board[cell][cell].getContent() === sign) ||
            [0, 1, 2].every(cell => board[cell][2 - cell].getContent() === sign);
    }
    const rowsMatch = (sign) => {
        return board.some(row => row.every(cell => cell.getContent() === sign));
    }
    const columnsMatch = (sign) => {
        return [0, 1, 2].some(column => [0, 1, 2].every(row => board[row][column].getContent() === sign));
    }
    const match = (sign) => {
        return diagonalsMatch(sign) || rowsMatch(sign) || columnsMatch(sign);
    }

    const display = () => {
        board.forEach((row) => {
            console.log('__________________')
            row.forEach((cell) => {
                cell.display();
            })
        })
    }

    return {
        board,
        getCell,
        setCell,
        display,
        isFull,
        match
    };
})();

const gameController = ((firstPlayer = 'Player1', secondPlayer = 'Player2') => {
    const players = [{name: firstPlayer, sign: 'X'}, {name: secondPlayer, sign: 'O'}];
    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        gameBoard.display();
        console.log(`${getActivePlayer().name}'s turn.`);
        const row = prompt(`${getActivePlayer().sign} Row :`)
        const column = prompt(`${getActivePlayer().sign}' Column :`)
        playRound(parseInt(row), parseInt(column));
    };

    const playRound = (row, column) => {
        gameBoard.setCell(row, column, getActivePlayer().sign);

        if (gameBoard.match(getActivePlayer().sign)) {
            console.log(`${getActivePlayer().name} wins !!`);
        } else if (gameBoard.isFull()) {
            console.log("Draw : The board's full");
            gameBoard.display();
        } else {
            switchPlayerTurn();
            printNewRound();
        }
    };

    printNewRound();

    return {
        playRound,
    }
})();
