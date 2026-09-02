# Itaitinga MTB Race — Site Público + Inscrições

## Compatibilidade com o Painel Administrativo

Esta versão do site público foi ajustada para usar a estrutura atual da planilha utilizada pelo Painel ADM.

### Aba Inscrições

A estrutura esperada é:

1. NumeroInscricao
2. Nome
3. CPF
4. Email
5. Telefone
6. Categoria
7. Pagamento
8. StatusInscricao
9. Valor
10. DataInscricao
11. Observacao

A inscrição pública sempre inicia com:

- Pagamento = Pendente
- StatusInscricao = Pendente

O valor é obtido automaticamente da categoria cadastrada no painel.

### Aba Configurações

O site lê a configuração `Categorias` da aba `Configurações`.

Formato esperado:

`[{"nome":"Elite Masculino","valor":80},{"nome":"Elite Feminino","valor":80}]`

Assim, quando uma categoria ou valor for alterado no painel, o formulário público passa a usar a configuração atual da planilha.

### Dados adicionais

A nova estrutura da aba Inscrições não possui colunas separadas para:

- Data de nascimento
- Cidade
- Contato de emergência

Esses dados continuam sendo recebidos pelo formulário e são gravados no campo `Observacao`, preservando a lógica do formulário sem criar novas colunas.

## Apps Script

Substitua o código do projeto público pelo arquivo:

`google-apps-script/Code.gs`

Depois publique uma nova versão da implantação do Web App.

A URL usada pelo site continua configurada em:

`js/main.js`


## Integração com o Painel ADM
O formulário público usa os mesmos campos do cadastro do Painel ADM: nome, CPF, categoria, e-mail e WhatsApp. Pagamento e status são criados como Pendente. O valor é calculado no Apps Script a partir da categoria cadastrada na aba Configurações.
