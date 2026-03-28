import { ContentOutput } from '../types/ai.types';

export const STATIC_SESSIONS: Record<number, ContentOutput> = {
  1: {
    direction: "Bem-vindo ao início da sua jornada. Hoje o foco é simplesmente observar.",
    explanation: "A transformação começa na autoconsciência. Antes de mudar qualquer coisa, precisamos ver claramente onde estamos, sem julgamentos.",
    reflection: "Qual foi o pensamento mais recorrente que você teve hoje até agora?",
    action: "Anote três sentimentos que você teve hoje, sem tentar justificá-los.",
    question: "O que a sua ansiedade ou desconforto está tentando lhe ensinar neste momento?",
    affirmation: "Eu sou o observador dos meus pensamentos, não o escravo deles.",
    practice: "Meditação de 5 minutos focada exclusivamente em notar a entrada e saída do ar, rotulando distrações apenas como 'pensamento'.",
    integration: "Sempre que sentir urgência ou estresse hoje, pause por 10 segundos antes de reagir."
  },
  2: {
    direction: "Hoje vamos trabalhar a presença e o ancoramento.",
    explanation: "A mente ansiosa vive no futuro. O ancoramento físico interrompe essa projeção e traz o sistema nervoso de volta para o sinal de segurança.",
    reflection: "Onde no seu corpo você sente tensão quando pensa nos seus problemas?",
    action: "Faça uma pausa e relaxe os ombros, o maxilar e a respiração neste exato momento.",
    question: "Como seria o seu dia hoje se você decidisse confiar que o universo está cuidando de você?",
    affirmation: "Eu confio no processo. Eu estou seguro aqui e agora.",
    practice: "Técnica grounding 5-4-3-2-1 (5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que agradece).",
    integration: "Conecte-se com a sensação da água nas mãos ao lavá-las durante o dia."
  },
  3: {
    direction: "Vamos explorar a emoção por trás do comportamento automático.",
    explanation: "Nossos hábitos destrutivos ou distrações são muitas vezes escudos para evitar sentir um desconforto mais profundo. Reconhecer o escudo é o primeiro passo para soltar a armadura.",
    reflection: "O que você tende a fazer quando se sente entediado ou sobrecarregado?",
    action: "Identifique um comportamento de fuga que você teve ontem e qual emoção você estava tentando evitar.",
    question: "Do que você está fugindo quando pega o celular sem motivo?",
    affirmation: "Eu tenho a capacidade de sustentar o desconforto e aprender com ele.",
    practice: "Prática de aceitação radical: sente-se com uma emoção desconfortável por 3 minutos, sem tentar mudá-la.",
    integration: "Quando sentir vontade de se distrair hoje, espere 2 minutos antes de ceder."
  },
  4: {
    direction: "Hoje a intenção ganha foco. Vamos alinhar vontade e propósito.",
    explanation: "Disciplina sem propósito é apenas repressão. Quando a intenção é clara, a disciplina se torna devoção ao próprio crescimento.",
    reflection: "Se você tivesse sucesso absoluto na sua jornada, como se sentiria?",
    action: "Defina uma única prioridade não negociável para o dia de hoje.",
    question: "O que é realmente importante para você que está sendo deixado de lado?",
    affirmation: "Minhas escolhas de hoje constroem a minha identidade de amanhã.",
    practice: "Visualização ativa: feche os olhos e visualize-se completando sua prioridade do dia com excelência.",
    integration: "Ao iniciar qualquer nova tarefa hoje, pergunte-se: isto está alinhado com minha intenção?"
  },
  5: {
    direction: "O foco de hoje é a compaixão e o perdão por si mesmo.",
    explanation: "A culpa não é combustível para mudança duradoura; ela é uma âncora. O perdão nos libera do peso do passado para agirmos diferente no presente.",
    reflection: "Qual erro passado você ainda usa como desculpa para desacreditar de si mesmo?",
    action: "Escreva uma carta de perdão a si mesmo sobre esse erro, rasgue e jogue fora.",
    question: "Como você trataria um amigo que estivesse passando exatamente pelo que você está passando?",
    affirmation: "Eu me perdoo por não saber antes o que sei agora.",
    practice: "Meditação Metta (Amor Benevolente) direcionada a si mesmo por 5 minutos.",
    integration: "Sempre que um pensamento crítico surgir hoje, substitua por uma palavra de encorajamento."
  },
  6: {
    direction: "Ação consciente. O movimento é o antídoto da estagnação.",
    explanation: "O cérebro aprende através da ação, não apenas da compreensão intelectual. Fazer algo diferente reescreve ativamente as vias neurais.",
    reflection: "Qual pequena ação você sabe que faria diferença, mas continua adiando?",
    action: "Faça essa pequena ação imediatamente após ler isto.",
    question: "O que você faria agora se não tivesse medo do julgamento alheio?",
    affirmation: "Eu ajo com coragem, mesmo quando sinto medo.",
    practice: "Exercício prático de 2 minutos: levante-se, alongue-se e mova o corpo intencionalmente.",
    integration: "Celebre cada pequena vitória ao longo do dia, não importa quão menor pareça."
  },
  7: {
    direction: "Integração. Você completou sua primeira semana.",
    explanation: "A transformação espiritual e comportamental não é um salto, mas uma caminhada constante. Honrar o caminho percorrido solidifica a nova identidade.",
    reflection: "Qual foi o seu maior aprendizado sobre si mesmo nesta última semana?",
    action: "Releia anotações da semana e observe padrões. Celebre o fato de estar se priorizando.",
    question: "Quem você está se tornando através deste processo contínuo?",
    affirmation: "A cada dia, me aproximo mais da minha essência verdadeira.",
    practice: "Revisão e Celebração: 10 minutos de reflexão em silêncio reconhecendo as vitórias internas.",
    integration: "Transmita a paz que cultivou hoje para a primeira pessoa com quem interagir."
  }
};

export const FALLBACK_SESSION = {
  direction: "Sessão de manutenção e resiliência interna.",
  explanation: "Existem dias em que fluímos e dias em que apenas nos mantemos focados. A persistência nos momentos neutros é o que constrói a base da disciplina.",
  reflection: "O que você pode fazer hoje para cuidar da sua base (sono, alimento, mente)?",
  action: "Beba um copo de água com consciência plena agora mesmo.",
  question: "Como você pode honrar seu corpo e mente no estado atual?",
  affirmation: "Eu respeito o meu ritmo e me mantenho no caminho.",
  practice: "Três respirações profundas, exalando lentamente pela boca.",
  integration: "Volte a este estado de tranquilidade sempre que um desafio se apresentar hoje."
};

export function getStaticFallback(day: number): ContentOutput {
  return STATIC_SESSIONS[day] || FALLBACK_SESSION;
}
