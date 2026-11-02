# Revisão do projeto — 18 de outubro de 2026

## Âmbito e conclusão

Revisão da aplicação em `src`, configuração, dependências, dados de exemplo, organização das explorações e documentação. Foram consultadas por extração de texto as secções de dados, desenvolvimento, avaliação e conclusões da dissertação (capítulos 8–11), além de secções de design. Não foi feita revisão integral da redação nem inspeção visual de todas as páginas da tese. As explorações foram analisadas como arquivo de protótipos; não foram executadas individualmente.

A ideia das duas escalas de exploração — globo para contexto e sala para proximidade — merece ser preservada. O problema principal é que algumas transformações gráficas alteram o significado dos dados. Corrigir essas transformações tem mais valor imediato do que acrescentar efeitos visuais ou substituir toda a tecnologia.

Esta revisão combina leitura de código, build e experiências numéricas. Não inclui uma sessão interativa no browser ou headset, medição de FPS/GPU ou validação astrodinâmica externa. Problemas demonstráveis no código são identificados abaixo; conforto, legibilidade e desempenho efetivo precisam de testes em dispositivo.

## Verificações realizadas

- `npm run build`: passou com Vite 5.2.11. JavaScript principal: 830,52 kB, 214,22 kB gzip; aviso de chunk superior a 500 kB. Isto não mede o tempo de carregamento nem o desempenho em VR.
- `npm audit --json`: 28 dependências sinalizadas — 1 baixa, 8 moderadas, 18 altas e 1 crítica. Inclui dependências transitivas e ferramentas de desenvolvimento/deploy; não significa que existam 28 vulnerabilidades exploráveis no site publicado. A auditoria não cobre os scripts CDN de `index.html`.
- Dados locais: 4 conjunções, com 100, 31, 7 e 36 manobras. Os TCA são de julho de 2024; a aplicação usa uma amostra estática.
- Execução do método real `Room.mapToRoom` em contexto isolado: `[1,2,3]` e `[10,20,30]` produzem ambos `[0,0.5,1]`; `[2,2,2]` produz três `NaN`.
- Decomposição das oito matrizes de covariância de posição da amostra: valores próprios positivos. Isto verifica apenas estas matrizes, não a correção do referencial ou da representação.
- A pasta `static` contém 51 ficheiros, cerca de 42,24 MB. O Vite copia também recursos públicos que não são usados; tamanho publicado não equivale a bytes transferidos na visita inicial.

## Problemas prioritários

### 1. Alta — A sala distorce direção e distância

**Onde:** `src/Experience/World/Components/Room.js`, `mapToRoom`, linhas 220–225.

O mínimo e máximo são calculados entre as três componentes do próprio vetor e usados para mapear tudo para `[0,1]`. Isso elimina sinais, altera direções e apaga a magnitude. Vetores dez vezes maiores podem aparecer iguais; componentes iguais causam divisão por zero. A primeira conjunção perde a componente negativa de z na representação.

**Correção:** definir uma origem comum, por exemplo o ponto médio da conjunção, e aplicar a mesma transformação e escala uniforme a todos os objetos: `posiçãoVisual = s × R × (posiçãoFisica − origem)`. O fator `s` deve ser partilhado pelas posições e incertezas. Se houver ajuste automático da escala por conjunção, mostrar uma régua e a escala aplicada.

**Validação:** preservar direção e razões entre distâncias; vetores nulos e componentes iguais devem produzir coordenadas finitas. Comparar a separação visual, convertida para metros, com a separação calculada a partir dos mesmos estados e instante.

### 2. Alta — O elipsoide não representa fielmente a covariância

**Onde:** `Components/Covariance.js`, linhas 57, 67–73 e 98–114.

Os eixos usam fatores diferentes (`0.1`, `0.1`, `0.001`), comprimindo um deles cem vezes mais. A atualização calcula uma matriz de orientação mas não a aplica. A matriz inicial coloca os vetores próprios em linhas; para orientar os eixos locais devem formar as colunas da base. No globo aplica-se ainda um fator adicional de 0.3.

Os campos radial/tangencial/normal precisam de um contrato de referencial explícito. A dissertação refere EME2000 para os estados e componentes radial/tangencial/normal para a covariância. Se esta estiver em RTN, é necessário transformar a base local para o referencial da cena antes de apresentar o elipsoide. Não há essa transformação identificável no fluxo atual.

**Correção:** semieixos `k × sqrt(valorPróprio)` com um fator uniforme de metros para unidades visuais; base ortonormal formada pelos vetores próprios, com orientação consistente; atualizar escala e orientação juntas. Definir o significado estatístico de `k`, sem confundir um multiplicador de sigma com uma probabilidade de cobertura 3D. Rejeitar dados inválidos e tratar apenas pequenos valores negativos atribuíveis a erro numérico com tolerância documentada.

