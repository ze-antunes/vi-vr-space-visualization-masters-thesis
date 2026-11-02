# Implementação e validação — 18 de outubro de 2026

O projeto continua a ser uma experiência VR, com os painéis originais e sem dashboard HTML. As alterações estão na pasta de trabalho; não foi feito commit nem deploy.

## Comparação conforme o esboço do autor

A referência roxa foi removida. Compare A / B apresenta duas cenas independentes, lado a lado, com os cartões de métricas A/B lado a lado na mesma consola de análise. O utilizador seleciona o cabeçalho A ou B e escolhe a respetiva manobra na lista original. Cada cena conserva seleção, orientação, escala visual e relógio próprios; o transporte pode ser independente ou ligado explicitamente. As duas usam a mesma conjunção, a mesma escala local e o mesmo fator de apresentação das covariâncias, permitindo comparação coerente.

Os painéis apresentam PoC e miss distance fornecidos, diferenças face ao baseline, delta-v, consumo de combustível tal como aparece no dataset e duração. A unidade de combustível não foi confirmada num contrato externo, pelo que a UI identifica esse valor como dado do ficheiro, sem lhe atribuir kg. A distância instantânea estimada pelo modelo aparece separadamente da miss distance fornecida.

## Consolidação UX: duas superfícies permanentes

O catálogo alterna entre Conjunctions e Manoeuvres. A seleção de uma conjunção abre as respetivas manobras, com indicação da simulação que está a ser editada. A ordenação por PoC, miss distance e delta-v conserva os índices originais dos dados. O catálogo pode ser ocultado e pode acompanhar apenas a mão esquerda.

A consola reúne quatro separadores: Analyse (métricas A/B e transporte temporal), Display (apresentação e escala), Details (épocas, combustível, duração e baseline), Help (comandos e limites). Os cabeçalhos A/B escolhem a cena editada. Não se abrem popups automaticamente ao selecionar manobras; os ícones de informação encaminham para a ajuda da consola. A pesquisa e os dados de um objeto continuam a ser interações contextuais temporárias. O teclado aparece diante do POV ao abrir, e fecha quando o catálogo é ocultado ou muda de separador.

Focus reduz a consola à navegação. Expandir ou mudar de separador repõe o conteúdo sem alterar as seleções. A posição do espaço de trabalho é capturada no POV ao recentrar, não em cada movimento de cabeça ou alteração de opção. Alterar colunas ou prender/desprender o catálogo não desloca os modelos.

## Animação e controlo temporal

Uma linha temporal comum controla a simulação ativa. Pode ser arrastada com o rato ou com trigger mantido num controlador. Há reprodução/pausa, TCA, início, passos, sentido inverso, multiplicadores de velocidade e looping opcional. Por omissão a reprodução para no extremo, sem um salto automático para o início.

Link A/B sincroniza offsets relativos aos respetivos TCAs, mantendo os dois instantes absolutos identificáveis em Details. Desligar a opção devolve controlo independente. Mudar uma manobra ligada repõe os dois relógios; em modo independente repõe apenas a cena editada. Rastos sólidos móveis distinguem o segmento recente das curvas tracejadas de contexto.

Comandos Meta Touch: A direito reproduz/pausa; B alterna Globe/Room; X esquerdo mostra/esconde catálogo; Y recentra a área de trabalho. O thumbstick direito altera o tempo no eixo horizontal e a escala da cena ativa no vertical, com dead zone e limites. Trigger seleciona/arrasta tempo; grip move a cena. Teclado: Space, T, C, F e [ / ] completam os atalhos existentes. Os eventos foram exercitados em browser, sem afirmar validação num headset real.

## Globo, câmara e enquadramento

- Mantida a esfera completa e a escala uniforme. A iluminação responde ao ângulo solar e conserva dia/noite e atmosfera.
- A câmara de pré-visualização passou de FOV 110° para 60°. O enquadramento adapta a distância ao aspect ratio. A projeção imersiva continua a ser determinada pelo headset.
- Repostos os look-controls: arrastar com o botão esquerdo olha em redor; WASD desloca a câmara. O botão direito roda apenas a simulação apontada; a roda altera uniformemente a escala dessa cena, com limites. R repõe posição/orientação da câmara e enquadramento.
- As superfícies da sala continuam opacas, com frente e teto abertos. O culling exterior permite observar o interior ao rodar a cena.
- Os painéis renderizam numa camada de informação com depth test desligado, conservando a ordenação de profundidade entre os próprios painéis/popups. As paredes, Terra e trajetórias deixam de recortar os cartões.
- Os painéis complementares usam fundo #121212, cartões #505050, cantos arredondados, Roboto branca e contorno amarelo #FFBE0B na seleção, retomando a linguagem dos mockups. Os cartões e os ícones originais foram conservados; a organização dos controlos passou a usar catálogo e consola com separadores.

## Escala para análise

O globo apresenta contexto orbital; a sala amplia a geometria local. Não se tenta tornar uma separação de um quilómetro legível à escala física da Terra.

Na sala, os pontos são apresentados num referencial EME2000 em translação que acompanha a trajetória baseline do alvo, sem rodar os eixos. A subtração dessa translação comum conserva as distâncias simultâneas entre objetos. Os limites consideram todos os candidatos e a janela de aproximação, não apenas a seleção atual. A e B usam a mesma transformação.

Position focus é a configuração inicial. As posições mantêm escala uniforme. As covariâncias baseline recebem um fator visual uniforme adicional, calculado uma vez por conjunção e indicado nos painéis, para não ocuparem toda a sala. Os três semieixos recebem o mesmo fator: forma, orientação e proporções entre covariâncias são preservadas. O volume exibido neste modo não tem a escala física das posições. Desativar Position focus repõe fator 1 e enquadra os envelopes físicos a 3 sigma; nesse modo as separações ficam naturalmente menores.

