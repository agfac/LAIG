/*Metodos default/estaticos da classe de connection para permitir a
 possibilidade de enviar handlers dinamicos no caso de inexistencia
 desses handlers sao usados os seguintes*/

Connection.board;
Connection.logic;
Connection.socket;

/*Classe connection que realiza pedidos ao servidor e reencaminha as respostas*/

function Connection(board,logic,port){

    Connection.socket = new WebSocket('ws://127.0.0.1:4444');
    
    Connection.board = board;
    Connection.logic = logic;
    
    Connection.socket.onopen = function () {
        Connection.socket.send('Connected!'); // Send the message to the server
    };

    // Log errors
    Connection.socket.onerror = function (error) {
        console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    Connection.socket.onmessage = function (e) {
        console.log('Server: ' + e.data);

        if(e.data == 'Movimento aceite'){
            Connection.handleMove();
        }
        else if(e.data == 'Captura aceite'){
            Connection.handleCapture();
        }
        else if(e.data == 'Movimento nao aceite' || e.data == 'Celula ocupada' || e.data == 'Captura nao aceite'){
            Connection.board.selected.body.resetSelection();
            Connection.board.selected.cell.selected = false;
            Connection.board.selected.cell = null;
            Connection.board.selected.body = null;
        }
    };
};

Connection.prototype.constructor = Connection;

Connection.prototype.send = function (message) {

    Connection.socket.send(message);

};

Connection.handleMove = function () {

    Connection.board.selected.body.move(Connection.board.selected.cell);
    Connection.board.endTurn();

};

Connection.handleCapture = function (data) {

    var checker = Connection.board.selected.body;
    
    var startCell = this.board.getCellAt(checker.boardPosition.x, checker.boardPosition.y);
    var endCell = Connection.board.selected.cell;
    var middleCell;

    if(Connection.board.WHITE == Connection.board.playerTurn){
        if(endCell.boardPosition.x > startCell.boardPosition.x)
            middleCell = this.board.getCellAt(checker.boardPosition.x + 1,checker.boardPosition.y - 1);
        else
            middleCell = this.board.getCellAt(checker.boardPosition.x - 1,checker.boardPosition.y - 1);
    }
    else{
        if(endCell.boardPosition.x > startCell.boardPosition.x)
            middleCell = this.board.getCellAt(checker.boardPosition.x + 1,checker.boardPosition.y + 1);
        else
            middleCell = this.board.getCellAt(checker.boardPosition.x - 1,checker.boardPosition.y + 1);
    }
    
    checker.move(Connection.board.selected.cell);
    
    var enemy = middleCell.occupied;
    enemy.move(null);

    var points = Connection.board.getPoints();
    
    if(checker.team == Connection.board.WHITE)
        Connection.board.setPoints(points.w + 1,points.b);
    else 
        Connection.board.setPoints(points.w,points.b + 1);
    
    Connection.board.endTurn();
};

Connection.gameOverHandler = function (data) {

    var response = new Array();

    response = JSON.parse(data.target.response);

    Connection.board.gameOver(response);
};