import inquirer from 'inquirer';
import { downloadDatasets } from './modules/downloadDataset';
import { createDatabase } from './modules/createDatabase';
import { createJSON } from './modules/createJSON';
import { exportSamples } from './modules/exportSamples';
import { createOpenAIFinetuneData } from './modules/createOpenAIFinetuneData';
import { createGeminiFinetuneData } from './modules/createGeminiFinetuneData';
import { createTransferJSON } from './modules/createTransferJSON';

const createDatabaseFromExistingDatasetOption = 'Create database from existing dataset';
const downloadDatasetsOption = 'Download datasets';
const downloadDatasetsAndCreateDatabaseOption = 'Download datasets and create database';
const createJSONFileFromExistingDatasetOption = 'Create training data from database (classification task)';
const exportSamplesAsJSONOption = 'Export samples as JSON (classification task)';
const createOpenAIFinetuneDataOption = 'Create OpenAI fine-tune data';
const createGeminiFinetuneDataOption = 'Create Gemini fine-tune data';
const createTransferJSONOption = 'Create transfer JSON from existing dataset (transfer task)';

const result = await inquirer.prompt([
	{
		type: 'list',
		name: 'mainAction',
		message: 'What do you want to do?',
		choices: [
			createDatabaseFromExistingDatasetOption,
			downloadDatasetsOption,
			downloadDatasetsAndCreateDatabaseOption,
			createJSONFileFromExistingDatasetOption,
			exportSamplesAsJSONOption,
			// createOpenAIFinetuneDataOption,
			// createGeminiFinetuneDataOption,
			createTransferJSONOption
		],
	}
]);
switch (result.mainAction) {
	case createDatabaseFromExistingDatasetOption:
		createDatabase();
		break;
	case downloadDatasetsOption:
		downloadDatasets();
		break;
	case downloadDatasetsAndCreateDatabaseOption:
		await downloadDatasets();
		createDatabase();
		break;
	case createJSONFileFromExistingDatasetOption:
		await createJSON();
		break;
	case exportSamplesAsJSONOption:
		await exportSamples();
		break;
	case createOpenAIFinetuneDataOption:
		await createOpenAIFinetuneData();
		break;
	case createGeminiFinetuneDataOption:
		await createGeminiFinetuneData();
		break;
	case createTransferJSONOption:
		await createTransferJSON();
		break;
	default:
		break;
}

// .then((answers: any) => {
// 	// Use user feedback for... whatever!!
// 	console.log(answers);
// .catch((error: any) => {
// 	if (error.isTtyError) {
// 		// Prompt couldn't be rendered in the current environment
// 	} else {
// 		// Something else went wrong
// 	}
// });