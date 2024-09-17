import inquirer from 'inquirer';
import { exec } from 'child_process';

export const downloadDatasets = async () => {
	const location = (await inquirer.prompt([
		{
			type: 'input',
			name: 'location',
			default: '../datasets',
			message: 'Where do you want to save the datasets?'
		}
	])).location;
	console.log('Downloading datasets...');
	console.log('Downloading falko...');
	await downloadFalko(location);
};

const downloadFalko = async (location: string) => {
	exec(`curl -o ${location}/falko.zip https://korpling.german.hu-berlin.de/public/Falko78wrz2eh/text-package.zip`);
	await delay(1000);
	exec(`unzip ${location}/falko.zip -d ${location}/falkoComplete`);
	await delay(1000);
	exec(`rm -rf ${location}/falko.zip`);
	await delay(1000);
	exec(`unzip ${location}/falkoComplete/essayL2.zip -d ${location}/falko`);
	await delay(1000);
	exec(`unzip ${location}/falkoComplete/summaryL1.zip -d ${location}/falko`);
	await delay(1000);
	exec(`unzip ${location}/falkoComplete/summaryL2.zip -d ${location}/falko/summaryL2`);
	await delay(1000);
	exec(`rm -rf ${location}/falkoComplete`);
	await delay(1000);
	exec(`curl -o ${location}/falko/metadata.xlsx https://www.linguistik.hu-berlin.de/de/institut/professuren/korpuslinguistik/forschung/falko/FalkoEssayL2v2.4_metadata.xlsx/@@download/file/FalkoEssayL2v2.4_metadata.xlsx`);
	return;
}

const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};