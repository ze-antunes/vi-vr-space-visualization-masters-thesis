# Intenção de design e diferenças da implementação

> Este documento regista a investigação e o diagnóstico anteriores à implementação seguinte. O estado implementado e validado está descrito em [MELHORIAS_2026-10-18.md](MELHORIAS_2026-10-18.md).
Leitura realizada a 18 de outubro de 2026 para orientar a continuação do projeto. Esta passagem documenta a intenção e o diagnóstico; não altera a apresentação da aplicação nem cria commits.

## Fontes e alcance

- Dissertação local, 131 páginas: levantamento visual de todas as páginas, leitura detalhada dos objetivos, trabalho preliminar, explorações, design, dados, desenvolvimento, avaliação e conclusões; consulta dos apêndices de mockups e UI. Não se trata de uma revisão editorial integral.
- `Presentation.pdf`, 24 diapositivos: leitura do texto e levantamento visual completo; inspeção ampliada dos diapositivos de prototipagem, explorações, globo e sala.
- As 52 imagens de `Documents/[DS] Design/screen_shots`: todas incluídas no levantamento visual, com ampliação dos layouts Figma, esboços de composição/escala, ShapesXR e capturas de implementação relevantes.
- GIF da aplicação: amostra de oito momentos distribuídos pelos 202 frames, para observar alternância de vistas, seleção e composição. Não foi feita análise frame a frame.
- README, processos de qualidade, código original em Git e código atual. A documentação de QA define o processo de trabalho; não especifica a aparência da cena.
- Inspeção do estado inicial da aplicação atual no Chromium, a 1440 × 1000. Não houve uma sessão num headset físico.

As imagens de levantamento, renders dos PDFs e capturas atuais ficam em `test-results/design-review/`, ignorado pelo Git. As referências de origem abaixo continuam nos seus ficheiros originais.

## Ideia central reconstruída

Uma experiência de análise espacial em VR, onde o utilizador manipula e examina representações tridimensionais de uma conjunção, alternando entre contexto orbital e análise local. A interface flutua no mesmo espaço e usa listas, cartões e popups próprios. Desktop/mobile são formas de acesso e pré-visualização; não implicam substituir a experiência por um dashboard HTML.

Há dois trabalhos relacionados mas distintos na tese: o módulo de visualização prototipado para a plataforma Neuraspace, e a experiência imersiva VR desenvolvida com A-Frame/Three.js. Os mockups do primeiro não são instruções para converter o segundo numa plataforma de gestão web.

Base: objetivos, p. 3; trabalho preliminar, pp. 47–51; design, pp. 63–70; desenvolvimento, pp. 77–82. A numeração é a impressa na tese; no PDF estas páginas têm um deslocamento de 22.

## Vista globo

**Documentado:** uma esfera terrestre como referência geográfica/orbital, com texturas de dia/noite e atmosfera. Os objetos e trajetórias ajudam a contextualizar a conjunção. A cena pode ser rodada/ampliada. As capturas finais mostram forte contraste entre a Terra iluminada, o lado noturno e o fundo escuro.

Referências: figura 6.2, p. 55; figuras 7.3–7.4, p. 65; figuras 9.1–9.2, pp. 78–79; `image4.jpg`, `image41.jpg` e as capturas de 6 de setembro às 09:20:30. A apresentação confirma a mesma ideia no diapositivo 15.

**Critérios a preservar:**

- Geometria e transformação uniformes; o planeta não deve adquirir uma forma achatada por efeitos de manipulação.
- Câmara e projeção que mantenham uma leitura natural do volume e uma escala confortável em VR.
- A orientação e o foco sobre uma conjunção não devem destruir a compreensão do globo.
- Preservar o carácter visual da iluminação e atmosfera das referências finais; mudar dependências não autoriza uma nova direção estética.
- Os dados orbitais permanecem coerentes enquanto se roda ou amplia a representação.

**Diagnóstico atual:** `Globe.js` cria uma `SphereGeometry` completa, raio 1. Na medição inicial, a escala mundial era aproximadamente `(0.7, 0.7, 0.7)` e os quaternions estavam normalizados. Não encontrei achatamento geométrico nesse estado. A câmara de pré-visualização está a 110°, valor introduzido na minha intervenção para enquadrar os painéis; a aparência ainda precisa de verificação durante resize, deslocação, manipulação e XR. Não é correto declarar resolvida a deformação percebida pelo autor apenas porque a classe se chama SphereGeometry.

## Sala de conjunções

**Documentado:** um espaço delimitado para observar de perto target, chaser e incerteza, removendo o ruído de todos os objetos em órbita. Paredes e chão são superfícies úteis para projeções ortogonais, contribuindo para a perceção de profundidade, forma e sobreposição.

