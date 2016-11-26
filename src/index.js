import express from 'express';
import cors from 'cors';
import fetch from 'isomorphic-fetch';
import bodyParser from 'body-parser';

const pcUrl = 'https://gist.githubusercontent.com/isuvorov/ce6b8d87983611482aac89f6d7bc0037/raw/pc.json';

const app = express();
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// parse application/json
app.use(bodyParser.json());

let pc = {};
fetch(pcUrl)
    .then(async(res) => {
        pc = await res.json();
        app.listen(3000, () => {
            console.log('Your app listening on port 3000!');
        });
    })
    .catch(err => {
        console.log('Чтото пошло не так:', err);
    });


app.get('/', (req, res) => {
    res.json({
        hello: 'JS World',
    });
});

function pathJSON(obj, path, sep = '/') {
    const pathes = path.split(sep);
    if (path === '') {
        return obj;
    }
    let result = pathes.reduce((prev, cur) => prev[cur], obj);
    return result;
}

app.get('/task3a/volumes', (req, res) => {
    const result = pc.hdd.reduce((prev, cur) => ({...prev,
        [cur.volume]: parseInt(cur.size, 10) + parseInt(prev[cur.volume] || 0, 10) + 'B'
    }), {});
    res.json(result);
});

app.get('/task3a/*', (req, res) => {
    const url = req.params[0].replace(/\/$/, '');
    console.log(url);
    if (url.includes('/length')) {
        res.status(404).send('Not Found');
    }
    let result;
    try {
        result = pathJSON(pc, url);
        console.log(result);
        if (result === undefined) {
            res.status(404).send('Not Found');
        }
    } catch (e) {
        console.log('Не правильный путь');
        res.status(404).send('Not Found');
    }
    res.json(result);
});
