require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 2500;
const nameDb = 'data/names.csv';
const fs = require("fs");
const path = require("path");
// set request mode to no cors
app.use((request, result, next) => {
    result.header("Access-Control-Allow-Origin", "*");
    result.header("Access-Control-Allow-Headers", "*");
    next();
});


app.disable('x-powered-by');


app.get('/names', (request, result) => {
    const data = fs.readFileSync(path.resolve(__dirname, nameDb), 'utf8');
    const rows = data.split('\r\n').slice(1);
    const names = rows.map(row => {
        const columns = row.split(',');
        return {
            name: columns[0],
            trust: columns[1]
        }
    });
    const toMatch = new RegExp(request.query.letter, 'i');
    const filteredNames = names.filter(name => toMatch.test(name.name) && name.name !== '');
    const sortedNames = filteredNames.sort((a, b) => b.trust - a.trust);
    result.send(sortedNames);
    result.end();
});


app.get('/update', (request, result) => {

    const data = fs.readFileSync(path.resolve(__dirname, nameDb), 'utf8');
    let rows = data.split('\r\n');
    rows = rows.slice(1);
    const names = rows.map(row => {
        const columns = row.split(',');
        return {
            name: columns[0],
            trust: columns[1]
        }
    });
    const qName = request.query.name.trim();
    const cancel = request.query.cancel ? request.query.cancel.trim() : null;

    let nameExists = names.filter(name => name.name === qName);
    if (nameExists.length > 0) {
        const index = names.indexOf(nameExists[0]);
        // get the trust level of the name in second column
        const trustLevel = parseFloat(names[index].trust.split('\\')[0]);

        if (cancel) {
            // names[index].trust = `${trustLevel - (1 - trustLevel) * 0.7}`;
            names[index].trust = `${trustLevel - (1 - trustLevel) * 0.7}`;
            console.log(names[index].trust);
            if (names[index].trust < 0.2)
            {
                names.splice(index, 1);
            }

        } else {
            // trust level = Pk previous  + (1 - Pk previous) * Pk new
            names[index].trust = `${trustLevel + (1 - trustLevel) * 0.7}`;
        }

        const filteredNames = names.filter(name => {
            return name.name !== null && name.name.match(/^ *$/) === null;
        });

        // update the csv file
        fs.writeFileSync(path.resolve(__dirname, nameDb), 'name,trust\r\n' + filteredNames.map(name => name.name + ',' + name.trust).join('\r\n'), 'utf8');

        // wait 0.5 second to make sure the file is updated
        setTimeout(() => {
            result.send({ 'msg' : 'Updated' });
            result.end();
        }, 500);
    }
    else {
        if (data.length === 0) {
            const header = 'name,trust level';
            fs.appendFileSync(path.resolve(__dirname, nameDb), header);
        }
        let newData;
        if (data.slice(-2) === '\r\n') {
            newData = qName + ',0.5\r\n';
        }
        else {
            newData = '\r\n' + qName + ',0.5\r\n';
        }
        fs.appendFileSync(path.resolve(__dirname, nameDb), newData);
        setTimeout(() => {
            result.send({ 'msg' : 'Added!' });
            result.end();
        }, 0.5);
    }
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});