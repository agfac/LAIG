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

	if(this.board.selected.body.currentCell && !this.board.selected.cell.occupied)

		this.playerMove(board,currPlayer); 
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