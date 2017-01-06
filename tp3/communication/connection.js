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
    };
};

Connection.prototype.constructor = Connection;

Connection.prototype.send = function (message) {

    Connection.conn.send(message);

};

Connection.handleResponse = function (data) {

		var response = new Array();

		response = JSON.parse(data.target.response);

		Connection.logic.handleBotPlay(response);
};

Connection.handleAC = function (data) {
  
    var response = new Array();
  
    response = JSON.parse(data.target.response);
  
    if(response[0])
        Connection.board.selected.body.move(Connection.board.selected.cell);
};

Connection.handleMove = function (data) {

    var response = new Array();

    response = JSON.parse(data.target.response);

    if(response[0])
        Connection.board.selected.body.move(Connection.board.selected.cell);

};

Connection.handleCapture = function (data) {

    var response = new Array();

    response = JSON.parse(data.target.response);

    if(response[0]){//Indica que sim pode atacar

        var adaptoid = Connection.board.selected.body;

        var enemy = Connection.board.selected.cell.occupied;

        if(adaptoid.getNumClaws() == enemy.getNumClaws()){//Same claws morrem os dois
            adaptoid.move(null);
            enemy.move(null);
            var points = Connection.board.getPoints();
            Connection.board.setPoints(points.w + 1,points.b + 1);
        } else if (adaptoid.getNumClaws() > enemy.getNumClaws()){//Ganhou o adaptoid
            enemy.move(null);
            adaptoid.move(Connection.board.selected.cell);
            var points = Connection.board.getPoints();
            if(adaptoid.team == Connection.board.WHITE){
                Connection.board.setPoints(points.w + 1,points.b);
            } else {
                Connection.board.setPoints(points.w,points.b + 1);
            }
        } else{//Ganhou o enemy
            adaptoid.move(null);
            var points = Connection.board.getPoints();
            var points = Connection.board.getPoints();
            if(adaptoid.team == Connection.board.WHITE){
                Connection.board.setPoints(points.w,points.b + 1);
            } else {
                Connection.board.setPoints(points.w + 1,points.b);
            }
        }
    }
};

Connection.handleEvolution = function (data) {

    var response = new Array();

    response = JSON.parse(data.target.response);

    if(response[0])
        Connection.board.selected.member.storeParent(Connection.board.selected.body2);

};

Connection.faminHandler = function (data) {

    var response = new Array();

    response = JSON.parse(data.target.response);

    Connection.logic.famin(response);
};

Connection.gameOverHandler = function (data) {

    var response = new Array();

    response = JSON.parse(data.target.response);

    Connection.board.gameOver(response);
};