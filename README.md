# Leitor Office Local (APK sem servidor)

Leitor de **.docx** e **.pptx** que roda 100% dentro do tablet Android, sem internet e sem servidor.
A renderização é feita em JavaScript (docx-preview e pptx-preview) dentro de um WebView (Capacitor).

## Como gerar o APK no GitHub
1. Crie um repositório e envie **todos** os arquivos desta pasta (inclusive `.github/workflows/build-apk.yml`).
2. Aba **Actions → Gerar APK → Run workflow** (ou faça um push na branch `main`).
3. Quando terminar (~5–8 min), abra a execução e baixe o artefato **leitor-office-apk**.
4. Dentro do zip está o `app-debug.apk`. Instale no tablet (permita "fontes desconhecidas").

## Limitações
- Só abre **.docx** e **.pptx**. Arquivos .doc, .ppt, .odt e .odp precisam ser salvos como docx/pptx antes.
- É um visualizador: não edita. Documentos complexos podem ter pequenas diferenças de layout em relação ao Word/PowerPoint.
- O APK é de depuração (debug). Para Play Store é preciso gerar versão assinada.
- Ícone do app: padrão do Capacitor (pode ser trocado depois com @capacitor/assets).

## Estrutura
- `src/main.js` – lógica do app
- `www/` – interface (HTML/CSS)
- `build.mjs` – empacota `src/main.js` + bibliotecas em `www/app.js`
- `capacitor.config.json` – configuração do app Android
