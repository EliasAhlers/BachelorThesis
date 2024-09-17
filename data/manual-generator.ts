import { writeFileSync, readdirSync } from "fs";
import { EOL } from "os";

let counter = 1;

readdirSync('./datasets/synthetic/A1').forEach(file => {
	file = file.replace('.txt', '');
	console.log(file);
	if (parseInt(file) >= counter) {
		counter = parseInt(file) + 1;
	}
});

process.stdout.write(`Enter text ${counter}: `);


let currentText = '';

for await (const line of console) {
	// console.log(`You typed: ${line}`);
	if (line === 'N') {
		currentText = currentText.trimEnd();
		writeFileSync(`./datasets/synthetic/A1/${counter}.txt`, currentText);
		console.log(`Saved to: ./datasets/synthetic/${counter}.txt`);
		counter++;
		currentText = '';
	} else {
		currentText += line + EOL;
	}
	process.stdout.write(`Enter text ${counter}: `);
}