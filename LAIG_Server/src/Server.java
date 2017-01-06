import java.io.IOException;
import java.net.ServerSocket;

public class Server {

	public static void main(String[] args) throws IOException {

		GameProtocol gp = new GameProtocol();

		new WebsocketServer(gp).start();

	}
}