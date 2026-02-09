/* SelfControlDB_L�gico: */

CREATE TABLE Produto (
    ID INTEGER PRIMARY KEY,
    Nome VARCHAR,
    Valor DECIMAL,
    Descricao VARCHAR
);

CREATE TABLE Estoque (
    ID INTEGER PRIMARY KEY,
    Nome VARCHAR,
    Descricao VARCHAR,
    Local VARCHAR
);

CREATE TABLE Funcionario (
    ID INTEGER PRIMARY KEY,
    Nome VARCHAR,
    Cargo VARCHAR
);

CREATE TABLE ProdutoEstoque (
    ID INTEGER PRIMARY KEY,
    Quantidade INTEGER,
    fk_Produto_ID INTEGER,
    fk_Estoque_ID INTEGER
);

ALTER TABLE ProdutoEstoque ADD CONSTRAINT FK_ProdutoEstoque_2
    FOREIGN KEY (fk_Produto_ID)
    REFERENCES Produto (ID);
 
ALTER TABLE ProdutoEstoque ADD CONSTRAINT FK_ProdutoEstoque_3
    FOREIGN KEY (fk_Estoque_ID)
    REFERENCES Estoque (ID);

CREATE TABLE Movimentacoes (
    Data DATE,
    Quantidade INTEGER,
    ID INTEGER PRIMARY KEY,
    Tipo BOOLEAN,
    fk_TipoMovimentacoes_ID INTEGER,
    fk_Funcionario_ID INTEGER,
    fk_Estoque_ID INTEGER,
    fk_Produto_ID INTEGER
);



ALTER TABLE Movimentacoes ADD CONSTRAINT FK_Movimentacoes_2
    FOREIGN KEY (fk_TipoMovimentacoes_ID)
    REFERENCES TipoMovimentacoes (ID)
    ON DELETE RESTRICT;
 
ALTER TABLE Movimentacoes ADD CONSTRAINT FK_Movimentacoes_3
    FOREIGN KEY (fk_Funcionario_ID)
    REFERENCES Funcionario (ID);
 
ALTER TABLE Movimentacoes ADD CONSTRAINT FK_Movimentacoes_4
    FOREIGN KEY (fk_Estoque_ID)
    REFERENCES Estoque (ID);
 
ALTER TABLE Movimentacoes ADD CONSTRAINT FK_Movimentacoes_5
    FOREIGN KEY (fk_Produto_ID)
    REFERENCES Produto (ID);

CREATE TABLE TipoMovimentacoes (
    ID INTEGER PRIMARY KEY,
    Nome VARCHAR
);