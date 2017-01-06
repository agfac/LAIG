
public class GameProtocol {

	public String processInput(String theInput) {
		
		String theOutput = null;
				
		theOutput =   "[L][P][L][P][L][P][L][P]"
					+ "[P][L][P][L][P][L][P][L]"
					+ "[L][P][L][P][L][P][L][P]"
					+ "[L][L][L][L][L][L][L][L]"
					+ "[L][L][L][L][L][L][L][L]"
					+ "[B][L][B][L][B][L][B][L]"
					+ "[L][B][L][B][L][B][L][B]"
					+ "[B][L][B][L][B][L][B][L]"
					+ ";B;8,8;2,2";
		
		char linhaO =  theOutput.charAt(195);
		char colunaO = theOutput.charAt(197);
		char linhaD =  theOutput.charAt(199);
		char colunaD = theOutput.charAt(201);
		
		System.out.println("linhaO: " + linhaO);
		System.out.println("colunaO: " + colunaO);
		System.out.println("linhaD: " + linhaD);
		System.out.println("colunaD: " + colunaD);
		
		StringBuilder novo = new StringBuilder(theOutput);
		
		int casaOrigem = ((Character.getNumericValue(linhaO))-1)*24 + (Character.getNumericValue(colunaO)*3)-2;
		int casaDestino = ((Character.getNumericValue(linhaD))-1)*24 + (Character.getNumericValue(colunaD)*3)-2;
		
		novo.setCharAt(casaDestino, 'D');
		
		if(theOutput.charAt(casaDestino) == 'L')
			theOutput = "Movimento aceite";
		else
			theOutput = "Movimento nao aceite";
		
		System.out.println("Novo " + novo);
		
		return theOutput;
	}
}