Os modelos têm tamanho simbólico (0.075 unidades no globo; 0.28/0.23 na sala antes da escala da vista). Não representam dimensões físicas dos satélites.

## Trajetórias e reprodução

São calculadas trajetórias de coasting com integração RK4 da gravitação central terrestre, em unidades SI, a partir dos estados posição/velocidade fornecidos. A propagação funciona para tempos positivos e negativos.

- Globo: 5700 s de trajetória tracejada para contexto orbital. O relógio de cada cena explora ±300 s à volta do TCA, com passos de 60 s e reprodução independente.
- Sala: janela ±0.5 s, passos de 0.1 s e reprodução em câmara lenta. As curvas mostram movimento relativo, sem a grande translação orbital comum.
- O alvo pós-manobra parte do estado fornecido no respetivo TCA. Os estados baseline são propagados até esse mesmo instante; as frações de TCA abaixo do milissegundo são conservadas.
- Mudar de vista devolve os relógios a TCA. Mudar de manobra repõe apenas o relógio da cena editada.
- Não se simulam os impulsos, low thrust, arrasto, J2 ou terceiros corpos. A covariância não é propagada; os volumes e projeções da sala continuam associados ao epoch baseline, explicitamente identificado. Não é criado um envelope pós-manobra.

**Diferença encontrada na amostra:** para a primeira manobra Swarm-B, o modelo que alinha o chaser no TCA do candidato obtém aproximadamente 3421 m de separação, enquanto o ficheiro fornece miss distance de aproximadamente 4702 m. Para o candidato #100, os dois valores em TCA coincidem (aproximadamente 1109 m). Isto não demonstra por si um erro no fornecedor: a solução orbital de referência e o modelo podem diferir. Demonstra que não se deve apresentar esta propagação simplificada como reprodução validada das previsões fornecidas.

As curvas e a separação estimada têm rótulos próprios. A PoC e a miss distance fornecidas continuam separadas. Não se calcula uma nova PoC nem se confunde sobreposição visual de elipses com probabilidade de colisão.

Fundamentação do modelo e limites: [CelesTrak — Orbital Propagation](https://www.celestrak.org/columns/v01n01/), [CelesTrak — Orbital Coordinate Systems](https://www.celestrak.org/columns/v02n01/). A [ESA descreve os elementos usados na análise de risco](https://www.esa.int/Space_Safety/Space_Debris/Reentry_and_collision_avoidance): distância, geometria, dimensões e incertezas orbitais.

## Funcionalidades conservadas

Pesquisa por nome/COSPAR dos dois objetos, teclado 3D e escrita física sem ativar WASD, paginação completa, uma/duas colunas, informação original e controlos com ambas as mãos. Covariâncias RTN são transformadas para EME2000 e para a cena com os semieixos proporcionais às raízes dos valores próprios. As seis projeções nas paredes são elipses ortográficas dos envelopes baseline.

A inicialização aguarda dados e recursos, apresenta erros e permite repetir. Recursos partilham carregamento por URL, mas as instâncias visuais são clonadas para as duas simulações. O ciclo de atualização pertence ao A-Frame. Os componentes UI e os recursos das trajetórias são removidos quando substituídos.

## Validação

- Lint, build e onze testes numéricos: referenciais, escala, covariância/projeções, dados, paginação, propagação, reversibilidade, precisão temporal e conservação da separação no referencial móvel, paragem e looping nos dois sentidos.
- Dezassete testes Chromium: painéis, seleção/paginação, carregamento e recuperação, ausência de manobras, estabilidade de recursos, dois controladores, projeções, pesquisa, seleção/relógios independentes, olhar/rotação separados e enquadramento em 1440×1000, 1280×720 e 800×1000, duas superfícies permanentes, separadores/modo compacto, arrasto temporal com relógios ligados, paragem/reversão, comandos VR e ordenação que conserva IDs. A projeção dos vértices reais dos painéis verifica o enquadramento sem confundir os cantos de uma AABB com a superfície inclinada. As esferas são verificadas em escala mundial e na projeção nesses enquadramentos.
- Inspeção de capturas do globo, duas cenas, sala ampliada e novos painéis. Capturas ficam em `test-results/` e não entram no Git.

```sh
npm run check
# PowerShell: testar o build em produção
$env:TEST_PRODUCTION='1'
npm run test:e2e
```

Estes testes não substituem avaliação de tracking, leitura e conforto num headset físico, nem validam precisão operacional das trajetórias.

## Dependências

Mantidas as versões revistas: A-Frame 1.8.0, three-mesh-ui 6.5.4, mathjs 15.2.0, lil-gui 0.21.0, Vite 8.3.4 e vite-plugin-glsl 1.6.2. Three é um alias para super-three 0.184.0, deduplicado e alinhado com A-Frame. Esta iteração não acrescenta dependências. A última auditoria completa reportou zero vulnerabilidades. O build mantém o aviso de bundle superior a 500 kB, por incluir A-Frame.

## Trabalho que ainda exige validação

Para reconstruir a execução CP→TCA, os parâmetros de ignição e delta-v existentes devem ser ligados a um estado pré/pós-impulso confirmado, com referenciais/unidades verificados e comparação com efemérides do fornecedor. Para low thrust/drag são necessários um modelo e parâmetros adequados. Propagar a incerteza requer um modelo próprio de dinâmica/covariância e validação adicional. Esta versão apresenta aproximações explicitamente identificadas, sem inventar dados em falta.
