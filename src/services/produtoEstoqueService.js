const produtoEstoqueModel = require('../models/produtoEstoqueModel');

const obterProdutoEstoque = async () => {
    try {
        return await produtoEstoqueModel.obterProdutoEstoque();
    } catch (error) {
        throw new Error('Erro ao obter ProdutoEstoque: ' + error.message);
    }
};

const vincularProdutoAoEstoque = async (produtoId, estoqueId, quantidade) => {
    try {
        const produtoEstoque = await produtoEstoqueModel.obterProdutoEstoquePorProdutoEEstoque(produtoId, estoqueId);

        if (produtoEstoque) {
            // Se já existe, atualizar a quantidade
            const existingQuantidade = produtoEstoque.quantidade + quantidade;
            return await produtoEstoqueModel.atualizarQuantidadeProdutoNoEstoque(produtoEstoque.id, produtoId, estoqueId, existingQuantidade);
        } else {
            // Caso contrário, inserir um novo registro
            return await produtoEstoqueModel.vincularProdutoAoEstoque(produtoId, estoqueId, quantidade);
        }
    } catch (error) {
        throw new Error('Erro ao vincular Produto ao Estoque: ' + error.message);
    }
};

const removerProdutoDoEstoque = async (produtoId, estoqueId) => {
    try {
        const produtoEstoque = await produtoEstoqueModel.obterProdutoEstoquePorProdutoEEstoque(produtoId, estoqueId);

        if (!produtoEstoque) {
            throw new Error('Produto não encontrado no estoque');
        }

        await produtoEstoqueModel.removerProdutoDoEstoque(produtoEstoque.id);
    } catch (error) {
        throw new Error('Erro ao remover Produto do Estoque: ' + error.message);
    }
};

const atualizarQuantidadeProdutoNoEstoqueService = async (produtoId, estoqueId, quantidade) => {
    try {
        const produtoEstoque = await produtoEstoqueModel.obterProdutoEstoquePorProdutoEEstoque(produtoId, estoqueId);
        if (!produtoEstoque) {
            throw new Error('Produto não encontrado no estoque.');
        }

        const novaQuantidade = produtoEstoque.quantidade + quantidade;
        console.log(`novaQuantidade: ${novaQuantidade}`)

        if (novaQuantidade < 0) {
            novaQuantidade = 0
        }
        return await produtoEstoqueModel.atualizarQuantidadeProdutoNoEstoqueModel(produtoEstoque.id, produtoId, estoqueId, novaQuantidade);
    } catch (error) {
        throw new Error('Erro ao atualizar quantidade de Produto no Estoque (Service): ' + error.message);
    }
};

const obterProdutosPorEstoque = async (estoqueId) => {
    try {
        return await produtoEstoqueModel.obterProdutosPorEstoque(estoqueId);
    } catch (error) {
        throw new Error('Erro ao obter produtos por estoque: ' + error.message);
    }
};
    
const verificarExistenciaProdutoNoEstoque = async (produtoId, estoqueId) => {
    console.log("produtoID:", produtoId, "estoqueID:", estoqueId)
    try {
        const produtoEstoque = await produtoEstoqueModel.obterProdutoEstoquePorProdutoEEstoque(produtoId, estoqueId);
        return produtoEstoque !== null;
    } catch (error) {
        throw new Error('Erro ao verificar existência do Produto no Estoque: ' + error.message);
    }
};

const obterQuantidadeProdutoNoEstoque = async (produtoId, estoqueId) => {
    try {
        const produtoEstoque = await produtoEstoqueModel.obterProdutoEstoquePorProdutoEEstoque(produtoId, estoqueId);
        if (!produtoEstoque) {
            throw new Error('Produto não encontrado no estoque.');
        }
        return produtoEstoque.quantidade;
    } catch (error) {
        throw new Error('Erro ao obter quantidade de Produto no Estoque: ' + error.message);
    }
};

module.exports = {
    obterProdutoEstoque,
    vincularProdutoAoEstoque,
    removerProdutoDoEstoque,
    atualizarQuantidadeProdutoNoEstoqueService,
    obterProdutosPorEstoque,
    verificarExistenciaProdutoNoEstoque,
    obterQuantidadeProdutoNoEstoque
};