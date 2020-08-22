(function ($) {
    //This part of the code will provide the necessary logic to select a div when mousedowning it

    class Cell {
        constructor(row, column) {
            this.row = row;
            this.column = column;
        }
    }

    class ChessPiece {

        constructor(x, y, color, $pieceDiv) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.$pieceDiv = $pieceDiv;
            this.$pieceDiv.draggable({revert: true, revertDuration: 0});
        }

        setPozition(x, y) {
            this.x = x;
            this.y = y;
        }

        excludeIllegalMoves(game, positions) {
            const _x = this.x;
            const _y = this.y;
            let illegalMoves = game.illegalMoves.filter(move => move.from.row === _x && move.from.column === _y);
            //now we have all illegal moves for this piece
            let illegalFinalPositions = illegalMoves.map(move => move.to);
            //now we have all illegal final positions for this piece

            illegalFinalPositions.forEach(illegalFinalPoz => {
                for (let i = 0; i < positions.length; i++) {
                    if (positions[i].row === illegalFinalPoz.row && positions[i].column === illegalFinalPoz.column) {
                        positions.splice(i, 1);
                        i--;
                    }
                }
            })
        }
    }

    class Pawn extends ChessPiece {
        //Get potential positions to move to
        pozICanMoveTo(game) {
            let positions = [];
            let colorFactor = this.color === "black" ? 1 : -1;
            let firstMove = 0;
            if (colorFactor === 1 && this.x === 1)
                firstMove = 1;
            if (colorFactor === -1 && this.x === 6)
                firstMove = 1;
            if (this.x < 7 && this.x > 0) {
                let finalX = this.x + colorFactor;
                if (game.isCellEmpty(finalX, this.y)) {
                    positions.push({ row: finalX, column: this.y });
                }
                if (firstMove === 1) {
                    if (game.isCellEmpty(finalX + colorFactor, this.y)) {
                        positions.push({ row: finalX + colorFactor, column: this.y });
                    }
                }
                if (this.y < 7)
                    if (!game.isCellEmpty(finalX, this.y + 1) && game.board[finalX][this.y + 1].color != this.color) {
                        positions.push({ row: finalX, column: this.y + 1 });
                    }
                if (this.y > 0) {
                    if (!game.isCellEmpty(finalX, this.y - 1) && game.board[finalX][this.y - 1].color != this.color) {
                        positions.push({ row: finalX, column: this.y - 1 });
                    }
                }
            }
            super.excludeIllegalMoves(game, positions);
            return positions; //returns the array of (x,y) pairs = possible divs to move to
        }

        canMoveTo(x, y, game) {
            let canMove = false;
            let possibleMovementPoz = this.pozICanMoveTo(game);
            possibleMovementPoz.forEach(poz => {
                if (poz.row == x && poz.column == y)
                    canMove = true;
            });
            return canMove;
        }

        moveTo(x, y) {
            this.setPozition(x, y);
            if (this.x === 0 || this.x === 7)
                game.promotePawn(this);
        }
    }

    class Rook extends ChessPiece {
        //Get potential positions to move to
        pozICanMoveTo(game) {
            let positions = [];
            //let offset = 1;
            let offsetX = [1, 0, -1, 0];
            let offsetY = [0, 1, 0, -1];
            for (let i = 0; i < 4; i++) {
                let finalX = this.x + offsetX[i];
                let finalY = this.y + offsetY[i];
                while (finalX < 8 && finalX >= 0 && finalY < 8 && finalY >= 0) {
                    if (game.isCellEmpty(finalX, finalY)) {
                        positions.push({ row: finalX, column: finalY });
                    } else {
                        if (game.board[finalX][finalY].color != this.color) {
                            positions.push({ row: finalX, column: finalY });
                        }
                        break;
                    }
                    finalX += offsetX[i];
                    finalY += offsetY[i];
                }
            }
            super.excludeIllegalMoves(game, positions);
            return positions; //returns the array of (x,y) pairs = possible divs to move to
        }

        canMoveTo(x, y, game) {
            let canMove = false;
            let possibleMovementPoz = this.pozICanMoveTo(game);
            possibleMovementPoz.forEach(poz => {
                if (poz.row == x && poz.column == y)
                    canMove = true;
            });
            return canMove;
        }

        moveTo(x, y) {
            this.setPozition(x, y);
        }

    }

    class Knight extends ChessPiece {

        pozICanMoveTo(game) {
            let positions = [];
            let directionsX = [2, 2, -2, -2, 1, -1, 1, -1];
            let directionsY = [1, -1, 1, -1, 2, 2, -2, -2];
            for (let i = 0; i < directionsX.length; i++) {
                let finalX = this.x + directionsX[i];
                let finalY = this.y + directionsY[i];
                //make sure we don't test positions outside the board
                if (finalX < 8 && finalX >= 0 && finalY >= 0 && finalY < 8) {
                    if (game.isCellEmpty(finalX, finalY)) {
                        positions.push({ row: finalX, column: finalY });
                    } else {
                        if (game.getBoardPieceAt(finalX, finalY).color != this.color) {
                            positions.push({ row: finalX, column: finalY });
                        }
                    }
                }
            }
            super.excludeIllegalMoves(game, positions);
            return positions;
        }

        canMoveTo(x, y, game) {
            let canMove = false;
            let possibleMovementPoz = this.pozICanMoveTo(game);
            possibleMovementPoz.forEach(poz => {
                if (poz.row == x && poz.column == y)
                    canMove = true;
            });
            return canMove;
        }

        moveTo(x, y) {
            this.setPozition(x, y);
        }
    }

    class Bishop extends ChessPiece {

        pozICanMoveTo(game) {
            let positions = [];
            //let offset = 1;
            let offsetX = [1, 1, -1, -1];
            let offsetY = [1, -1, 1, -1];
            for (let i = 0; i < 4; i++) {
                let finalX = this.x + offsetX[i];
                let finalY = this.y + offsetY[i];
                while (finalX < 8 && finalX >= 0 && finalY < 8 && finalY >= 0) {
                    if (game.isCellEmpty(finalX, finalY)) {
                        positions.push({ row: finalX, column: finalY });
                    } else {
                        if (game.board[finalX][finalY].color != this.color) {
                            positions.push({ row: finalX, column: finalY });
                        }
                        break;
                    }
                    finalX += offsetX[i];
                    finalY += offsetY[i];
                }
            }
            super.excludeIllegalMoves(game, positions);
            return positions; //returns the array of (x,y) pairs = possible divs to move to
        }

        canMoveTo(x, y, game) {
            let canMove = false;
            let possibleMovementPoz = this.pozICanMoveTo(game);
            possibleMovementPoz.forEach(poz => {
                if (poz.row == x && poz.column == y)
                    canMove = true;
            });
            return canMove;
        }

        moveTo(x, y) {
            this.setPozition(x, y);
        }
    }

    class Queen extends ChessPiece {

        pozICanMoveTo(game) {
            let positions = [];
            //let offset = 1;
            let offsetX = [1, 1, -1, -1, 1, 0, -1, 0];
            let offsetY = [1, -1, 1, -1, 0, 1, 0, -1];
            for (let i = 0; i < 9; i++) {
                let finalX = this.x + offsetX[i];
                let finalY = this.y + offsetY[i];
                while (finalX < 8 && finalX >= 0 && finalY < 8 && finalY >= 0) {
                    if (game.isCellEmpty(finalX, finalY)) {
                        positions.push({ row: finalX, column: finalY });
                    } else {
                        if (game.board[finalX][finalY].color != this.color) {
                            positions.push({ row: finalX, column: finalY });
                        }
                        break;
                    }
                    finalX += offsetX[i];
                    finalY += offsetY[i];
                }
            }
            super.excludeIllegalMoves(game, positions);
            return positions; //returns the array of (x,y) pairs = possible divs to move to
        }

        canMoveTo(x, y, game) {
            let canMove = false;
            let possibleMovementPoz = this.pozICanMoveTo(game);
            possibleMovementPoz.forEach(poz => {
                if (poz.row == x && poz.column == y)
                    canMove = true;
            });
            return canMove;
        }

        moveTo(x, y) {
            this.setPozition(x, y);
        }
    }

    class King extends ChessPiece {

        pozICanMoveTo(game) {
            let positions = [];
            //let offset = 1;
            let offsetX = [1, 1, -1, -1, 1, 0, -1, 0];
            let offsetY = [1, -1, 1, -1, 0, 1, 0, -1];
            for (let i = 0; i < 9; i++) {
                let finalX = this.x + offsetX[i];
                let finalY = this.y + offsetY[i];
                if (finalX < 8 && finalX >= 0 && finalY < 8 && finalY >= 0) {
                    if (game.isCellEmpty(finalX, finalY)) {
                        positions.push({ row: finalX, column: finalY });
                    } else {
                        if (game.board[finalX][finalY].color != this.color) {
                            positions.push({ row: finalX, column: finalY });
                        }
                    }
                }
            }
            super.excludeIllegalMoves(game, positions);
            return positions; //returns the array of (x,y) pairs = possible divs to move to
        }

        canMoveTo(x, y, game) {
            let canMove = false;
            let possibleMovementPoz = this.pozICanMoveTo(game);
            possibleMovementPoz.forEach(poz => {
                if (poz.row == x && poz.column == y)
                    canMove = true;
            });
            return canMove;
        }

        moveTo(x, y) {
            this.setPozition(x, y);
        }

    }


    //API link https://chess.thrive-dev.bitstoneint.com/wp-json/chess-api/game

    class ChessBoard {
        
        onlineId = null;
        multiplayer = false;
        blocked = false;
        lastSentMove = null;
        lastReceivedMove = null;

        team = null; //white team
        turn = "white";
        selectedCell = new Object();
        potentialMovements = [];

        illegalMoves = [];

        /**
         * A stack with all the moves as a pair of <(initialX, initialY), (finalX, finalY)>
         */
        moveHistory = [];

        constructor() {
            this.board = [];
            for (let i = 0; i < 8; i++) {
                this.board[i] = [];
            }
            //this.chessBoardCollection = this.createBoardDiv();
            //this.boardDivs = this.chessBoardCollection.children;
            this.createBoardDiv();
            this.boardDivs = $(".cell");
        }

        selectCell(currentX, currentY) {
            if(this.multiplayer === false || (this.multiplayer === true && this.team === this.turn)){
                if (!this.hasSelectedCell()) {
                    if (!this.isCellEmpty(currentX, currentY))
                        if (this.getBoardPieceAt(currentX, currentY).color === this.turn) {
                            this.setSelectedCell(currentX, currentY);
                            this.markPotentialCells();
                        }
                } else {
                    this.movePieceTo(this.getSelectedPiece(), currentX, currentY);
                }   
            }
        }

        createBoardDiv() {
            /*let chessBoardDiv = document.createElement("div");
            chessBoardDiv.classList.add("chess-board");*/

            $("body").append($("<div/>").addClass("chess-board"));
            for (let i = 0; i < 8; i++)
                for (let j = 0; j < 8; j++) {
                    let $newDiv = $("<div/>").attr('data-row', i).attr('data-column', j).addClass(((i + j) % 2 == 0 ? "white-cell" : "black-cell") + " cell");
                    $(".chess-board").append($newDiv);
                    $newDiv.mousedown(() => {
                        this.selectCell(i, j);
                    });
                    $newDiv.droppable({drop: ()=>{
                        this.movePieceTo(this.getSelectedPiece(), i, j);
                    }});
                    $newDiv.droppable("disable");
                    /*let newDiv = document.createElement("div");if( (i+j) % 2 == 0)
                        newDiv.classList.add("white-cell");
                    else newDiv.classList.add("black-cell");
                    
                    newDiv.classList.add("cell");
                    newDiv.classList.add("row-" + i);
                    newDiv.classList.add("column-" + j); 

                    newDiv.addEventListener("mousedown", ()=>{
                        this.selectCell(i, j);
                    }, false);
                    chessBoardDiv.appendChild(newDiv);*/
                }
        }

        createAndPlacePawns(color) {
            /*let pawn = document.createElement("div");
            pawn.classList.add("chess-piece");
            pawn.classList.add("pawn");
            pawn.classList.add(color);

            let text = color === "white"? "\u2659" : "\u265F";
            pawn.textContent = text;*/

           
            for (let i = 0; i < 8; i++) {
                if (color === "white") {
                    this.board[6][i] = this.createPiece("pawn", "white", 6, i);
                } else {
                    this.board[1][i] = this.createPiece("pawn", "black", 1, i);
                }
            }
        }

        createAndPlaceRooks(color) {

            /*let rook = document.createElement("div");
            rook.classList.add("chess-piece");
            rook.classList.add("rook");
            rook.classList.add(color);
            
            let text = color === "white"? "\u2656" : "\u265C";
            rook.textContent = text;*/

            if (color === "white") {
                this.board[7][0] = this.createPiece("rook", "white", 7, 0);
                this.board[7][7] = this.createPiece("rook", "white", 7, 7);
            }
            else {
                this.board[0][0] = this.createPiece("rook", "black", 0, 0);
                this.board[0][7] = this.createPiece("rook", "black", 0, 7);
            }
        }

        createAndPlaceKnights(color) {
            /*let knight = document.createElement("div");
            knight.classList.add("chess-piece");
            knight.classList.add("knight");
            knight.classList.add(color);
            
            let text = color === "white"? "\u2658" : "\u265E";
            knight.textContent = text;*/

            if (color === "white") {
                this.board[7][1] = this.createPiece("knight", "white", 7, 1);
                this.board[7][6] = this.createPiece("knight", "white", 7, 6);
            }
            else {
                this.board[0][1] = this.createPiece("knight", "black", 0, 1);
                this.board[0][6] = this.createPiece("knight", "black", 0, 6);
            }
        }

        createAndPlaceBishops(color) {

            /*let bishop = document.createElement("div");
            bishop.classList.add("chess-piece");
            bishop.classList.add("bishop");
            bishop.classList.add(color);
            let text = color === "white"? "\u2657" : "\u265D";
            bishop.textContent = text;*/

            if (color === "white") {
                this.board[7][2] = this.createPiece("bishop", "white", 7, 2);
                this.board[7][5] = this.createPiece("bishop", "white", 7, 5);
            }
            else {
                this.board[0][2] = this.createPiece("bishop", "black", 0, 2);
                this.board[0][5] = this.createPiece("bishop", "black", 0, 5);
            }

        }

        createAndPlaceQueens(color) {
            /*let queen = document.createElement("div");
            queen.classList.add("chess-piece");
            queen.classList.add("queen");
            queen.classList.add(color);

            let text = color === "white"? "\u2655" : "\u265B";
            queen.textContent = text;*/


            if (color == "white") {
                this.board[7][3] = this.createPiece("queen", "white", 7, 3);
            }
            else {
                this.board[0][3] = this.createPiece("queen", "black", 0, 3);
            }
        }

        createAndPlaceKings(color) {    
            /*let king = document.createElement("div");
            king.classList.add("chess-piece");
            king.classList.add("king");
            king.classList.add(color);

            let text = color === "white"? "\u2654" : "\u265A";
            king.textContent = text;*/

            if (color == "white") {
                this.board[7][4] = this.createPiece("king", "white", 7, 4);
            }
            else {
                this.board[0][4] = this.createPiece("king", "black", 0, 4);
            }
        }

        /**
         * 
         * @param {String} pieceType 
         * @param {String} color 
         * @param {int} row 
         * @param {int} column 
         */
        createPiece(pieceType, color, row, column){
            let $piece = null;
            let piece = null;
            switch (pieceType.toLowerCase()) {
                case "pawn":
                    $piece = $("<div/>").addClass("chess-piece" + " pawn " + color).html(color === "white" ? "\u2659" : "\u265F");
                    piece = new Pawn(row, column, color, $piece);
                    break;
                case "rook":
                    $piece = $("<div/>").addClass("chess-piece" + " rook " + color).html(color === "white" ? "\u2656" : "\u265C");
                    piece = new Rook(row, column, color, $piece);
                    break;
                case "knight":
                    $piece = $("<div/>").addClass("chess-piece" + " knight " + color).html(color === "white" ? "\u2658" : "\u265E");
                    piece = new Knight(row, column, color, $piece);
                    break;
                case "bishop":
                    $piece = $("<div/>").addClass("chess-piece" + " bishop " + color).html(color === "white" ? "\u2657" : "\u265D");
                    piece = new Bishop(row, column, color, $piece);
                    break;
                case "queen":
                    $piece = $("<div/>").addClass("chess-piece" + " queen " + color).html(color === "white" ? "\u2655" : "\u265B");
                    piece = new Queen(row, column, color, $piece);
                    break;
                case "king":
                    $piece = $("<div/>").addClass("chess-piece" + " king " + color).html(color === "white" ? "\u2654" : "\u265A");
                    piece = new King(row, column, color, $piece);
                    break;
            }
            return piece;
        }

        initializeBoard() {
            for (let i = 0; i < 8; i++)
                for (let j = 0; j < 8; j++)
                    this.board[i][j] = null;
            this.createAndPlacePawns("white");
            this.createAndPlacePawns("black");

            this.createAndPlaceRooks("white");
            this.createAndPlaceRooks("black");

            this.createAndPlaceKnights("white");
            this.createAndPlaceKnights("black");

            this.createAndPlaceBishops("white");
            this.createAndPlaceBishops("black");

            this.createAndPlaceQueens("white");
            this.createAndPlaceQueens("black");

            this.createAndPlaceKings("white");
            this.createAndPlaceKings("black");
            this.redrawBoard();
            //now we have the this.board with all the pieces and we need to 
            //allPiecesInPlay.forEach(element => boardDivs[element.x * 8 + element.y].appendChild(element.$pieceDiv));
        }

        redrawBoard() {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.getDivAt(i, j).children().length) {
                        this.getDivAt(i, j).children().remove();
                    }
                }
            }
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.board[i][j] != null) {
                        let currentPiece = this.getBoardPieceAt(i, j);
                        if (this.getDivAt(i, j).children().length)
                            this.getDivAt(currentPiece.x, currentPiece.y).children().remove();
                        this.getDivAt(currentPiece.x, currentPiece.y).append(this.board[i][j].$pieceDiv);
                        this.board[i][j].$pieceDiv.draggable({revert: true, revertDuration: 0});
                    }
                }
            }
        }

        /**
         * 
         * @param {ChessPiece} piece 
         * @param {int} toX 
         * @param {int} toY 
         */
        movePieceTo(piece, toX, toY) {
            if (piece.canMoveTo(toX, toY, this)) {
                this.memorizeMove(piece.x, piece.y, toX, toY);
                this.displayLastMove();
                
                this.setBoardPieceAt(toX, toY, piece);
                this.removePieceAt(piece.x, piece.y);
                if(this.multiplayer){
                    if(this.turn === this.team){
                        this.sendMoveToTheAPI(piece.x, piece.y, toX, toY);
                        this.lastSentMove = {from:{ x: piece.x, y: piece.y}, to:{x: toX, y: toY}}
                    }
                }
                this.changeTurn();
                piece.moveTo(toX, toY);

                //this.changeTurn();
                this.findIllegalMoves();
                if (this.isCheckmate()) {
                    alert("CHECKMATE " + this.turn + " lost");
                    this.restart();
                }

            }
            this.unmarkPotentialCells();
            this.deselectCell();
            this.redrawBoard();
        }


        removePieceAt(row, column) {
            this.board[row][column] = null;
        }

        deselectCell() {
            this.selectedCell = new Object();
        }

        setSelectedCell(row, column) {
            this.selectedCell.row = row;
            this.selectedCell.column = column;
        }

        setBoardPieceAt(row, column, piece) {
            this.board[row][column] = piece;
        }

        getBoardPieceAt(row, column) {
            return this.board[row][column];
        }

        getSelectedPiece() {
            return this.getBoardPieceAt(this.selectedCell.row, this.selectedCell.column);
        }

        getSelectedDiv() {
            return this.boardDivs.filter((index, element) => parseInt(element.dataset.row) === this.selectedCell.row && parseInt(element.dataset.column) === this.selectedCell.column);
        }

        getDivAt(row, column) {
            return this.boardDivs.filter((index, element) => parseInt(element.dataset.row) === row && parseInt(element.dataset.column) === column);
        }

        /**
         * Change background collor of all cells the selected piece can move to
         */
        markPotentialCells() {
            this.getSelectedDiv().addClass("selected-cell");
            this.potentialMovements = this.getSelectedPiece().pozICanMoveTo(this);
            this.potentialMovements.forEach(poz => {
                this.getDivAt(poz.row, poz.column).addClass("potential-movement");
                this.getDivAt(poz.row, poz.column).droppable("enable");
            });
        }

        unmarkPotentialCells() {
            this.potentialMovements.forEach(poz => {
                this.getDivAt(poz.row, poz.column).removeClass("potential-movement");
                this.getDivAt(poz.row, poz.column).droppable("disable");
            });
            this.getSelectedDiv().removeClass("selected-cell");    
        }

        /**
         * 
         * @param {Number} row  
         * @param {Number} column    
         */
        isCellEmpty(row, column) {
            return this.board[row][column] === null;
        }

        hasSelectedCell() {
            return typeof (this.selectedCell.row) !== "undefined";
        }

        changeTurn() {
            this.turn = this.turn === "white" ? "black" : "white";
            $(".team-announcer-black").toggleClass("active");
            $(".team-announcer-white").toggleClass("active");

            /*document.body.getElementsByClassName("team-announcer-black")[0].classList.toggle("active");
            document.body.getElementsByClassName("team-announcer-white")[0].classList.toggle("active");*/

        }

        startGame() {
            this.initializeBoard();
            if (this.turn === "black") {
                this.changeTurn();
            }
            this.moveHistory = [];
            window.localStorage.removeItem("history");
            $("body").append($(".chess-board"));
            //document.body.appendChild(this.chessBoardCollection);
        }

        getPieceType(piece){
            let type = null;
            if(piece instanceof Pawn){
                type = "pawn";
            }
            if(piece instanceof Rook){
                type = "rook";
            }
            if(piece instanceof Knight){
                type = "knight";
            }
            if(piece instanceof Bishop){
                type = "bishop";
            }
            if(piece instanceof Queen){
                type = "queen";
            }
            if(piece instanceof King){
                type = "king";
            }
            return type;
        }

        memorizeMove(fromX, fromY, toX, toY) {
            let elimPiece = null;
            if(this.getBoardPieceAt(toX, toY) !== null)
                elimPiece = {pieceType: this.getPieceType(this.getBoardPieceAt(toX, toY)), color : this.getBoardPieceAt(toX, toY).color};

            this.moveHistory.push({ from: new Cell(fromX, fromY), to: new Cell(toX, toY), eliminatedPiece: elimPiece,
                movedPiece: {pieceType: this.getPieceType(this.getBoardPieceAt(fromX, fromY)), color : this.getBoardPieceAt(fromX, fromY).color}});

            this.refreshLocalStorage();
        }

        displayLastMove() {
            //let newEntry = document.createElement("p");
            let move = this.moveHistory[this.moveHistory.length - 1]
            let piece = move.eliminatedPiece;
            let pieceDisplayed = "";
            if (piece === null) {
                pieceDisplayed = "NONE";
            } else {
                pieceDisplayed = "" + piece.color + " " + piece.pieceType; 
            }
            //newEntry.innerHTML = "(" + move.from.row + ", " + move.from.column + ") --> " + "(" + move.to.row + ", " + move.to.column + ")  " + pieceDisplayed; 
            //document.body.getElementsByClassName("move-history")[0].appendChild(newEntry);
            $(".move-history").append($("<p/>").html("(" + move.from.row + ", " + move.from.column + ") --> " + "(" + move.to.row + ", " + move.to.column + ")  " + pieceDisplayed));
        }

        removeLastMove() {
            //let toBeRemoved = document.body.getElementsByClassName("move-history")[0].lastChild;
            //document.body.getElementsByClassName("move-history")[0].removeChild(toBeRemoved);
            $(".move-history").children().last().remove();
        }

        clearHistory() {
            /*let children = document.body.getElementsByClassName("move-history")[0].children;
            Array.from(children).forEach(child=>{
                document.body.getElementsByClassName("move-history")[0].removeChild(child);
            });*/
            $(".move-history").empty();
        }

        restart() {
            this.startGame();
            this.clearHistory();
            this.unmarkPotentialCells();
            this.deselectCell();
        }

        undo() {
            if (this.moveHistory.length !== 0) {
                this.removeLastMove();
                this.unmarkPotentialCells();
                this.deselectCell();
                
                let lastMove = this.moveHistory.pop();

                let lastMovedPiece = this.createPiece(lastMove.movedPiece.pieceType, lastMove.movedPiece.color, lastMove.from.row, lastMove.from.column);
                lastMovedPiece.moveTo(lastMove.from.row, lastMove.from.column);
                this.setBoardPieceAt(lastMove.from.row, lastMove.from.column, lastMovedPiece);

                let eliminatedPiece = null;
                if(lastMove.eliminatedPiece !== null)
                    eliminatedPiece = this.createPiece(lastMove.eliminatedPiece.pieceType, lastMove.eliminatedPiece.color, lastMove.to.row, lastMove.to.column);                    
                this.setBoardPieceAt(lastMove.to.row, lastMove.to.column, eliminatedPiece);


                this.changeTurn();
                this.findIllegalMoves();
                this.refreshLocalStorage();
                this.redrawBoard();
            }
        }

        refreshLocalStorage() {
            window.localStorage.setItem("history", JSON.stringify(this.moveHistory));
        }

        findIllegalMoves() {
            this.illegalMoves = [];
            let possibleMoves = [];
            let currentMove = null;
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.board[i][j] !== null) {
                        if (this.board[i][j].color === this.turn) {
                            possibleMoves = this.board[i][j].pozICanMoveTo(this);
                            possibleMoves.forEach(potentialFinalPoz => {
                                currentMove = { from: new Cell(i, j), to: new Cell(potentialFinalPoz.row, potentialFinalPoz.column), eliminatedPiece: this.getBoardPieceAt(potentialFinalPoz.row, potentialFinalPoz.column) };
                                this.simulateMove(currentMove);
                                if (this.isInCheck())
                                    this.illegalMoves.push(currentMove);
                                this.undoSimulatedMove(currentMove);
                            });
                        }
                    }
                }
            }
        }

        simulateMove(move) {
            this.board[move.to.row][move.to.column] = this.board[move.from.row][move.from.column];
            this.board[move.from.row][move.from.column] = null;
        }

        undoSimulatedMove(move) {
            this.board[move.from.row][move.from.column] = this.board[move.to.row][move.to.column];
            this.board[move.to.row][move.to.column] = move.eliminatedPiece;
        }

        isInCheck() {
            //let opositeTeamMoves = [];
            let kingPosition = null;
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.board[i][j] !== null) {
                        if (this.board[i][j].color === this.turn) {
                            if (this.board[i][j] instanceof King)
                                kingPosition = new Cell(i, j);
                        }
                    }
                }
            }
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.board[i][j] !== null && this.board[i][j].color !== this.turn) {
                        let potentialMoves = this.board[i][j].pozICanMoveTo(this);
                        for (let i = 0; i < potentialMoves.length; i++) {
                            if (potentialMoves[i].row === kingPosition.row && potentialMoves[i].column === kingPosition.column)
                                return true;
                        }
                    }
                }
            }
            return false;
        }

        isCheckmate() {
            let checkmate = true;
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.board[i][j] !== null) {
                        if (this.board[i][j].color === this.turn) {
                            if (this.board[i][j].pozICanMoveTo(this).length !== 0)
                                checkmate = false;
                        }
                    }
                }
            }
            return checkmate;
        }

        promotePawn(pawn) {
            this.createPopup(pawn);
        }

        createPopup(pawn) {
            /*let popUp = document.createElement("div");
            popUp.classList.add("pawn-promotion");
            
            let title = document.createElement("p");
            title.textContent = "Select what you want to promote your pawn to:";

            popUp.appendChild(title);

            let queenDiv = document.createElement("div");
            queenDiv.classList.add("promotion-option");
            queenDiv.addEventListener("mousedown", ()=>this.promotePawnTo(pawn, "queen"), false);
            queenDiv.textContent = pawn.color === "white" ? "\u2655" : "\u265B";

            let rookDiv = document.createElement("div");
            rookDiv.classList.add("promotion-option");
            rookDiv.addEventListener("mousedown", ()=>this.promotePawnTo(pawn, "rook"), false);
            rookDiv.textContent = pawn.color === "white" ? "\u2656" : "\u265C";

            let knightDiv = document.createElement("div");
            knightDiv.classList.add("promotion-option");
            knightDiv.addEventListener("mousedown", ()=>this.promotePawnTo(pawn, "knight"), false);
            knightDiv.textContent = pawn.color === "white" ? "\u2658" : "\u265E";

            let bishopDiv = document.createElement("div");
            bishopDiv.classList.add("promotion-option");
            bishopDiv.addEventListener("mousedown", ()=>this.promotePawnTo(pawn, "bishop"), false);
            bishopDiv.textContent = pawn.color === "white" ? "\u2657" : "\u265D";;

            popUp.appendChild(document.createElement("span"));
            popUp.appendChild(queenDiv);
            popUp.appendChild(rookDiv);
            popUp.appendChild(knightDiv);
            popUp.appendChild(bishopDiv);
            document.body.appendChild(popUp)*/

            let $pawnPromotionDiv = $("<div/>").addClass("pawn-promotion");
            $pawnPromotionDiv.append($("<p/>").html("Select what you want to promote your pawn to:"));
            $pawnPromotionDiv.append($("<div/>"))
            $pawnPromotionDiv.append(this.promotionOptionDiv(pawn, "queen"));
            $pawnPromotionDiv.append(this.promotionOptionDiv(pawn, "rook"));
            $pawnPromotionDiv.append(this.promotionOptionDiv(pawn, "knight"));
            $pawnPromotionDiv.append(this.promotionOptionDiv(pawn, "bishop"));
          
            $("body").append($pawnPromotionDiv);

        }

        /**
         * 
         * @param {Pawn} pawn 
         * @param {String} piece 
         */
        promotionOptionDiv(pawn, piece){
            let $newDiv = $("<div/>").addClass("prommotion-option").mousedown(() => this.promotePawnTo(pawn, piece))
            switch (piece){
                case "queen": $newDiv.html(pawn.color === "white" ? "\u2655" : "\u265B"); break;
                case "rook": $newDiv.html(pawn.color === "white" ? "\u2656" : "\u265C"); break;
                case "knight": $newDiv.html(pawn.color === "white" ? "\u2658" : "\u265E"); break;
                case "bishop": $newDiv.html(pawn.color === "white" ? "\u2657" : "\u265D"); break; 
            }
            return $newDiv;
        }
        
        /**
         * 
         * @param {Pawn} pawn 
         * @param {String} piece 
         */
        promotePawnTo(pawn, piece) {

            let newPiece = null;
            switch (piece) {
                case "rook":
                    let $rook = $("<div/>").addClass("chess-piece" + " rook " + pawn.color).html(pawn.color === "white" ? "\u2656" : "\u265C");
                    /*let rook = document.createElement("div");
                    rook.classList.add("chess-piece");
                    rook.classList.add("rook");
                    rook.classList.add(pawn.color);
                    text = pawn.color === "white"? "\u2656" : "\u265C";
                    rook.textContent = text;*/
                    newPiece = new Rook(pawn.x, pawn.y, pawn.color, $rook);
                    break;

                case "knight":
                    /*let knight = document.createElement("div");
                    knight.classList.add("chess-piece");
                    knight.classList.add("knight");
                    knight.classList.add(pawn.color);
                    text = pawn.color === "white"? "\u2658" : "\u265E";
                    knight.textContent = text;*/
                    let $knight = $("<div/>").addClass("chess-piece" + " knight " + pawn.color).html(pawn.color === "white" ? "\u2658" : "\u265E");
                    newPiece = new Knight(pawn.x, pawn.y, pawn.color, $knight);
                    break;

                case "bishop":
                    /*let bishop = document.createElement("div");
                    bishop.classList.add("chess-piece");
                    bishop.classList.add("bishop");
                    bishop.classList.add(pawn.color);
                    text = pawn.color === "white"? "\u2657" : "\u265D";
                    bishop.textContent = text;*/

                    let $bishop = $("<div/>").addClass("chess-piece" + " bishop " + pawn.color).html(pawn.color === "white" ? "\u2657" : "\u265D");
                    newPiece = new Bishop(pawn.x, pawn.y, pawn.color, $bishop);
                    break;

                default:
                    /*let queen = document.createElement("div");
                    queen.classList.add("chess-piece");
                    queen.classList.add("queen");
                    queen.classList.add(pawn.color);
                    text = pawn.color === "white"? "\u2655" : "\u265B";
                    queen.textContent = text;*/
                    let $queen = $("<div/>").addClass("chess-piece" + " queen " + pawn.color).html(pawn.color === "white" ? "\u2655" : "\u265B");
                    newPiece = new Queen(pawn.x, pawn.y, pawn.color, $queen);
                    break;
            }
            this.setBoardPieceAt(pawn.x, pawn.y, newPiece);
            this.redrawBoard();
            this.findIllegalMoves();
            //document.body.removeChild(document.getElementsByClassName("pawn-promotion")[0]);
            $(".pawn-promotion").remove();
        }

        //Interacting with the API. We assume that the moves sent to the api are VALID
        sendMoveToTheAPI(fromX, fromY, toX, toY){
            $.ajax({
                method: "post",
                url: "https://chess.thrive-dev.bitstoneint.com/wp-json/chess-api/game/" + game.onlineId,
                data: {move : {from: {x:fromX, y:fromY}, to : {x:toX, y:toY}}}
               }).done(function( returnedVlaue ) {    
                    console.log(returnedVlaue);
                    //interval = setInterval(game.getMoveFromTheAPI, 1000);
               });
        }

        getMoveFromTheAPI(){
            $.ajax({
                method: "get",  
                url: "https://chess.thrive-dev.bitstoneint.com/wp-json/chess-api/game/" + game.onlineId,
                
            }).done( (returnedValue)=>{
                console.log(returnedValue.moves);
                //let remainder = game.team === "white"? 0 : 1;
                if(returnedValue.moves !== ""){
                    let lastMove = returnedValue.moves[returnedValue.moves.length-1];
                    if((game.lastSentMove === null && game.lastReceivedMove === null) || 
                        (game.lastReceivedMove === null && game.areMovesDifferent(game.lastSentMove, lastMove)) ||
                        (game.lastSentMove === null && game.areMovesDifferent(game.lastReceivedMove, lastMove)) ||
                        (game.areMovesDifferent(lastMove, game.lastSentMove) && game.areMovesDifferent(lastMove, game.lastReceivedMove))){

                        game.movePieceTo(game.getBoardPieceAt(parseInt(lastMove.from.x), parseInt(lastMove.from.y)), parseInt(lastMove.to.x), parseInt(lastMove.to.y));
                        game.lastReceivedMove = lastMove;
                        /*if(interval !== null)
                        {
                            clearInterval(interval);
                            interval = null;
                        }*/
                    }
                }
            });
            
        }
        
        areMovesDifferent(move1, move2){
            if(move1 === null || move2 === null)
                return true;
            let move1Values = Object.values(move1);
            let move2Values = Object.values(move2);
            for(let i = 0; i < move1Values.length; i++){
                if(parseInt(move1Values[i].x) !== parseInt(move2Values[i].x) || parseInt(move1Values[i].y) !== parseInt(move2Values[i].y))
                    return true;
            }
            return false;
        }

        hasMoveAlreadyBeenDone(lastMove){
            return !this.areMovesDifferent(lastMove, this.lastSentMove) || !this.areMovesDifferent(lastMove, this.lastReceivedMove);
        }

        joinGame(gameID, team){
            game.restart();
            game.team = team;
            game.onlineId = gameID;
            $.ajax({
                method: "get",
                url: "https://chess.thrive-dev.bitstoneint.com/wp-json/chess-api/game/" + game.onlineId,
                
            }).done( (returnedValue)=>{
                console.log(returnedValue.moves);
                if(returnedValue.moves.length !==0){
                    returnedValue.moves.forEach(move=>{
                        if(game.getBoardPieceAt(parseInt(move.from.x), parseInt(move.from.y)) !== null){
                            game.movePieceTo(game.getBoardPieceAt(parseInt(move.from.x), parseInt(move.from.y)), parseInt(move.to.x), parseInt(move.to.y));
                            game.lastSentMove = game.lastReceivedMove;
                            game.lastReceivedMove = move;
                        }
                    });
                }
                game.multiplayer = true;
                interval = setInterval(game.getMoveFromTheAPI, 1000);
            });
        }
    }

    let game = null;

    function initializeGame() {
        game = new ChessBoard();
        //let history = JSON.parse(window.localStorage.getItem("history"));
        let history = null;
        game.startGame();
        if (history !== null) {
            history.forEach(move => {
                game.movePieceTo(game.getBoardPieceAt(move.from.row, move.from.column), move.to.row, move.to.column);
            });
        }
    }

    let interval = null;

    $(".join-game").click(()=>{
        game.joinGame($(".game-id").val(), "black")
    });

    $(".quit-game").click(()=>{
        game.multiplayer = false;
        if(interval != null)
        {
            clearInterval(interval);
            interval = null;
        }
        game.restart();
    });

    $(".create-game").click(()=>{
        $.ajax({
            method: "post",
            url: "https://chess.thrive-dev.bitstoneint.com/wp-json/chess-api/game",
            data: {name : $(".new-game-name").val()}
            }).done(function( returnedValue ) {    
                console.log(returnedValue);
                game.joinGame(returnedValue.ID, "white");
            });        
    });

    $(".restart").mousedown(() => {
        if(game.multiplayer === false)
            game.restart();
        
    });

    $(".undo").mousedown(() => {
        if(game.multiplayer === false)
            game.undo();
    });

    /*let restartButton = document.body.getElementsByClassName("restart")[0];
    restartButton.addEventListener("mousedown", ()=>{
        game.restart();
    }, false);

    let undoButton = document.body.getElementsByClassName("undo")[0];
    undoButton.addEventListener("mousedown", ()=>{
        game.undo();
    }, false);*/




    //Timer
    let timerTime = 5;
    let timeLeft = 0;
    let countdownInterval = setInterval(countdownFunction, 200);

    let $countdown = $("<div/>").addClass("countdown");
    
    function countdownFunction() {
        $countdown.html(timerTime - timeLeft);
        $("body").append($countdown)
        if (timerTime - timeLeft < 1) {
            clearInterval(countdownInterval);
            timeLeft = timerTime + 1;
            $countdown.remove();
            initializeGame();
        }
        timeLeft++;
    }
})(jQuery);
