# Formulário PNS — Programa de Notificação Semanal

Formulário web para consolidação das notificações semanais de Doenças Imunopreveníveis do município de **Santo Antônio de Jesus - BA**.

Desenvolvido em parceria com **IFBA**, **UFRB**, **PET Saúde** e a **Secretaria Municipal de Saúde**.

## Sobre

O formulário coleta dados semanais de:

- **PFA** — Paralisia Flácida Aguda
- **Doenças Exantemáticas** — Sarampo, Rubéola, SRC
- **Tétano Acidental (TA)** e **Tétano Neonatal (TNN)**

Ao finalizar, os dados são exportados em formato **.CSV** para composição de relatórios e envio ao consolidado estadual.

## Unidades Notificantes

- UBS / USF (urbanas e rurais)
- Hospitais e UPA
- Centros Especializados e Laboratórios

Unidades rurais possuem **unidades satélites** vinculadas, que podem notificar junto à matriz.

## Tecnologias

- [SvelteKit](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS v4](https://tailwindcss.com/)
- [svelte-select](https://github.com/rob-balfre/svelte-select)
- Hospedagem estática via [`@sveltejs/adapter-static`](https://kit.svelte.dev/docs/adapter-static)

## Como rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Gerar build estático
npm run build
```

## Estrutura

```
src/
├── lib/
│   ├── assets/          # Logos e imagens
│   └── config/
│       └── options.ts   # Lista de unidades notificantes
├── routes/
│   └── +page.svelte     # Formulário principal
├── app.css              # Estilos globais
└── app.html             # Template base
```
