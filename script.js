import { data as wordsData } from './data.js'

const $infoGame = document.querySelector('.info-game')
const $paragraph = document.querySelector('.text-game')
const $input = document.querySelector('input')
const $header = document.querySelector('header')
const $game = document.querySelector('#game')
const $initGame = document.querySelector('#init-game')
const $resultContainer = document.querySelector('#result')
const $tabOption = document.querySelectorAll('header ul li')
const $buttonRetry = document.querySelector('#retry-game')

let words = []
let currentTime
let wordsInfo = 0
let currentWordsInfo = 0
let activeOption = ''

$buttonRetry.addEventListener('click', () => {
  initGame()
})

$initGame.addEventListener('click', () => {
  initGame()
  initEvent()
})

$initGame.addEventListener('keydown', () => {
  initGame()
  initEvent()
})

$tabOption.forEach((tab) => {
  tab.addEventListener('click', () => {
    $tabOption.forEach((tab) => {
      tab.classList.remove('active')
    })
    tab.classList.add('active')
    activeOption = tab.textContent.trim().toLowerCase()
  })
})

const INITIAL_TIME = 30

$game.style.display = 'none'
$resultContainer.style.display = 'none'

$initGame.querySelector('p').innerHTML = `${wordsData
  .toSorted(() => Math.random() - 0.5)
  .slice(0, 30)
  .map((word, index) => {
    const letters = word.split('')
    return `<word>
              ${letters.map((letter) => `<letter>${letter}</letter>`).join('')}
            </word>`
  })
  .join('')}`

function initGame() {
  currentWordsInfo = 0
  wordsInfo = 0
  $input.value = ''
  $initGame.style.display = 'none'
  $game.style.display = 'flex'
  $resultContainer.style.display = 'none'
  $header.style.display = 'none'
  words = wordsData.toSorted(() => Math.random() - 0.5).slice(0, 30)

  // Inicializar los datos del juego
  wordsInfo = words.length
  currentTime = INITIAL_TIME

  if (activeOption === 'time') {
    $infoGame.textContent = currentTime
  } else {
    $infoGame.textContent = `${currentWordsInfo}/${wordsInfo}`
  }

  $paragraph.innerHTML = words
    .map((word, index) => {
      const letters = word.split('')
      if (word === 'const') {
      }
      return `<word>
              ${letters.map((letter) => `<letter>${letter}</letter>`).join('')}
            </word>`
    })
    .join('')

  const $firstWord = $paragraph.querySelector('word')
  $firstWord.classList.add('active')
  $firstWord.querySelector('letter').classList.add('active')

  if (activeOption === 'time') {
    const intervalId = setInterval(() => {
      currentTime -= 1
      renderInfo()
      console.log('render')

      if (currentTime === 0) {
        gameOver()
        clearInterval(intervalId)
      }
    }, 1000)
  }
}

function initEvent() {
  document.addEventListener('keydown', () => {
    $input.focus()
  })
  $input.addEventListener('keydown', onKeyDown)
  $input.addEventListener('keyup', onKeyUp)
}
function onKeyUp() {
  const $currentWord = $paragraph.querySelector('word.active')
  const $currentLetter = $currentWord.querySelector('letter.active')

  const currentWord = $currentWord.innerText.trim()
  $input.maxLength = currentWord.length

  const $allLetters = $currentWord.querySelectorAll('letter')

  $allLetters.forEach(($letter) =>
    $letter.classList.remove('correct', 'incorrect')
  )

  $input.value.split('').forEach((char, index) => {
    const $letter = $allLetters[index]
    const letterToCheck = currentWord[index]

    const isCorrect = char === letterToCheck
    const letterClass = isCorrect ? 'correct' : 'incorrect'
    $letter.classList.add(letterClass)
  })
  $currentLetter.classList.remove('active')
  const inputLength = $input.value.length
  const $nextActiveLetter = $allLetters[inputLength]

  if ($nextActiveLetter) {
    $nextActiveLetter.classList.add('active')
  } else {
    $currentLetter.classList.add('active', 'is-last')
  }
}
function onKeyDown(event) {
  const $currentWord = $paragraph.querySelector('word.active')
  const $currentLetter = $currentWord.querySelector('letter.active')
  const { key } = event
  if (key === ' ') {
    event.preventDefault()
    const $nextWord = $currentWord.nextElementSibling
    const $nextLetter = $nextWord.querySelector('letter')

    $currentWord.classList.remove('active', 'marked')
    $currentLetter.classList.remove('active')

    $nextWord.classList.add('active')
    $nextLetter.classList.add('active')

    $input.value = ''
    currentWordsInfo += 1
    renderInfo()

    const hasMissingLetters =
      $currentWord.querySelectorAll('letter:not(.correct)').length > 0
    const classToAdd = hasMissingLetters ? 'marked' : 'correct'
    $currentWord.classList.add(classToAdd)
    return
  }

  if (key === 'Enter') {
    gameOver()
  }

  if (key === 'Backspace') {
    const $prevWord = $currentWord.previousElementSibling
    const $prevLetter = $currentLetter?.previousElementSibling

    if (!$prevWord && !$prevLetter) {
      event.preventDefault()
      return
    }

    const $wordMarked = $paragraph.querySelector('word.marked')
    if ($wordMarked && !$prevLetter) {
      event.preventDefault()
      $prevWord.classList.remove('marked')
      $prevWord.classList.add('active')

      const $letterToGo = $prevWord.querySelector('letter:last-child')

      $currentLetter.classList.remove('active')
      $letterToGo.classList.add('active')

      $input.value = [
        ...$prevWord.querySelectorAll('letter.correct, letter.incorrect'),
      ]
        .map(($el) => {
          return $el.classList.contains('correct') ? $el.innerText : '*'
        })
        .join('')
    }
  }
}

function renderInfo() {
  if (activeOption === 'time') {
    $infoGame.textContent = currentTime
  } else {
    $infoGame.textContent = `${currentWordsInfo}/${wordsInfo}`
  }
}

function gameOver() {
  const $buttonReload = document.querySelector('#result > button')
  const $wpm = document.querySelector('#wpm')
  const $accuracy = document.querySelector('#acc')

  // calcular las estadisticas del usuario
  const correctWord = $paragraph.querySelectorAll('word.correct').length
  const correctLetter = $paragraph.querySelectorAll('letter.correct').length
  const incorrectLetter = $paragraph.querySelectorAll('letter.incorrect').length

  const totalLetters = incorrectLetter + correctLetter
  const accuracy = totalLetters > 0 ? (correctLetter / totalLetters) * 100 : 0
  const wpm = (correctWord * 60) / 10

  // Mostrar resultado
  $wpm.innerText = `${wpm}`
  $accuracy.innerText = `${accuracy.toFixed(2)}%`

  $game.style.display = 'none'
  $resultContainer.style.display = 'flex'
  $buttonReload.addEventListener('click', () => initGame())
}
