import { readdirSync, readFileSync } from 'fs';
import { Model } from '../src/models';
import { currentStatus } from '../src';

export const renderMain = (req: Request): Response => {
    let template = '';
    template += '<table><tr><td><span>Model: </span><select id="model" >';
    for (let level of Object.values(Model)) {
        template += `<option value="${level}">${level}</option>`;
    }
    template += `</select> `;
    template += `<span>Temperature: </span><select id="temperature" >  `;
    for (let i = 0; i < 10; i++) {
        template += `<option value="${i / 10}">${i / 10}</option>`;
    }
    template += `</select>  `;
    template += `<span>Number of runs: </span><input id="numberOfRuns" type="number" value="1" min ="1">  `;
    template += `<span>Sample size: </span><input id="sampleSize" type="number" value="25" min="5">  `;
    template += `<span>System prompt: </span><input id="systemPrompt" type="text" placeholder="Leave empty for default prompt">  `;
    template += `<button onClick="window.location.href='http://localhost:81/start-run/?model=' + document.getElementById('model').value + '&temperature=' + document.getElementById('temperature').value + '&numberOfRuns=' + document.getElementById('numberOfRuns').value + '&sampleSize=' + document.getElementById('sampleSize').value + '&systemPrompt=' + document.getElementById('systemPrompt').value">Start new run</button></td></tr></table></br>`;
    // manually run single evaluation
    // template += `<table><tr><td><span>Manually run single evaluation: </span><input id="text" type="text" placeholder="Enter text"> `;
    // template += `<button onClick="window.location.href='http://localhost:81/start-single-evaluation/?text=' + document.getElementById('text').value">Run</button></td></tr></table></br>`;
    template += `<table><tr>`;
    template += `<table><tr><td><span>Current status: </span>`;
    if(currentStatus.running) {
        template += `<span><b>Running</b></span> `;
        template += `<span><b>Model:</b> ${currentStatus.model}</span> `;
        template += `<span><b>Number of run:</b> ${currentStatus.numberOfRun}</span> `;
        template += `<span><b>Level of run:</b> ${currentStatus.levelOfRun}</span><div class="loader"></div> `;
    } else {
        template += `<span>Not running</span>`;
    }
    template += `</td></tr></table></br>`;
    template += `<table><tr>
            <th>file</th>
            <th>model</th>
            <th>number of runs</th>
            <th>sample size</th>
            <th>temperature</th>
            <th>accuracy</th>
            <th>group accuracy</th>
            <th style="width: 10vw;" >notes</th>
        </tr>`;
    const files = readdirSync('runs/').filter(file => file.endsWith('.json')).sort().reverse();
    if(currentStatus.running) {
        template += `<tr>
                <td>In progress...</td>
                <td>${currentStatus.model}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><span style="color:green">In progress(${currentStatus.numberOfRun}/${currentStatus.totalNumberOfRuns})</span></td>
            </tr>`;
    }
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileContent = JSON.parse(readFileSync(`runs/${file}`, 'utf-8'));
        if(!fileContent.runs) continue;
        if(fileContent.aborted) {
            template += `<tr>
                <td><a href="http://localhost:81/run/${file}">${file}</a></td>
                <td>${fileContent.model}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><span style="color: red;">Automatically aborted</span></td>
            </tr>`;
            continue;
        }
        const accuracy = (fileContent.completeEvaluation?.accuracy ?? fileContent.evaluation?.accuracy).toFixed(4);
        const groupAccuracy = (fileContent.completeEvaluation?.groupAccuracy ?? 0).toFixed(4);
        const numberOfRuns = (fileContent.runAccuracies ?? []).length;
        const sampleSize = (fileContent.runs[0].results.length ?? 0) / 6;
        template += `<tr>
                <td><a href="http://localhost:81/run/${file}">${file}</a></td>
                <td>${fileContent.model}</td>
                <td>${numberOfRuns}</td>
                <td>${sampleSize}</td>
                <td>${fileContent.temperature}</td>
                <td>${accuracy}</td>
                <td>${groupAccuracy}</td>
                <td></td>
            </tr>`;
    }
    template += '</table>';
    // add script that auto refreshes when run is in progress
    if(currentStatus.running) {
        template += `<script>setTimeout(() => window.location.reload(), 5000);</script>`;
    }
    return new Response(readFileSync('views/template.html', 'utf-8').replace('{{template}}', template),
        { headers: { 'Content-Type': 'text/html' } });
};