**Validação:** matrizes diagonais, matrizes rodadas e covariâncias conhecidas; verificar a reconstrução `P ≈ V diag(λ) Vᵀ`, ortogonalidade e referencial. Sobreposição visual dos elipsoides não deve ser apresentada como cálculo de PoC.

### 3. Alta — Manobras não usam o mesmo espaço nem instante entre vistas

**Onde:** `Room.updateManoeuvre`, `Globe.updateManoeuvre`, `UI/ManoeuvreCard.js:81`, `UI/ConjunctionCard.js:79`.

A sala normaliza separadamente a posição absoluta pós-manobra, enquanto o par original usa diferenças de posição. Os três objetos deixam de ser comparáveis. O globo usa `manoeuvres[0].state_vector`, mas a sala usa `collision_avoidance.state_vector_tca`; selecionar uma manobra atualiza apenas a sala. Mudar de conjunção não atualiza explicitamente o marcador pós-manobra do globo.

**Correção:** estado central com IDs de conjunção e manobra, instante visualizado e vista ativa. Todas as vistas devem consumir o mesmo cenário. Usar estados no mesmo instante e referencial e aplicar a mesma origem/escala. Se o novo TCA diferir do original, obter também o estado do chaser nesse instante para uma comparação física válida.

**Validação:** selecionar duas manobras distintas e alternar vistas; os marcadores e painéis devem refletir os mesmos IDs e instantes. Mostrar claramente dados ausentes em vez de reutilizar silenciosamente o cenário anterior.

### 4. Alta — O arranque depende da ordem de conclusão dos pedidos

**Onde:** `Utils/Resources.js`, `Experience.js` e `World/World.js`.

Dados e recursos carregam em paralelo, mas `World` só subscreve `ready` depois de `dataReady`. Se os recursos terminarem primeiro, o evento perde-se e o mundo não é inicializado. Falhas de modelos/texturas não têm callback de recuperação; o fetch não verifica `response.ok` e limita-se a escrever erros na consola.

**Correção:** uma promessa de inicialização que aguarde dados e recursos, com estado de sucesso persistente, validação do JSON, erro visível e opção de tentar novamente. Aguardar também a disponibilidade real da cena/câmara A-Frame.

**Validação:** JSON lento com modelos em cache; modelo em falta; HTTP 404; JSON inválido; lista de conjunções vazia e conjunção sem manobras. O loader deve terminar em sucesso ou erro compreensível.

### 5. Alta — A paginação impede explorar a maior parte das manobras

**Onde:** `UI/Pages.js:100–117`, `UI/Grid.js` e `UI/ConjunctionCard.js:221`.

Os callbacks de paginação estão comentados. A grelha apresenta sete manobras; a primeira conjunção tem cem. Mesmo ligando os callbacks, os métodos acrescentam cartões sem limpar a página anterior, não atualizam o texto visível e reiniciam IDs em zero em cada página.

**Correção:** paginação completa com IDs estáveis do domínio, substituição dos cartões, limites e botões desativados nos extremos. Preservar a seleção independentemente da página. Implementar pesquisa — o botão atual apenas escreve uma mensagem na consola (`Header.js:176`).

**Validação:** aceder à última das cem manobras, regressar à primeira página e confirmar que cada cartão seleciona o registo correto.

### 6. Alta — A destruição mantém referências e atualizações de UI

**Onde:** `UI/Pages.js:137`, `UI/Header.js:229`, `UI/ConjunctionCard.js:246`, `UI/Grid.js:123–138`, `Experience.destroy`.

`Pages` e `Header` atribuem um novo array local com `filter`, sem atualizar a lista usada pelo raycaster. `ConjunctionCard` define o cartão como `null` antes de o procurar nessa lista. `Grid` destrói `pages` duas vezes. Há remoções por `children.splice`, em vez da API do grafo de cena.

A biblioteca instalada oferece `clear()` para remover componentes do gestor de atualizações; o código faz sobretudo `dispose` manual de geometria/material. A destruição de `Pages` também liberta texturas partilhadas pelo gestor de recursos. Em `Experience.destroy`, a comparação `value.dispose === 'function'` está incorreta e `this.camera.controls` não corresponde à entidade A-Frame recebida. O singleton não é reposto e o RAF continua agendado.

**Correção:** propriedade explícita dos recursos, registo/desregisto central de interativos, destruição idempotente, API de limpeza da biblioteca e remoção de listeners/animações. Só libertar texturas partilhadas quando deixarem de ter consumidores.

**Validação:** alternar conjunções repetidamente e verificar que o número de interativos, componentes registados e recursos GPU estabiliza. Medir memória/FPS no headset; esta revisão não quantifica a fuga de memória em execução.

### 7. Média/alta — Duas integrações Three.js e dois ciclos de atualização

