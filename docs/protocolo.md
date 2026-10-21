# Protocolo de mensagem — versão 2

O transporte é um JSON UTF-8 em QR Code ou arquivo `.enigma`. Pacotes v1 são recusados por incluírem material que não deve circular no canal. Gere novos pacotes após a atualização.

## Campos

| Campo | Tipo / regra | Finalidade |
| --- | --- | --- |
| `v` | número, exatamente `2` | Versão |
| `net.src` | ALPHA, U47, BLETCHLEY ou OUTPOST | Remetente declarado |
| `net.dst` | estação existente, diferente de src | Destinatário; deve coincidir com a estação receptora |
| `net.keyId` | `1944-06-DD`, dia 01–30 | Indicador; deve coincidir com o dia carregado localmente |
| `net.ts` | inteiro positivo em milissegundos Unix | Identificação temporal da sessão; não impede replay |
| `enigma.ground` | três letras A–Z em um array | Posição inicial pública da mensagem |
| `enigma.ct` | 1–2000 letras A–Z, sem espaços | Cifra Enigma |
| `modern.algo` | `AES-256-GCM` | Algoritmo |
| `modern.iv` | Base64 canônico de 12 bytes | IV aleatório por cifragem |
| `modern.salt` | Base64 canônico de 16 bytes | Salt aleatório por derivação |
| `modern.tag` | Base64 canônico de 16 bytes | Tag de autenticação |
| `modern.ct` | Base64 canônico de bytes não vazios | Cifra AES, sem a tag concatenada |
| `modern.keyDerivation` | `PBKDF2-SHA256-100000` | Derivação AES de 256 bits com 100.000 iterações |

Todos os campos são obrigatórios. Campos extras, versão desconhecida, formato inválido, estruturas incompletas e pacotes maiores que 12.000 caracteres são recusados. A geração de QR é limitada a 2.000 bytes UTF-8 do JSON para evitar exceder a capacidade de um único símbolo; arquivos podem carregar mensagens maiores dentro dos limites do protocolo.

## Chaves e autenticação

A configuração secreta Enigma (ordem dos rotores, anéis, refletor e plugboard) é carregada localmente nos dois aparelhos, pela folha ou por combinação manual. Não é transmitida. A posição inicial da mensagem é pública neste protocolo didático simplificado; não se reproduz o procedimento histórico completo de indicadores.

A senha AES é digitada em ambos os aparelhos, sem tamanho mínimo, exigindo apenas que não esteja vazia, e deve ser combinada fora do QR. Não há senha padrão nem senha calculada a partir do cabeçalho. O salt e IV são públicos; não substituem a senha.

A autenticação usa `additionalData` do AES-GCM com os bytes UTF-8 desta representação canônica, produzida com `JSON.stringify`:

```text
[2, src, dst, keyId, ts, [posiçãoEsquerda, posiçãoMeio, posiçãoDireita], cifraEnigma]
```

A ordem das propriedades do JSON externo não importa. Alterar os valores acima invalida a tag. A cifra AES e os parâmetros criptográficos também são necessários para autenticação bem-sucedida. Não existe campo `tampered` confiável: o receptor verifica a tag matematicamente.

## Recepção

1. Validar estrutura, versão, tamanhos, Base64 e estações.
2. Conferir destinatário e indicador de chave com os valores locais. Nunca trocar automaticamente a identidade da máquina receptora.
3. Derivar a chave da senha local e salt recebido; validar e decifrar AES com o cabeçalho canônico.
4. Processar a cifra Enigma usando a configuração local e a posição inicial recebida. Sua saída é explicitamente não autenticada e pode ser ilegível.
5. Exibir sucesso AES somente após autenticação. Em falha, não revelar texto AES; informar senha incorreta ou adulteração sem afirmar qual delas ocorreu.

## Ameaças e limites

O QR pode ser lido ou alterado por terceiros. Texto original, senha e configuração Enigma completa não aparecem no pacote. A folha Enigma incluída no projeto é pública e didática, portanto não protege informações reais. AES depende da qualidade da senha: uma senha fraca continua vulnerável a tentativas offline, mesmo com PBKDF2.

Todos os participantes conhecem a mesma senha: a tag não fornece assinatura digital, não distingue individualmente os detentores e não impede que um deles declare outro remetente. Repetir um pacote válido é possível; não há armazenamento de identificadores para bloquear replay.

A demonstração MITM altera uma letra do ciphertext Enigma e um bit do ciphertext AES, depois executa os motores novamente. A Enigma retorna uma letra incorreta sem detectar a mudança; AES rejeita a autenticação. A interface só prepara um novo QR quando a cifragem assíncrona corresponde ao texto, senha e cabeçalho atuais.
