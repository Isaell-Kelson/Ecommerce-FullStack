const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const rotaProdutos = require('./routes/produtos');
const rotaPedidos = require('./routes/pedidos');
const rotaUsuarios = require('./routes/usuarios');
const rotaHome = require('./routes/home');
const rotaCarrinho = require('./routes/carrinho');
const rotaContratacao = require('./routes/contratacao');

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS '*' permite que qualquer origem acesse a API (não recomendado em produção) ou especifique/use o endereço do site
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
    'Access-Control-Allow-Header', 
    'Content-Type,Authorization, Origin, X-Requested-With, Accept'
    );

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }

    next();

});

app.use('/produtos', rotaProdutos);
app.use('/pedidos', rotaPedidos);
app.use('/login', rotaUsuarios);
app.use('/home', rotaHome);
app.use('/carrinho', rotaCarrinho);
app.use('/contratacao', rotaContratacao);




app.use((req, res, next) => {
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: error.message
        }
    }); 
});

module.exports = app;