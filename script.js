const header = document.querySelector('.header')
const main = document.querySelector('main')
const footer = document.querySelector('footer')
const secretDiv = document.querySelector('.secret-div')

const keysPressed = []
const secretCode = ['h', 'a', 'c', 'k']

const confettiSettings = {
  target: 'my-canvas',
  size: 1.4,
  max: 150
}
const confetti = new ConfettiGenerator(confettiSettings)

function keysDetector(e) {
  keysPressed.push(e.key)

  if (keysPressed.length > secretCode.length) {
    keysPressed.shift()
  }
  
  if (JSON.stringify(keysPressed) == JSON.stringify(secretCode)) {
    
    secretDiv.style.display = 'block'
    header.style.display = 'none'
    main.style.display = 'none'
    footer.style.display = 'none'
    
    confetti.render()
    anime({
      targets: 'body',
      rotate: '1turn',
      backgroundColor: '#fcba03',
      duration: 2000,
    })

  }
}

window.addEventListener('keyup', keysDetector)