const express = require('express');
const path = require('path');


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', require('./routes/index.routes'));
app.use('/categorias', require('./routes/categorias.routes'));
app.use('/ahorro', require('./routes/ahorro.routes'));
app.use('/limite', require('./routes/limite.routes'));
app.use('/gasto', require('./routes/gasto.routes'));



app.listen(3000, () => {
console.log('Servidor en http://localhost:3000');
});