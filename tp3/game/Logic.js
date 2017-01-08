function Logic(board){

    this.board = board;
};

Logic.prototype.constructor = Logic;

Logic.prototype.doMovement = function (action) {
	//console.log("Moviment Action : " + action);

	switch (action[0]) {
		case this.board.skip_index:
			return;
			break;
		case this.board.move_index:
			var xi = action[1];
			var yi = action[2] - 1;
			var xf = action[3];
			var yf = action[4] - 1;

			var startCell = this.board.getCellAt(xi,yi);
			var endCell = this.board.getCellAt(xf,yf);
			
			if(startCell.occupied && !endCell.occupied)
				startCell.occupied.move(endCell);
			break;
		case this.board.capturar_index:
			var xi = action[1];
			var yi = action[2] - 1;
			var xf = action[3];
			var yf = action[4] - 1;

			var startCell = this.board.getCellAt(xi,yi);
			var cellDest = this.board.getCellAt(xf,yf);

			if(startCell.occupied && cellDest.occupied){
				cellDest.occupied.move(null);
				startCell.occupied.move(cellDest);
			}
			break;
	}

	return;
};

Logic.prototype.playerMovement = function (board,currPlayer) {

	if(!this.board.selected.body.currentCell && !this.board.selected.cell.occupied){//Nao esta em jogo logo é para adicionar corpo e a celula nao esta ocupada
		this.playerAddBody(board,currPlayer);

	} else if(this.board.selected.body.currentCell && !this.board.selected.cell.occupied){//Adaptoid placed e a celula desocupada

		this.playerMove(board,currPlayer);

	} else if(this.board.selected.body.currentCell && this.board.selected.cell.occupied){//Ver se o body esta placed e a celula ocupada
		if(this.board.selected.cell.occupied.team != this.board.selected.body.team){//Celula ocupada e com um inimigo de body

			this.playerCapture(board,currPlayer);

		}
	}
};

Logic.prototype.playerMove = function (board,currPlayer) {

	var xi = this.board.selected.body.boardPosition.x;
	var yi = this.board.selected.body.boardPosition.y + 1;
	
	var xf = this.board.selected.cell.boardPosition.x;
	var yf = this.board.selected.cell.boardPosition.y + 1;
	
	var action = xi + "," + yi + ";" + xf + "," + yf;
	var request = "mov(" + this.board.getGameString() + ";" + currPlayer + ";" + action + ")";
	
	this.board.server.send(request);
};

Logic.prototype.checkGameEnd = function (board,currPlayer) {

	this.board.server.getPrologRequest("isGameOver(" + this.board.getGameString() + ")",Connection.gameOverHandler);
};
