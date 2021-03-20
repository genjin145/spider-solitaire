import two from '../img/cards/2S.png'
import three from '../img/cards/3S.png'
import four from '../img/cards/4S.png'
import five from '../img/cards/5S.png'
import Six from '../img/cards/6S.png'
import Seven from '../img/cards/7S.png'
import eight from '../img/cards/8S.png'
import nine from '../img/cards/9S.png'
import zero from '../img/cards/0S.png'
import J from '../img/cards/JS.png'
import Q from '../img/cards/QS.png'
import K from '../img/cards/KS.png'
import A from '../img/cards/AS.png'

const obj = {
  2: two,
  3: three,
  4: four,
  5: five,
  6: Six,
  7: Seven,
  8: eight,
  9: nine,
  0: zero,
  J, Q, K, A
}

for (let key in obj) {
  obj[key] = new URL(obj[key]).pathname
}

export default obj
