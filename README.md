# Portfolio GitHub Dinamico

MVP de portfolio que usa o GitHub como fonte de dados para montar uma vitrine de projetos publica e atualizavel.

## O que ja faz

- Carrega perfil publico do GitHub.
- Lista repositorios publicos nao arquivados e que nao sejam forks.
- Ordena projetos por demo online, descricao, estrelas e atividade recente.
- Mostra cards com linguagem, data de push, descricao, tags, estrelas, link do codigo e demo.
- Permite filtrar por linguagem ou topics do GitHub.
- Funciona em desktop e mobile.

## Como configurar

Por padrao o app usa o usuario `Chrisllan02`.

Para trocar:

```bash
VITE_GITHUB_USERNAME=seu-usuario npm run dev
```

Em deploys na Vercel, configure a env `VITE_GITHUB_USERNAME` se quiser usar outro usuario.

## Como rodar localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Proximos passos

- Adicionar paginas individuais por projeto.
- Criar curadoria via topics como `portfolio`, `featured`, `ai`, `frontend`.
- Buscar README de cada repositorio para gerar resumo.
- Adicionar cache server-side com token do GitHub para evitar limite publico.
- Conectar analytics e formulario de contato.