**Onde:** `index.html:16`, imports de `three`, `Utils/Time.js`, `Utils/Raycaster.js` e `Utils/VRControl.js`.

A-Frame é carregado por CDN e traz a sua integração Three.js; o bundle importa adicionalmente Three.js 0.158.0. Algumas classes, como `Covariance`, usam o global `THREE`, outras importam o pacote. Isto cria risco de incompatibilidade e torna verificações por `instanceof` frágeis. O `export default THREE` num script inline não unifica as instâncias.

Existe ainda um `window.requestAnimationFrame` próprio além do ciclo A-Frame/XR. Controladores e raycasters são configurados por A-Frame e também por código Three.js, com alterações ao mesmo raycaster.

**Correção:** manter A-Frame como proprietário da cena, renderer, controladores e ciclo de vida; mover a atualização da aplicação para um componente/sistema `tick`. Unificar a instância Three.js numa combinação de versões testada. Uma migração integral para Three.js puro é uma alternativa futura, não uma condição para corrigir o projeto.

**Validação:** entrada/saída de XR, perda de tracking e regresso à sessão; ausência de avisos de múltiplas instâncias; UI atualizada a cada frame XR.

### 8. Média — A trajetória está desativada e não está pronta a ser ligada

**Onde:** `Components/Objects.js:63`, `Components/Trajectory.js`.

A instanciação está comentada. A classe ignora os dados recebidos, usa um estado fixo, combina `mu` em km³/s² com posições/velocidades compatíveis com metros e metros por segundo, e desenha apenas os primeiros cem pontos dos 1441 calculados para 24 horas.

**Correção:** contrato de unidades, estado inicial e época do objeto selecionado; separar propagação e desenho; definir o intervalo temporal visível. Validar o modelo orbital escolhido contra dados de referência antes de expor trajetórias como previsão. Um propagador de dois corpos pode servir para uma demonstração explicitamente identificada, mas não deve ser assumido suficiente para análise operacional de conjunções.

## Melhorias na visualização de informação

1. **Separar contexto e análise.** Globo simplificado para localização geral; vista local para distância, incerteza e comparação de manobras. Evitar que detalhes fotográficos do planeta concorram com os dados.
2. **Adicionar eixos, unidades e escala.** Identificar referencial e instante em cada vista. Distinguir dimensões físicas dos satélites, tamanho simbólico dos ícones e exagero visual da incerteza.
3. **Comparação antes/depois consistente.** Mostrar PoC, distância de passagem, duração, consumo e delta-v quando existam. A linha secundária de distância em `ManoeuvreCard.js:173` repete a distância absoluta com um sinal `+`; calcular a diferença real relativamente ao cenário original ou mudar o rótulo.
4. **Linha temporal.** Marcar época dos dados, ignição e TCA, com pausa e avanço controlado. Uma interpolação visual entre posições não deve ser confundida com propagação orbital.
5. **Projeções ortogonais da sala.** Usar vistas 2D sincronizadas como complemento da profundidade estereoscópica, com os mesmos eixos, origem e escala.
6. **Cor redundante com texto/símbolos.** Os cartões de conjunção usam o mesmo vermelho independentemente dos dados. Qualquer categoria de risco deve vir de um critério documentado. Na legenda de manobras, `ManoeuvreInfo` mistura tipos de manobra com rótulos de risco como “Minor Concern” e “No Threat”; corrigir essa semântica.
7. **Dados reais nos popups.** `Objects.setPopup` fixa o nome `LEMUR-2-ZACHARY`; `ObjectPopup` fixa massa e dimensão e usa o nome recebido no campo COSPAR. Atualizar conteúdo por seleção e distinguir ausência de dados de valores demonstrativos.
8. **Relógio do cenário.** A Terra roda segundo `Date.now()` e uma referência arbitrária de 2024, enquanto os estados são estáticos. Isto não garante alinhamento geográfico no instante dos dados. Definir a transformação EME2000 → cena, incluindo a convenção de eixos, e sincronizar a orientação terrestre com a época apresentada; assinalar o Sol como iluminação ilustrativa enquanto não existir cálculo adequado.

## Melhorias de interação e conforto a validar

- Tutorial curto: selecionar conjunção, comparar manobra, alternar vista e repor a cena.
- Painéis fixos e reposicionáveis como opção inicial; menu preso à mão como preferência. O modo atual depende do hash `#vr`, não do estado real da sessão XR.
- Seleção por ação discreta, com feedback visual e suporte a cancelamento. Hoje um gatilho premido pode selecionar outro alvo ao atravessá-lo.
- Determinar a mão pela propriedade `handedness`; o código assume que o controlador de índice zero é o direito e só liga a seleção desse controlador.
- Garantir posicionamento e orientação dos menus usando coordenadas de mundo coerentes com a câmara XR; limitar animações automáticas e permitir movimento reduzido.
- Disponibilizar uma interface HTML acessível no desktop, com teclado e leitura dos valores, sem depender apenas de texto desenhado em WebGL.
- Medir conforto sentado/em pé, legibilidade, fadiga e taxa de sucesso em tarefas no dispositivo alvo. Não é possível confirmar estas qualidades pela leitura do código.

