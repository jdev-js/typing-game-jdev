const $time = document.querySelector('time')
const $paragraph = document.querySelector('p')
const $input = document.querySelector('input')
const $game = document.querySelector('#game')
const $initGame = document.querySelector('#init-game')
const $resultContainer = document.querySelector('#result')

const TEXT = `const string = "jesus"; const number = 20 function print(msg) => console.log(msg)`
const INITIAL_TIME = 30

let init_game = false
let words = []
let currentTime

$game.querySelector('p').innerHTML = `${TEXT.split(' ')
  .slice(0, 32)
  .map((word, index) => {
    const letters = word.split('')
    return `<word>
              ${letters.map((letter) => `<letter>${letter}</letter>`).join('')}
            </word>`
  })
  .join('')}`

if (init_game === false) {
  $game.style.filter = 'blur(2px)'
  $initGame.addEventListener('click', () => {
    init_game = true
    $game.style.filter = 'none'
    $initGame.style.display = 'none'
    $initGame.innerHTML = ''
    initGame()
    initEvent()
  })
}

function initGame() {
  $input.value = ''
  $game.style.display = 'flex'
  $resultContainer.style.display = 'none'
  words = TEXT.split(' ').slice(0, 32)
  currentTime = INITIAL_TIME
  $time.textContent = currentTime

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

  const intervalId = setInterval(() => {
    currentTime -= 1
    $time.textContent = currentTime

    if (currentTime === 0) {
      gameOver()
      clearInterval(intervalId)
    }
  }, 1000)
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

function gameOver() {
  const $buttonReload = document.querySelector('#result > button')
  const $wpm = document.querySelector('.wpm')
  const $accuracy = document.querySelector('.accuracy')

  // calcular las estadisticas del usuario
  const correctWord = $paragraph.querySelectorAll('word.correct').length
  const correctLetter = $paragraph.querySelectorAll('letter.correct').length
  const incorrectLetter = $paragraph.querySelectorAll('letter.incorrect').length

  const totalLetters = incorrectLetter + correctLetter
  const accuracy = totalLetters > 0 ? (correctLetter / totalLetters) * 100 : 0
  const wpm = (correctWord * 60) / 10

  // Mostrar resultado
  $wpm.innerHTML = `wpm: <span>${wpm}</span>`
  $accuracy.innerHTML = `accuracy: <span>${accuracy.toFixed(2)}%</span>`

  $game.style.display = 'none'
  $resultContainer.style.display = 'flex'
  $buttonReload.addEventListener('click', () => initGame())
  init_game = false
}
