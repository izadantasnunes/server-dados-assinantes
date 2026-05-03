CREATE DATABASE IF NOT EXISTS server_dados_assinantes;
USE server_dados_assinantes;

CREATE TABLE assinantes (
    id_assinante INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    idade INT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    data_cadastro DATE DEFAULT (CURRENT_DATE)
);

CREATE TABLE enderecos (
    id_endereco INT PRIMARY KEY AUTO_INCREMENT,
    id_assinante INT NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(12),
    FOREIGN KEY (id_assinante) REFERENCES assinantes(id_assinante)
);

CREATE TABLE planos (
    id_plano INT PRIMARY KEY AUTO_INCREMENT,
    periodo ENUM('Mensal', 'Bimestral', 'Trimestral', 'Anual') NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status_plano ENUM('Ativo', 'Inativo') DEFAULT 'Ativo'
);

CREATE TABLE assinaturas (
    id_assinatura INT PRIMARY KEY AUTO_INCREMENT,
    id_assinante INT NOT NULL,
    id_plano INT NOT NULL,
    data_ativacao DATE NOT NULL,
    status_assinatura ENUM('Ativa', 'Cancelada', 'Vencida', 'Inadimplente') DEFAULT 'Ativa',
    FOREIGN KEY (id_assinante) REFERENCES assinantes(id_assinante),
    FOREIGN KEY (id_plano) REFERENCES planos(id_plano)
);

CREATE TABLE pagamentos (
    id_pagamento INT PRIMARY KEY AUTO_INCREMENT,
    id_assinatura INT NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL,
    data_pagamento DATE,
    status_pagamento ENUM('Pago', 'Pendente', 'Atrasado', 'Cancelado') DEFAULT 'Pendente',
    FOREIGN KEY (id_assinatura) REFERENCES assinaturas(id_assinatura)
);
