# ⚡ ENIGMA M3 vs. AES-256-GCM | Simulador Criptográfico 2.5D Skeuomórfico

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Web Crypto API](https://img.shields.io/badge/Web_Crypto_API-SubtleCrypto-orange)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural_Synth-blueviolet)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![QA Tests](https://img.shields.io/badge/QA_Tests-21%2F21_PASS_(100%25)-brightgreen)](https://github.com/shoowt/enigma-m3-simulador)
[![Deploy Render](https://img.shields.io/badge/Deploy-Render_Ready-46E3B7?logo=render&logoColor=white)](https://render.com/)

> **Desafio 2 — Comunicação Segura: Enigma × Criptografia Moderna**  
> Simulação histórica de alta fidelidade da máquina eletromecânica **Enigma M3 (1944)** operando em rede virtual de até 4 estações com transporte **Air-Gapped via QR Code**, confrontada em tempo real com a robustez da **Criptografia Autenticada Moderna (AES-256-GCM)**, Modo Bletchley Park (Alan Turing Crib Attack), Rastreador de Circuito Elétrico 12V e Laboratório de Ataque MITM (*Man-In-The-Middle*).

---

## 🧭 Demonstração Rápida & Como Executar

### 💻 1. Rodando Localmente
```bash
# Clone o repositório
git clone https://github.com/shoowt/enigma-m3-simulador.git
cd enigma-m3-simulador

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
Acesse no navegador: **`http://localhost:5173/`**  
*(Dica: acesse pelo IP local no navegador do seu smartphone conectado ao mesmo Wi-Fi para usar a câmera real e ler QR Codes entre computadores e celulares!)*

### 🧪 2. Executando os Testes Automatizados de QA
```bash
npm test
```
*Executa a suíte de 21 testes unitários e de integração criptográfica em Node/TypeScript com relatório detalhado de validação.*

### 📦 3. Compilando para Produção
```bash
npm run build
```
*Gera o pacote otimizado e minificado no diretório `dist/`.*

---

## 🎯 Destaques de Engenharia & Requisitos Atendidos

### 1. Máquina Enigma M3 Imersiva e Skeuomórfica 2.5D
* **Rotores Históricos I a V:** Modelagem exata das fiações internas originais da Wehrmacht e Kriegsmarine.
* **Mecânica Autêntica de Double-Stepping:** Reprodução da anomalia mecânica onde o rotor intermediário avança duas vezes consecutivas ao passar pela ranhura (*notch*).
* **Anéis e Posições Iniciais:** Configuração completa de **Ringstellung** (1 a 26) e **Grundstellung** (A a Z).
* **Refletores UKW-B e UKW-C (Umkehrwalze):** Involução perfeita $E(E(x)) = x$ e a falha de projeto que selou o destino da Enigma: **$E(x) \neq x$** (uma letra jamais cifra nela mesma).
* **Painel de Plugues (Steckerbrett):** Permite ligar até 10 pares de cabos bilaterais com animação SVG e curvas de Bézier dinâmicas simulando o peso e a gravidade dos cabos reais.
* **Teclado, Lampboard e Fita Telegráfica:** Teclas mecânicas redondas com aro metálico cromado, 26 lâmpadas incandescentes com brilho difuso e fita de papel impressora que avança a cada digitação.
* **Áudio Procedural com Web Audio API:** Zero arquivos MP3/WAV externos. Síntese física de impacto mecânico de haste, rebote de mola, catraca dos rotores, cliques elétricos de plugs e alarme dissonante de violação de integridade (<10ms de latência).

---

### 2. Modo Bletchley Park • Alan Turing Crib Attack (Hut 8)
* **Exploração da Falha Fatal $E(x) \neq x$:** Demonstra na prática como Alan Turing e Gordon Welchman quebraram as cifras da Enigma sem recorrer à força bruta nos **$1,58 \times 10^{20}$** (158 quintilhões) de estados possíveis.
* **4 Transmissões Interceptadas Reais da Segunda Guerra Mundial:**
  1. **Boletim Meteorológico U-Boat (Atlântico):** Submarino U-559 com a palavra provável (*crib*) `WETTER` (o ataque real mais emblemático de Bletchley Park).
  2. **Ordem Tática Naval (Königsberg):** Transmissão com crib `ATAQUE`.
  3. **Despacho do Alto Comando (Berlim):** Transmissão do Oberkommando com crib `COMANDO`.
  4. **Tráfego Aéreo Luftwaffe (Mediterrâneo):** Mensagem de rotas com crib `BERLIN`.
* **Slider Interativo & Mapa de Varredura da Bombe:**
  * O operador desliza a palavra provável sobre a cifra, observando colisões imediatas destacadas em **vermelho pulsante** onde $Cifra[i] == Crib[i]$.
  * Minimap com indicadores de status para cada offset (`0: ❌`, `1: ✅`, `2: ❌`...).
  * Cálculo em tempo real da taxa de eliminação de posições (frequentemente >80%), demonstrando como a máquina eletromecânica *Bombe* reduzia o trabalho a minutos.

---

### 3. Rastreador de Circuito Elétrico 12V (Circuit Tracer)
* **Visualização Passo a Passo da Corrente Elétrica:**
  * Inspeciona em tempo real os **11 estágios físicos** que a corrente contínua de 12V percorre a cada tecla pressionada:
    1. `Tastatur` (Tecla pressionada)
    2. `Steckerbrett [In]` (Plugboard frontal)
    3. `Rotor Direito [Direto]`
    4. `Rotor Médio [Direto]`
    5. `Rotor Esquerdo [Direto]`
    6. `Umkehrwalze` (Refletor B/C)
    7. `Rotor Esquerdo [Reverso]`
    8. `Rotor Médio [Reverso]`
    9. `Rotor Direito [Reverso]`
    10. `Steckerbrett [Out]` (Plugboard saída)
    11. `Glühlampenfeld` (Lâmpada de 12V acesa)

---

### 4. Criptografia Moderna Autenticada (AES-256-GCM + PBKDF2)
* **Motor Baseado na Web Crypto API (SubtleCrypto):** Criptografia de nível bancário e governamental executada no hardware nativo do navegador.
* **Derivação Segura via PBKDF2:** 100.000 iterações com SHA-256 e Salt criptográfico.
* **Cifra Autenticada (AEAD):**
  * Vetor de Inicialização (IV) exclusivo de 96 bits para cada mensagem.
  * Tag de Autenticação GHASH (GMAC) de 128 bits garantindo confidencialidade e integridade simultâneas.

---

### 5. Laboratório de Adulteração MITM (Man-In-The-Middle)
* **Comparação Prática de Integridade de Dados:**
  * Botão interativo **"Adulterar 1 Bit no Trânsito (MITM)"**:
    * **Na Enigma:** A mensagem decifra com um único caractere errado, **sem qualquer aviso ou alarme de segurança**. O operador humano não sabe que a mensagem foi manipulada por um espião.
    * **No AES-256-GCM:** A validação da Tag GHASH falha instantaneamente na camada matemática, e o sistema **bloqueia totalmente a decifração**, exibindo alerta vermelho crítico de violação de integridade.

---

### 6. Protocolo de Rede Air-Gapped via QR Code & Arquivo `.enigma`
* **Transmissão Segura Sem Dependência de Internet:**
  * Geração instantânea de QR Code contendo o pacote `EnigmaPayload` serializado.
  * Leitor óptico responsivo com suporte a câmeras frontal e traseira de smartphones, upload de imagem do QR Code e colagem direta de texto JSON.
* **Decifração Automática e Sincronização Enigma:**
  * Ao receber uma transmissão via QR Code, o sistema decifra a mensagem síncronamente na Enigma original e anima a fita e as lâmpadas acendendo letra por letra!
* **Download de Arquivo `.enigma`:** Permite transportar a mensagem cifrada por pendrive ou canal isolado.

---

### 7. Folha de Chaves Mensal Militar (Tagesschlüssel) & Rede de 4 Estações
* **Manual Confidencial de 30 Dias:** Tabela com chave do dia, ordem dos rotores (Walzenlage), posições dos anéis (Ringstellung), grupos indicadores (Grundstellung) e pares de cabos do plugboard.
* **4 Estações Militares Cadastradas:**
  * 🌊 `U-559` — Submarino do Atlântico Norte
  * 🏛️ `HQ-BERLIN` — Alto Comando do Exército
  * ⚓ `KÖNIGSBERG` — Base Naval do Báltico
  * 🦅 `LUFT-SICILIA` — Esquadra Aérea do Mediterrâneo

---

## 🧪 Relatório da Suíte de Testes Automatizados (QA)

O projeto conta com uma suíte de testes de regressão e validação matemática executada via `npm test` (`tests/qa_suite.ts`). Todos os 21 testes operam com **100% de taxa de aprovação**:

```
==================================================================
  ENIGMA M3 SIMULATOR — AUTOMATED QA TEST SUITE
==================================================================

[Suite 1: Enigma M3 Core Mechanics & Historical Accuracy]
  ✔ PASS 1.1 Rotores I a V possuem 26 letras únicas e turnovers históricos
  ✔ PASS 1.2 Refletores UKW-B e UKW-C são involuções perfeitas sem letras fixas (E(x) != x)
  ✔ PASS 1.3 Princípio Recíproco: E(E(M)) = M em toda a gama de caracteres
  ✔ PASS 1.4 Falha Geométrica de Alan Turing: Nenhuma letra cifra em si mesma (0% auto-cifra)
  ✔ PASS 1.5 Mecânica de Avanço Simples (Right Rotor Stepping)
  ✔ PASS 1.6 Anomalia Histórica de Double-Stepping (Avanço duplo do rotor do meio)
  ✔ PASS 1.7 Configuração de Anéis (Ringstellung / Rings) altera a cifra matematicamente
  ✔ PASS 1.8 Plugboard (Steckerbrett) troca cabos antes e depois dos rotores
  ✔ PASS 1.9 Rastreamento Elétrico do Circuito 12V (traceChar) retorna 11 estágios

[Suite 2: Criptografia Moderna (AES-256-GCM & PBKDF2)]
  ✔ PASS 2.1 Cifragem e decifragem correta com AES-256-GCM
  ✔ PASS 2.2 Ataque MITM / Adulteração de 1 bit: AES-GCM bloqueia por falha de integridade MAC
  ✔ PASS 2.3 Chave Incorreta: AES-256-GCM rejeita decifração
  ✔ PASS 2.4 Unicidade do IV: Cada cifragem gera IV aleatório de 96 bits

[Suite 3: Protocolo Air-Gap & Sincronização Ponta-a-Ponta]
  ✔ PASS 3.1 Serialização e desserialização de EnigmaPayload
  ✔ PASS 3.2 Transmissão e Recepção Ponta-a-Ponta em TODOS os dias da folha de chaves
  ✔ PASS 3.3 Mensagem longa (>100 caracteres) com múltiplos turnovers

[Suite 4: Modo Bletchley Park (Alan Turing Crib Attack Engine)]
  ✔ PASS 4.1 Detecção de Colisão Fatal (Crash E(x) == x)
  ✔ PASS 4.2 Cálculo da Taxa de Eliminação de Turing

[Suite 5: Folha de Chaves Mensal Militar & Integridade de Rede]
  ✔ PASS 5.1 Integridade dos pares de cabos no Plugboard da folha de chaves
  ✔ PASS 5.2 Grupos indicadores (Grundstellung) são válidos em A-Z
  ✔ PASS 5.3 Rede de 4 estações virtuais cadastradas

==================================================================
  RELATÓRIO FINAL: 21/21 APROVADOS (100.0%) | 0 FALHAS
==================================================================
```

---

## 🌐 Deploy no Render

O projeto está configurado para deploy automático como **Static Site** no Render:

| Parâmetro | Valor Configurado |
| :--- | :--- |
| **Build Command** | `npm run build` |
| **Publish Directory** | `dist` |
| **Node Version** | `18+` / `20+` / `24+` |

---

## 📁 Estrutura do Código

```
enigma-m3-simulador/
├── src/
│   ├── core/
│   │   ├── enigmaEngine.ts       # Máquina Enigma M3 (fiação, double-stepping, refletores)
│   │   ├── modernCrypto.ts       # Motor AES-256-GCM com Web Crypto API e simulação MITM
│   │   ├── keySheet.ts           # Folha de chaves de 30 dias e estações militares
│   │   └── protocolPayload.ts    # Protocolo de empacotamento Airgap
│   ├── audio/
│   │   └── soundEffects.ts       # Síntese física de som com Web Audio API
│   ├── components/
│   │   ├── skeuomorphic/
│   │   │   ├── EnigmaCase.tsx    # Chassi em madeira, fita telegráfica e controles
│   │   │   ├── RotorsUnit.tsx    # Visualização e regulagem dos 3 rotores
│   │   │   ├── Lampboard.tsx     # 26 lâmpadas incandescentes de 12V
│   │   │   ├── Keyboard.tsx      # Teclado físico clicável com aro metálico
│   │   │   ├── Plugboard.tsx     # Cabos dinâmicos bilaterais com curva de Bézier
│   │   │   └── TopLidModal.tsx   # Tampa articulada para seleção de rotores I a V
│   │   ├── modern/
│   │   │   ├── CryptoInspector.tsx # Split-view comparativo Enigma vs AES
│   │   │   ├── TamperLab.tsx       # Laboratório de ataque MITM e integridade
│   │   │   ├── EntropyChart.tsx    # Comparativo de entropia e força bruta
│   │   │   └── WrongKeyProof.tsx   # Demonstração de falha com chave incorreta
│   │   ├── modals/
│   │   │   ├── BletchleyParkModal.tsx # Modo Alan Turing Crib Attack (Hut 8)
│   │   │   └── CircuitTracerModal.tsx # Rastreador dos 11 estágios da corrente 12V
│   │   ├── network/
│   │   │   ├── QRModal.tsx         # Transmissão QR Code Airgap e download .enigma
│   │   │   ├── QRScannerModal.tsx  # Câmera mobile/desktop e leitor de pacotes
│   │   │   ├── KeySheetModal.tsx   # Folha de chaves confidencial militar
│   │   │   └── ReceivedMessageModal.tsx # Mensagem recebida e decifração automática
│   │   └── layout/
│   │       ├── Header.tsx          # Barra de navegação com status e atalhos
│   │       └── StationSelector.tsx # Seletor das 4 estações de rádio
│   ├── types/
│   │   └── crypto.ts             # Tipagens TypeScript para rotores, payloads e chaves
│   ├── styles/
│   │   └── skeuomorphic.css      # Efeitos 2.5D: madeira, baquelite, latão e lâmpadas
│   ├── App.tsx                   # Orquestrador central e máquina de estados
│   └── main.tsx
├── tests/
│   └── qa_suite.ts               # Suíte automatizada com 21 testes unitários e de integração
├── package.json
└── README.md
```

---

## 📜 Licença e Contexto Acadêmico

Este projeto foi construído para demonstração educacional e competição de segurança da informação, homenageando os feitos de **Marian Rejewski**, **Jerzy Różycki**, **Henryk Zygalski**, **Alan Turing** e **Gordon Welchman** na quebra dos códigos do Eixo e contrastando a fragilidade das cifras mecânicas históricas com a robustez da criptografia pós-moderna.

