const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.cadastrarUsuario = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('SELECT * FROM usuarios WHERE email = ?', [req.body.email], (error, results) => {
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length > 0) {
                res.status(409).send({ mensagem: 'Usuário já cadastrado' })
            } else {
                bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                    if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                    conn.query(
                        `INSERT INTO usuarios (email, senha) VALUES (?, ?)`,
                        [req.body.email, hash],
                        (error, result) => {
                            conn.release();
                            if (error) { return res.status(500).send({ error: error }) }
                            response = {
                                mensagem: 'Usuário criado com sucesso',
                                usuarioCriado: {
                                    id_usuario: result.insertId,
                                    email: req.body.email,
                                    senha: req.body.senha
                                }

                            }
                            return res.status(201).send(response);
                        })
                });
            }
        })
        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
             if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
             conn.query(
                `INSERT INTO usuarios (email, senha) VALUES (?, ?)`,
                [req.body.email, hash], 
                (error, result) => {
                    conn.release();
                    if (error) { return res.status(500).send({ error: error }) }
                    response = {                    
                        mensagem: 'Usuário criado com sucesso',
                        usuarioCriado: { 
                            id_usuario: result.insertId,                   
                            email: req.body.email,
                            senha: req.body.senha
                        }
                        
                    }
                    return res.status(201).send(response);
                })           
        });
    });
};



exports.login = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM usuarios WHERE email = ?`;
        conn.query(query, [req.body.email], (error, results, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length < 1) {
                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            }
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if (err) {
                    return res.status(401).send({ mensagem: 'Falha na autenticação' })
                }
                if (result) {
                    const token = jwt.sign({
                        id_usuario: results[0].id_usuario,
                        email: results[0].email,
                        senha: results[0].senha
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "720h"
                    });


                    return res.status(200).redirect('/home');                
                        
                    
                    
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            })

        })
    })
};