## Arquitetura, desempenho e manutenção

- Extrair funções puras para coordenadas, covariância, tempo e formatação. Concentrar IDs selecionados e instante num estado pequeno, independente de Three.js.
- Substituir gradualmente o acesso recursivo a `new Experience()` por dependências explícitas. Não é necessário começar por trocar de framework ou converter tudo para TypeScript.
- Carregar cada modelo uma vez e clonar para as vistas; hoje há seis entradas de modelos para dois caminhos GLB. Partilhar recursos com regras claras de propriedade.
- Medir `renderer.info`, tempo de frame e alocações durante troca de seleção. Evitar trabalho no frame quando os valores não mudaram e suspender atualizações das vistas ocultas quando possível.
- Retirar assets de exploração não usados de `static`, preservando-os no arquivo histórico. A redução do diretório publicado não resolve por si só os problemas de frame rate.
- Atualizar dependências de forma controlada, com combinação A-Frame/Three.js testada. Tratar Vercel CLI como ferramenta de desenvolvimento/deploy e rever dependências sem uso. Não aplicar `npm audit fix --force` como substituto de análise e testes.
- Fixar versões também nos scripts CDN, documentar Node suportado e acrescentar lint/build em CI. O README ainda tem URL de clone com `your-username`, referências a WebVR e descrições que sugerem integração contínua/previsão além do demonstrado pelo fluxo local.
- Documentar origem, unidades, referenciais, épocas e condições de redistribuição dos dados/modelos. Separar exemplos públicos de qualquer futura integração privada.

## Avaliação científica e documentação

O capítulo 10 descreve seis participantes de conveniência e ausência de testes com operadores. Isto suporta uma avaliação formativa da interação; não demonstra melhoria da decisão operacional face a uma ferramenta 2D. A tese reconhece estas limitações nos capítulos finais.

Uma continuação deve comparar VR e desktop em tarefas equivalentes: identificar a maior aproximação, interpretar incerteza, comparar duas manobras e explicar o efeito esperado. Medir acerto, tempo, erros de interpretação, aprendizagem e desconforto; contrabalançar a ordem e incluir operadores quando possível. Não é preciso adicionar IA para responder a estas questões.

Publicar resultados agregados do UEQ, regras de cálculo, dispersão e limitações da amostra. O capítulo de avaliação consultado descreve o questionário e observações, mas não apresenta resultados quantitativos detalhados. Distinguir experiência agradável de análise correta.

Alinhar README, vídeo e documentação com funcionalidades efetivamente disponíveis. Identificar a aplicação como protótipo de exploração de amostra estática até existir carregamento contínuo e validação das previsões. Se a tese permanecer como registo histórico, publicar uma nota técnica de evolução em vez de alterar retroativamente o documento académico.

## Ordem sugerida de execução

| Fase | Entrega | Critério de conclusão |
| --- | --- | --- |
| 1 | Contrato de unidades, referenciais e épocas; transformação da sala e covariância | Testes numéricos com exemplos conhecidos; origem/escala visíveis |
| 2 | Seleção central e sincronização das vistas/manobras | Mesmos IDs e instantes em todos os painéis e marcadores |
| 3 | Inicialização robusta, paginação e limpeza de recursos | Erros recuperáveis; acesso a todas as manobras; contagens de recursos estáveis |
| 4 | Unificação Three.js/A-Frame e ciclo XR | Entrada/saída e seleção estáveis no dispositivo alvo |
| 5 | Tutorial, comparação antes/depois, projeções e timeline | Tarefas completas com dados e escalas coerentes |
| 6 | Avaliação comparativa e documentação reproduzível | Resultados mensuráveis e limitações explicitadas |

## Referências técnicas consultadas

- [A-Frame FAQ](https://aframe.io/faq/): integração Three.js e ciclo único com `tick`.
- [A-Frame: Entity Component System](https://aframe.io/docs/1.8.0/introduction/entity-component-system.html): componentes e ciclo de vida.
- [Three.js: Matrix4](https://threejs.org/docs/pages/Matrix4.html): convenção de `set` e construção de bases.
- Implementação local de `three-mesh-ui` 6.5.4: `setState` ignora transições para o estado já ativo; `clear` remove componentes do gestor de atualizações. Por isso não se assume uma recursão infinita apenas por haver callbacks de seleção que se chamam mutuamente.

O código da aplicação não foi alterado durante a revisão.