Referências: figuras 5.2–5.3, p. 51; figuras 6.3–6.5, pp. 57–58; figuras 7.5–7.6, p. 65; figura 9.3, p. 80; diapositivos 12, 13 e 16; `Imagem_shapes3.jpg`, `Imagem_shapes4.jpg`, `image55.jpg`, `Imagem1001dd.jpg` e capturas às 09:17:24/09:20:29.

**A distinção entre fases importa:** os mockups ShapesXR usam paredes claras para tornar a ideia legível; a implementação final usa paredes escuras. Ambas têm superfícies, não apenas arestas. A frente aberta e a visibilidade das faces interiores permitem inspecionar a sala. Um cubo completamente fechado e opaco que esconda os dados também não corresponde a estas referências.

**Critérios a preservar:**

- Paredes/chão visíveis como superfícies, com orientação, iluminação e contraste suficientes.
- Possibilidade de observar/manipular a conjunção por dentro ou junto da sala.
- Objetos distinguíveis e selecionáveis; as posições não se tornam legíveis só porque os números são matematicamente corretos.
- Projeções dos volumes de incerteza nos planos XY/XZ/YZ, com correspondência de cor e posição com o volume 3D.
- As sobreposições projetadas são um apoio visual; não equivalem a um cálculo de probabilidade de colisão.

**Diagnóstico atual confirmado:** substituí as superfícies por um `Box3Helper` e um `AxesHelper`. Não se trata apenas de uma transparência mal configurada: o código atual deixou de criar as paredes originais. Os pontos projetados que acrescentei não implementam a projeção dos elipsoides pretendida na tese.

**Estado original:** as projeções eram uma exploração incompleta, como a tese reconhece nas pp. 58, 80 e 86. Deve-se completar essa intenção com uma implementação correta, e não apresentar os pontos atuais como funcionalidade equivalente.

## Escala e dimensão dos objetos

O esboço `Imagem WhatsApp 2024-09-06 às 09.01.38_c287ce6e.jpg` relaciona o dimensionamento da sala com a distância de passagem e a maior covariância. Essa relação oferece uma base para enquadrar a conjunção. A tese também alerta para distorções de escala, p. 69, e para a falta de detalhe das pequenas diferenças entre manobras, p. 85.

É necessário separar três coisas:

1. Posições e distâncias dos dados: mesma origem e escala uniforme.
2. Covariâncias: semieixos e orientação fiéis; não comprimir um eixo para tornar a figura mais conveniente.
3. Símbolos/modelos dos satélites: dimensão visual suficientemente grande para serem identificados e selecionados, explicitamente simbólica se não estiver à escala física.

**Diagnóstico atual confirmado:** em `Objects.js` impus o mesmo tamanho máximo de 0.045 unidades aos modelos de ambas as vistas. A sala ajusta o enquadramento à maior covariância, que pode ser muito extensa. A combinação torna os símbolos pouco visíveis e a conjunção difícil de inspecionar. Esta dimensão foi uma decisão minha, não um requisito extraído dos mockups.

**Direção de correção:** definir dimensões visuais adequadas a cada vista e verificar tamanho angular/seleção no headset. Ajustar enquadramento e permitir inspeção de detalhe sem falsificar distâncias ou covariâncias. A comparação entre manobras deve manter referências e escalas coerentes, para que o ajuste automático não esconda a mudança real.

## Painéis e linguagem visual

Os exports `Group 1881.png`, `Group 1882.png` e `Group 1883.png` são as referências mais legíveis; `Group 1884.png` reúne-as numa composição vertical. O apêndice B e o diapositivo 12 confirmam o mesmo sistema.

- Fundos pretos/cinzentos, tipografia branca e hierarquia entre valor e informação secundária.
- Cartões arredondados e seleção com contorno amarelo.
- Estados de conjunção: vermelho, amarelo e verde, com significado consistente com os dados.
- Tipos de manobra: quadrado amarelo, triângulo laranja e losango roxo.
- Cartões de manobra organizados por tempo/duração, PoC/variação e distância/variação.
- Ícones próprios para globo/sala, pesquisa, informação e colunas.
- Popups de manobra, target e chaser com os campos explicitados no design.
- Disposição espacial dos painéis à volta da visualização; também existem experiências com menus nas mãos.

A reposição dos ficheiros visuais originais foi necessária, mas não assegura por si só a fidelidade: projeção de cor, iluminação, distância, escala e posição em VR também afetam a apresentação. A avaliação, pp. 83–84, relata dificuldades de descoberta dos menus nas mãos; isso justifica melhorar a aprendizagem, não substituir silenciosamente o sistema de painéis.

## Funcionalidades concebidas mas não concluídas

- Projeções completas das covariâncias e realce de interseções.
- Trajetórias validadas e evolução temporal da manobra, distinguindo posição atual/CP e TCA.
- Comparação espacial de duas manobras, presente nos esboços.
- Algumas opções de pesquisa e organização de colunas previstas no Figma.
- Tutorial e refinamento de interação.

Estas referências indicam intenções e trabalho futuro. Não se deve assumir que estavam todas funcionais, nem descartar a sua intenção porque a implementação estava incompleta.

