const express = require('express');
const movimentacoesService = require('../services/movimentacoesService');
const movimentacoesModel = require('../models/movimentacoesModel');

const router = express.Router();

// Middleware para log de requisições
router.use((req, res, next) => {
    console.log(`Requisição ${req.method} em ${req.originalUrl} - Body:`, req.body);
    next();
});

// Rota para obter todas as movimentações
router.get('/', async (req, res) => {
    try {
        const movimentacoes = await movimentacoesModel.obterMovimentacoes();
        res.json(movimentacoes);
    } catch (err) {
        console.error('Erro ao buscar movimentações', err.message);
        res.status(500).send('Erro ao buscar movimentações');
    }
});

// Rota para criar uma nova movimentação
router.post('/', async (req, res) => {
    const { Data, Quantidade, Tipo, fk_Produto_ID, fk_Funcionario_ID, fk_Estoque_ID } = req.body;

    try {
        const novaMovimentacao = await movimentacoesService.criarMovimentacao(
            Data,
            Quantidade,
            Tipo,
            fk_Produto_ID,
            fk_Funcionario_ID,
            fk_Estoque_ID
        );
        console.log(novaMovimentacao)
        res.json(novaMovimentacao);
    } catch (err) {
        console.error('Erro ao inserir movimentação', err.message);
        res.status(500).send('Erro ao inserir movimentação', err.message);
    }
});

// Rota para atualizar uma movimentação
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    console.log("movimentacoesController.js id: ", id)
    const { Data, Quantidade, Tipo, fk_Produto_ID, fk_Funcionario_ID, fk_Estoque_ID } = req.body;
    console.log(`movimentacoesController.js data: ${Data}, qntd: ${Quantidade}, Tipo: ${fk_Tipo_ID}, produto: ${fk_Produto_ID}, funcionario: ${fk_Funcionario_ID}, estoque: ${fk_Estoque_ID}`)
    try {
        const movimentacaoAtualizada = await movimentacoesService.atualizarMovimentacao(
            id,
            Data,
            Quantidade,
            Tipo,
            fk_Produto_ID,
            fk_Funcionario_ID,
            fk_Estoque_ID
        );
        res.json(movimentacaoAtualizada);
    } catch (err) {
        console.error('Erro ao atualizar movimentação', err.message);
        res.status(500).send('Erro ao atualizar movimentação');
    }
});

// Rota para deletar uma movimentação
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await movimentacoesService.excluirMovimentacao(id);
        res.json({ deleted: true });
    } catch (err) {
        console.error('Erro ao deletar movimentação', err.message);
        res.status(500).send('Erro ao deletar movimentação');
    }
});

module.exports = router;
