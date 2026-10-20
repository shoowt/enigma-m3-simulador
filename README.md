# ⚡ ENIGMA M3 vs. AES-256-GCM | Simulador Criptográfico 2.5D Skeuomórfico

> Projeto desenvolvido para Hackathon: Simulação de alta fidelidade histórica da máquina **Enigma M3 (1944)** operando em rede virtual de 4 estações com transporte **Air-Gapped via QR Code**, confrontada em tempo real com **Criptografia Moderna Autenticada (AES-256-GCM)** e laboratório de adulteração MITM (*Man-In-The-Middle*).

---

## 🚀 Como Executar o Projeto

O servidor de desenvolvimento já está pronto e em execução:
```bash
# Caso precise reiniciar:
npm run dev
```
Acesse no seu navegador: **`http://localhost:5173/`**  
*(Ou acesse pelo IP local no navegador do seu smartphone conectado ao mesmo Wi-Fi para testar a câmera de verdade!)*

---

## 🎯 Destaques de Engenharia & Diferenciais para os Jurados

### 1. Motor Histórico Fiel da Enigma M3 (`src/core/enigmaEngine.ts`)
- **Rotores I a V** com fiação histórica autêntica da Wehrmacht/Kriegsmarine.
- **Avanço mecânico com Double-Stepping:** O rotor do meio executa o duplo avanço mecânico clássico ao passar pela ranhura (*notch*).
- **Ajuste de Ringstellung (1 a 26)** e **Grundstellung (A a Z)**.
- **Refletor B e C (Umkehrwalze):** Involução perfeita $E(E(x)) = x$ e a falha de Alan Turing: **$E(x) \neq x$** (uma letra jamais cifra nela mesma).
- **Steckerbrett (Plugboard):** Permite até 10 conexões bilaterais com cabos dinâmicos em curvas de Bézier SVG simulando a gravidade.

### 2. Criptografia Moderna AES-256-GCM (`src/core/modernCrypto.ts`)
- Criptografia autenticada nativa via **Web Crypto API (SubtleCrypto)**.
- Derivação de chave via **PBKDF2 com 100.000 iterações de SHA-256**.
- IV aleatório de 96 bits + **Authentication Tag (GMAC) de 128 bits**.

### 3. Fator Uau: Laboratório de Adulteração MITM (Integridade de Dados)
- Botão interativo **"Adulterar 1 Bit no Trânsito (MITM)"**:
  - **Na Enigma:** A mensagem é decifrada com apenas 1 caractere corrompido, **sem nenhum aviso de segurança**, demonstrando a vulnerabilidade fatal de cifras sem integridade.
  - **No AES-256-GCM:** A verificação da Tag GHASH falha instantaneamente e o sistema bloqueia o acesso, exibindo um alerta vermelho crítico de violação.

### 4. Transporte Air-Gapped via QR Code e Arquivo `.enigma`
- Geração instantânea de QR Code com JSON compacto contendo metadados de rede, ciphertext Enigma e payload AES autenticado.
- Leitor via câmera frontal/traseira (HTML5-QRCode), suporte a upload de imagem de QR Code e colagem direta de JSON.

### 5. Áudio Procedural em Tempo Real (Web Audio API)
- Zero arquivos de áudio externos (sem latência de carregamento).
- Síntese acústica de impactos de tecla, rebote de mola metálica, giro de catraca dentada dos rotores, cliques de plugs elétricos e sirene de alarme de integridade.

---

## 📂 Estrutura Arquitetural

```
src/
├── core/
│   ├── enigmaEngine.ts       # Núcleo da Enigma M3 em TypeScript puro
│   ├── modernCrypto.ts       # AES-256-GCM nativo com detecção de violação
│   ├── keySheet.ts           # Folha de chaves militar mensal e estações
│   └── protocolPayload.ts    # Serialização do pacote Airgap
├── audio/
│   └── soundEffects.ts       # Sintetizador procedural com Web Audio API
├── styles/
│   └── skeuomorphic.css      # Texturas 2.5D: madeira envernizada, metal, lâmpadas, teclas
├── components/
│   ├── skeuomorphic/
│   │   ├── EnigmaCase.tsx    # Chassi completo com fita telegráfica
│   │   ├── RotorsUnit.tsx    # Janela mecânica com catracas
│   │   ├── Lampboard.tsx     # 26 lâmpadas com brilho incandescente
│   │   ├── Keyboard.tsx      # Teclado redondo com aro cromado
│   │   ├── Plugboard.tsx     # Soquetes e cabos SVG com curvatura gravitacional
│   │   └── TopLidModal.tsx   # Tampa articulada para troca de rotores
│   ├── modern/
│   │   ├── CryptoInspector.tsx # Split-view comparativo
│   │   ├── TamperLab.tsx       # Laboratório de ataque MITM
│   │   └── EntropyChart.tsx    # Comparativo de entropia e força bruta
│   ├── network/
│   │   ├── QRModal.tsx         # Transmissão QR Airgap
│   │   ├── QRScannerModal.tsx  # Câmera e leitor de pacotes
│   │   └── KeySheetModal.tsx   # Folha de chaves confidencial
│   └── layout/
│       ├── Header.tsx          # Barra superior de navegação
│       └── StationSelector.tsx # Seletor de estações de rádio
├── App.tsx                   # Orquestrador central de estado
└── main.tsx
```
