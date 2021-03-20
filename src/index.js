import './scss/style.scss'
import { shuffle, intersectionRect } from './js/helpers'
import cardImage from './js/cardImage'

function appendCard(node, type, inverted = false) {
  const card = document.createElement('div')
  const back = document.createElement('div')
  const front = document.createElement('div')

  if (inverted) card.classList.add('card_inverted', 'card_disabled')

  card.classList.add('card')
  card.dataset.type = type
  back.classList.add('card__back')
  front.classList.add('card__front')
  front.style.backgroundImage = `url(${cardImage[type]})`
  card.appendChild(back)
  card.appendChild(front)

  node.appendChild(card)
}

function createDeck() {
  let deck = []

  for (let i = 0; i < 8; i++) {
    deck = deck.concat(cards)
  }

  shuffle(deck)

  return deck
}

function isValidStack(stack) {
  for (let i = 0; i < stack.length - 1; i++) {
    const current = cards.indexOf(stack[i].dataset.type) - 1
    const prev = cards.indexOf(stack[i + 1].dataset.type)

    if (current !== prev) {
      return false
    }
  }

  return true
}

function getStack(target) {
  const arr = []

  for (let i = target; i !== null; i = i.nextElementSibling) {
    arr.push(i)
  }

  return arr
}

function getLastCard(parrent, type) {
  return [...parrent.querySelectorAll('.card')]
    .filter(item => !item.classList.contains('card_inverted'))
    .reverse()
    .find(item => item.dataset.type === type) || null
}

function collectedDeck(parrent) {
  const king = getLastCard(parrent, 'K')
  const stack = getStack(king)

  if (isValidStack(stack) && stack.length === cards.length) {
    const camp = document.querySelector('.camp-empty')
    const campRect = camp.getBoundingClientRect()

    stack.reverse().forEach((item, index) => {
      item.classList.add('card_disabled')

      setTimeout(() => {
        setTranslateCard(item, index, item.getBoundingClientRect(), campRect)
        camp.appendChild(item)

        animateMoveCard(item)
      }, index * 100)
    })

    setTimeout(() => {
      if (parrent.lastElementChild) invertCard(parrent.lastElementChild)
    }, (stack.length - 1) * 100)

    camp.classList.remove('camp-empty')
    console.log('Колода собрана')

    if (!document.querySelector('.camp-empty')) {
      console.log('Победа');
    }
  }
}

function setTranslateCard(item, zIndex, oldRect, newRect) {
  const rect = newRect || item.getBoundingClientRect()
  const translate = {
    x: oldRect.left - rect.left,
    y: oldRect.top - rect.top
  }

  item.style.transform = `translate(${translate.x}px, ${translate.y}px)`
  item.style.zIndex = zIndex ? `${30 + zIndex}` : null
}

function animateMoveCard(item) {
  setTimeout(() => {
    item.style.transition = 'transform .3s'
    item.style.transform = null
  }, 20)
  setTimeout(() => {
    item.style.transition = null
    item.style.zIndex = null
  }, 300)
}

function invertCard(card) {
  setTimeout(() => {
    card.classList.remove('card_inverted', 'card_disabled')
  }, 200)
}

function illuminate(parent) {
  parent.style.transition = '.2s all'
  parent.classList.add('illuminate')

  setTimeout(() => {
    parent.classList.remove('illuminate')
    setTimeout(() => {parent.style.transition = null}, 200)
  }, 1000)
}

function handleDeck() {
  if (deckElem.childElementCount) {
    const emptyField = [...playgrounds]
      .filter(item => !item.childElementCount)

    if (emptyField.length) {
      emptyField.forEach(field => illuminate(field))
      return
    }

    const oldRect = deckElem.getBoundingClientRect()

    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const last = deckElem.lastElementChild

        playgrounds[i].appendChild(last)
        setTranslateCard(last, 20, oldRect)

        invertCard(last)
        animateMoveCard(last)
        setTimeout(() => {
          collectedDeck(last.closest('.playground'))
        }, 500)
      }, i * 100)
    }
  }
}

function handleMouseDown(evt) {
  function handleMouseMove(evt) {
    stack.forEach(item => {
      setTranslateCard(
        item,
        100,
        {left: evt.clientX, top: evt.clientY},
        {left: rect.left - shift.x, top: rect.top - shift.y},
      )
    })
  }

  function handleMouseUp(evt) {
    const rectStart = stack[0].getBoundingClientRect()
    const rectEnd = stack[stack.length - 1].getBoundingClientRect()
    const coords = {
      x1: rectStart.left,
      y1: rectStart.top,
      x2: rectEnd.right,
      y2: rectEnd.bottom
    }

    const dropBoxes = [...playgrounds]
      .map(box => box.lastElementChild)
      .filter(card => card && card !== target.closest('.playground').lastElementChild)
      .concat([...playgrounds].filter(box => !box.children.length))

    const overBoxes = dropBoxes
      .map(box => {
        const boxRect = box.getBoundingClientRect()
        const square = intersectionRect(
          coords.x1, coords.y1, coords.x2, coords.y2,
          boxRect.left, boxRect.top, boxRect.right, boxRect.bottom
        )

        return {node: box, square}
      })
      .filter(box => box.square > 0)
      .sort((a, b) => -a.square + b.square)
      .filter(box => cards.indexOf(target.dataset.type) + 1 === cards.indexOf(box.node.dataset.type) || box.node.classList.contains('playground'))

    if (overBoxes[0]?.node) {
      const playground = overBoxes[0].node.closest('.playground')

      stack.forEach(item => {
        item.style.transform = null
        playground.appendChild(item)
      })

      const targetRect = evt.target.getBoundingClientRect()
      const oldRect = {left: evt.clientX, top: evt.clientY}
      const newRect = {left: targetRect.left - shift.x, top: targetRect.top - shift.y}

      stack.forEach(item => {
        setTranslateCard(item, 40, oldRect, newRect)
        animateMoveCard(item)
      })

      if (previousElement) {
        invertCard(previousElement)
      }

      collectedDeck(target.closest('.playground'))
    } else {
      stack.forEach(animateMoveCard)
    }

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  let target = evt.target.closest('.card')

  if (
    !target
    || !isValidStack(getStack(target))
    || target.classList.contains('card_disabled')
  ) return

  const previousElement = target.previousElementSibling
  const rect = target.getBoundingClientRect()
  const shift = {
    x: rect.left - evt.clientX,
    y: rect.top - evt.clientY,
  }
  const stack = getStack(target)

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const playgrounds = document.querySelectorAll('.playground')
const deckElem = document.querySelector('.deck')
const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K']
const deck = createDeck(104)

for (let i = 0; i < 54; i++) {
  appendCard(
    playgrounds[i % 10],
    deck.pop(),
    i < 44
  )
}

for (let i = 0, length = deck.length; i < length; i++) {
  appendCard(deckElem, deck.pop(), true)
}

document.addEventListener('mousedown', handleMouseDown)
deckElem.addEventListener('click', handleDeck)
window.addEventListener('load', () => document.querySelector('.loding').remove())