## Regras para a continuação

Prioridade de referência: feedback atual do autor; capturas finais e descrição correspondente na tese; protótipos e esboços; escolhas de implementação. As minhas alterações anteriores não são uma referência de design.

Cada correção visual deve indicar a referência que está a recuperar e ser verificada numa captura comparável, além dos testes numéricos. Um build sem erros não valida forma percebida, dimensão, paredes ou legibilidade em VR.

A próxima intervenção deve tratar primeiro da leitura esférica do globo, da reposição das superfícies da sala e da legibilidade dos objetos. A projeção correta dos volumes e a comparação temporal devem ser desenvolvidas como funcionalidades próprias, com os respetivos dados e validação, preservando o design.

## Inventário das 52 imagens consultadas

A numeração permite cruzar o levantamento em `test-results/design-review/images-*.jpg` com os originais.

| Nº | Imagem original |
| --- | --- |
| 01 | Captura de ecrã 2024-05-06 205856.png |
| 02 | Captura de ecrã 2024-06-25 204141.png |
| 03 | Captura de ecrã 2024-07-06 000014.png |
| 04 | Captura de ecrã 2024-07-06 000042.png |
| 05 | Captura de ecrã 2024-09-17 183025.png |
| 06 | Group 1881.png |
| 07 | Group 1882.png |
| 08 | Group 1883.png |
| 09 | Group 1884.png |
| 10 | image16.jpg |
| 11 | image19.jpg |
| 12 | image35.jpg |
| 13 | image4.jpg |
| 14 | image41.jpg |
| 15 | image55.jpg |
| 16 | image67.jpg |
| 17 | image70.png |
| 18 | image72.jpg |
| 19 | Imagem WhatsApp 2024-09-05 às 19.24.34_3db6f3c4.jpg |
| 20 | Imagem WhatsApp 2024-09-05 às 19.24.34_625ebe90.jpg |
| 21 | Imagem WhatsApp 2024-09-05 às 19.24.34_bb480600.jpg |
| 22 | Imagem WhatsApp 2024-09-05 às 19.24.34_c2d0724b.jpg |
| 23 | Imagem WhatsApp 2024-09-05 às 19.31.17_018bbd7b.jpg |
| 24 | Imagem WhatsApp 2024-09-05 às 19.31.17_20ee5be9.jpg |
| 25 | Imagem WhatsApp 2024-09-05 às 19.41.18_4b27e8ee.jpg |
| 26 | Imagem WhatsApp 2024-09-05 às 19.41.18_4b7db73b.jpg |
| 27 | Imagem WhatsApp 2024-09-06 às 09.01.38_3241f1e5.jpg |
| 28 | Imagem WhatsApp 2024-09-06 às 09.01.38_44b968cb.jpg |
| 29 | Imagem WhatsApp 2024-09-06 às 09.01.38_96941fd8.jpg |
| 30 | Imagem WhatsApp 2024-09-06 às 09.01.38_a90d8189.jpg |
| 31 | Imagem WhatsApp 2024-09-06 às 09.01.38_a9eeed3d.jpg |
| 32 | Imagem WhatsApp 2024-09-06 às 09.01.38_c287ce6e.jpg |
| 33 | Imagem WhatsApp 2024-09-06 às 09.01.38_f08b7a81.jpg |
| 34 | Imagem WhatsApp 2024-09-06 às 09.11.07_4652577c.jpg |
| 35 | Imagem WhatsApp 2024-09-06 às 09.11.07_556c2d99.jpg |
| 36 | Imagem WhatsApp 2024-09-06 às 09.11.07_a008fa96.jpg |
| 37 | Imagem WhatsApp 2024-09-06 às 09.11.08_07266c08.jpg |
| 38 | Imagem WhatsApp 2024-09-06 às 09.17.24_9781b5c8.jpg |
| 39 | Imagem WhatsApp 2024-09-06 às 09.17.24_fcbe63d5.jpg |
| 40 | Imagem WhatsApp 2024-09-06 às 09.17.25_4b14c931.jpg |
| 41 | Imagem WhatsApp 2024-09-06 às 09.20.29_6056b1c8.jpg |
| 42 | Imagem WhatsApp 2024-09-06 às 09.20.30_4f9e93cf.jpg |
| 43 | Imagem WhatsApp 2024-09-06 às 09.20.30_7607c1cd.jpg |
| 44 | Imagem WhatsApp 2024-09-06 às 09.20.30_956fe906.jpg |
| 45 | Imagem WhatsApp 2024-09-06 às 09.20.30_afddc5c6.jpg |
| 46 | imagem1.jpg |
| 47 | Imagem1001.jpg |
| 48 | Imagem1001dd.jpg |
| 49 | Imagem_shapes1.jpg |
| 50 | Imagem_shapes2.jpg |
| 51 | Imagem_shapes3.jpg |
| 52 | Imagem_shapes4.jpg |
