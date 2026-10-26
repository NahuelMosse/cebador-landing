window.FLAVORS = {
  pomelo: {
    key: 'pomelo', idx: '01', short: 'Pomelo', sub: 'rosado, con una pizca de sal', price: '$2.900', unit: 2900,
    line: 'Pomelo rosado recién exprimido y la yerba bien atrás. Amargo del lindo, final seco, ideal para la hora en que el sol pega fuerte.',
    meters: { dulzor: 55, amargor: 72, burbuja: 82 },
    label: { top: '#ff7f7f', bot: '#cf3550', ink: '#fff4ee', deep: '#7a1f33' },
    fruit: { type: 'pomelo', rind: '#f1b94f', pith: '#fff1d6', flesh: ['#ffa3a3', '#ff5a6e'], seg: 10 },
    leaf: false
  },
  menta: {
    key: 'menta', idx: '02', short: 'Menta-limón', sub: 'lima, menta fresca y yerba', price: '$2.900', unit: 2900,
    line: 'Lima bien ácida, menta recién cortada y la yerba al frente. La más fresca de las tres; se termina antes de que te des cuenta.',
    meters: { dulzor: 35, amargor: 48, burbuja: 92 },
    label: { top: '#52d99c', bot: '#0f7a59', ink: '#f2fff3', deep: '#0b3b2e' },
    fruit: { type: 'lima', rind: '#3f8f26', pith: '#f1fbd6', flesh: ['#dff58b', '#a9d93f'], seg: 9 },
    leaf: true
  },
  maracuya: {
    key: 'maracuya', idx: '03', short: 'Maracuyá', sub: 'pulpa entera, semillas y todo', price: '$3.100', unit: 3100,
    line: 'Maracuyá con su pulpa y sus semillitas, dulce arriba y ácido abajo. La que le gusta a quien dice que no le gusta el mate.',
    meters: { dulzor: 78, amargor: 28, burbuja: 70 },
    label: { top: '#ffc233', bot: '#e8800f', ink: '#2a1500', deep: '#4a2a05' },
    fruit: { type: 'maracuya', rind: '#6b2142', pith: '#f6e9cf', flesh: ['#ffd25c', '#ff9a1a'], seg: 0 },
    leaf: false
  }
};
window.FLAVOR_ORDER = ['pomelo', 'menta', 'maracuya'];

window.BOX_OFF = { 1: 0, 6: .06, 12: .1, 24: .15 };
window.boxPrice = (k, n) => Math.round(window.FLAVORS[k].unit * n * (1 - window.BOX_OFF[n]) / 100) * 100;
