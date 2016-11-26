import express from 'express';
import cors from 'cors';
import fetch from 'isomorphic-fetch';
import bodyParser from 'body-parser';
import stringify  from 'json-stringify-safe';

const pcUrl = 'https://gist.githubusercontent.com/isuvorov/55f38b82ce263836dadc0503845db4da/raw/pets.json';

const app = express();
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// parse application/json
app.use(bodyParser.json());

let bd = {};
let pets = {};
let users = {};
fetch(pcUrl)
    .then(async(res) => {
        bd = await res.json();
        pets = pathJSON(bd, 'pets');
        users = pathJSON(bd, 'users');
        app.listen(3000, () => {
            console.log('Your app listening on port 3000!');
        });
    })
    .catch(err => {
        console.log('Чтото пошло не так:', err);
    });

function pathJSON(obj, path, sep = '/') {
    const pathes = path.split(sep);
    if (path === '') {
        return obj;
    }
    let result = pathes.reduce((prev, cur) => prev[cur], obj);
    return result;
}


app.get('/', (req, res) => {
    res.json(bd);
});

app.get('/users/populate', function(req, res, next) {
    let result;
    const { havePet } = req.query;

    console.log(pets);
    console.log(users);

    result = users.map(user => {
        let User = {...user};
        User['pets'] = pets.filter(pet => user.id === pet.userId);
        return User;
    });

    if (havePet) {
        const ids = pets.filter(pet => pet.type === havePet).map(pet => pet.userId);
        result = result.filter(user => ids.includes(user.id));
    }
    //console.log(stringify(resultus, null, 2));
    if (result) {
        res.json(result);
    } else {
        next();
    }
});

app.get('/users/:id(\\d+)/populate', (req, res, next) => {
    let result;
    const { id } = req.params;

    let User = {...users.find(user => user.id === parseInt(id, 10))};
    User['pets'] =  pets.filter(pet => User.id === pet.userId);
    result = User;

    if (result.hasOwnProperty('id')) {
        res.json(result);
    } else {
        next();
    }
});

app.get('/users/:username(\\w+)/populate', (req, res, next) => {
    let result;
    const { username } = req.params;

    let User = {...users.find(user => user.username === username)};
    User['pets'] =  pets.filter(pet => User.id === pet.userId);
    result = User;

    if (result.hasOwnProperty('id')) {
        res.json(result);
    } else {
        next();
    }
});


app.get('/users', (req, res, next) => {
    let result;

    const { havePet } = req.query;

    result = users;
    if (havePet) {
        const ids = pets.filter(pet => pet.type === havePet).map(pet => pet.userId);
        result = users.filter(user => ids.includes(user.id));
    }

    if (result) {
        res.json(result);
    } else {
        next();
    }
});

app.get('/users/:id(\\d+)', (req, res, next) => {
    const { id } = req.params;
    const result = pathJSON(bd, 'users').filter(user => user.id === parseInt(id,10));
    //console.log(result);
    if (result.length) {
        res.json(result[0]);
    } else {
        next();
    }
});

app.get('/users/:username(\\w+)', (req, res, next) => {
    const { username } = req.params;
    const result = pathJSON(bd, 'users').filter(user => user.username === username);
    //console.log(result);
    if (result.length) {
        res.json(result[0]);
    } else {
        next();
    }
});

app.get('/pets/:id(\\d+)', (req, res, next) => {
    const { id } = req.params;
    const result = pets.filter(pet => pet.id === parseInt(id,10));
    //console.log(result);
    if (result.length) {
        res.json(result[0]);
    } else {
        next();
    }
});

app.get('/pets', (req, res, next) => {
    let result = pets;
    const {type, age_gt, age_lt} = req.query;

    if (type) {
        result = result.filter(pet => pet.type === type);
    }
    if (age_gt) {
        result = result.filter(pet => pet.age > parseInt(age_gt, 10));
    }
    if (age_lt) {
        result = result.filter(pet => pet.age < parseInt(age_lt, 10));
    }
    if (result) {
        res.json(result);
    } else {
        next();
    }
});

app.get('/pets/populate', (req, res, next) => {
    let result;
    const {type, age_gt, age_lt} = req.query;

    result = pets.map(pet => {
        let Pet = {...pet};
        Pet['user'] = users.find(user => user.id === Pet.userId);
        return Pet;
    });

    if (type) {
        result = result.filter(pet => pet.type === type);
    }
    if (age_gt) {
        result = result.filter(pet => pet.age > parseInt(age_gt, 10));
    }
    if (age_lt) {
        result = result.filter(pet => pet.age < parseInt(age_lt, 10));
    }

    if (result) {
        res.json(result);
    } else {
        next();
    }
});

app.get('/pets/:id(\\d+)/populate', (req, res, next) => {
    let result;
    const { id } = req.params;

    let Pet = {...pets.find(pet => pet.id === parseInt(id, 10))};
    Pet['user'] =  users.find(user => user.id === Pet.userId);
    result = Pet;

    if (result) {
        res.json(result);
    } else {
        next();
    }
});


app.use((req, res, next) => {
    res.status(404).send('Not Found');
});
