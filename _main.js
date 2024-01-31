/* 
	Para que este código funcione é necessário instalar o ffmpeg e adicioná-lo no ambiente de variáveis
*/
const ffmpeg = require('fluent-ffmpeg');
const xlsx = require('xlsx');
const fs = require('fs');
const { color } = require('colors');

const PASTA_DESTINO = 'Z:/DOCUMENTOS/projetos/videos_divididos/'


const dividirVideo = (tempos, index) => {
	
	if (index >= tempos.length) {
		console.log('Fim do processo'.bgGreen);
		return false;
	};
	
	const obj = tempos[index];
	if (obj.segundo_duracao <=0) {return false};
	
	//cria pasta caso não exista
	fs.mkdir(PASTA_DESTINO, (err) => { });
	
	const tempoInicial = formatarHora(obj.tempo_inicial);
	const tempoFinal = formatarHora(obj.tempo_final);

	const arquivoEntrada = `${obj.nome_video_entrada}`
	const nomeVideoEntrada = `${__dirname}\\${arquivoEntrada}`;
	const nomeVideoSaida = `${PASTA_DESTINO}${arquivoEntrada.replace(/(\.\w{0,4})$/, '')}_${tempoInicial}_a_${tempoFinal}.mp4`;

	ffmpeg(nomeVideoEntrada)
		.setStartTime(obj.segundo_inicial)
		.setDuration(obj.segundo_duracao)
		.on('end', () => {
			console.log(`Linha ${index + 2} => ${tempoInicial}_a_${tempoFinal} concluído`.green);
			dividirVideo(tempos, index + 1);
		})
		.on('error', (err) => {
			console.error(`Erro na linha ${index + 2} => ${tempoInicial}_a_${tempoFinal}: ${err}`.red);
		})
		.save(nomeVideoSaida);
};


const lerArquivo_xlsx = async () => {
	const arquivoXLSX = `${__dirname}/dividir.xlsx`;
	try { // retorna array vazio caso arquivo com os tempos não exista
		fs.accessSync(arquivoXLSX, fs.constants.F_OK);
	} catch {
		console.log('Arquivo "dividir.xlsx" não encontrado')
		return [];
	}
	
	const wb = xlsx.readFile(arquivoXLSX);
	const w = wb.Sheets['tempo'];
    
	let dados = xlsx.utils.sheet_to_json(w);
	return dados;
};


const formatarHora = (hora) => {
	const hours = Math.floor(hora * 24);
    const minutes = Math.floor((hora * 24 * 60) % 60);
    const seconds = Math.floor((hora * 24 * 60 * 60) % 60);

	return `${hours.toString().padStart(2, '0')}-${minutes.toString().padStart(2, '0')}-${seconds.toString().padStart(2, '0')}`;
};


async function main() {
	const trechos = await lerArquivo_xlsx();
	await dividirVideo(trechos, 0);
};

main();