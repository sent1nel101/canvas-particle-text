const canvas = document.getElementById("canvas")
const c = canvas.getContext("2d", { willReadFrequently: true })
var userText = ""

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let colors

colors = ["#4C4A59", "#1B7F7A", "#0897B4", "#4CABA6", "#F2CDAC"]

class Particle {
  constructor(effect, x, y, color) {
    this.effect = effect
    this.x = Math.random() * this.effect.canvasWidth
    this.y = 0
    this.color = color
    this.originY = y
    this.originX = x
    this.size = this.effect.gap
    this.dx = 0
    this.dy = 0
    this.vx = 0
    this.vy = 0
    this.force = 0
    this.angle = 0
    this.distance = 0
    this.friction = Math.random() * 0.6 + 0.15
    this.ease = Math.random() * 0.1 + 0.05
  }

  draw() {
    this.effect.context.fillStyle = this.color
    this.effect.context.fillRect(this.x, this.y, this.size, this.size)
  }

  update() {
    this.dx = this.effect.mouse.x - this.x
    this.dy = this.effect.mouse.y - this.y
    this.distance = this.dx * this.dx + this.dy * this.dy
    this.force = -this.effect.mouse.radius / this.distance

    if (this.distance < this.effect.mouse.radius) {
      this.angle = Math.atan2(this.dy, this.dx)
      this.vx += this.force * Math.cos(this.angle)
      this.vy += this.force * Math.sin(this.angle)
    }
    this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease
    this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease
  }
}

class Effect {
  constructor(context, canvasWidth, canvasHeight) {
    this.context = context
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.textX = canvas.width / 2
    this.textY = canvas.height / 2
    this.fontSize = 125
    this.lineHeight = this.fontSize * 0.8
    this.maxTextWidth = this.canvasWidth * 0.8
    this.textInput = document.getElementById("textInput")
    this.textInput.addEventListener("keyup", (e) => {
      if (e.key !== " ") {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        this.wrapText(e.target.value)
      }
    })

    this.particles = []
    this.gap = 2
    this.mouse = {
      radius: 5000,
      x: 0,
      y: 0,
    }
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.x
      this.mouse.y = e.y
    })
  }
  wrapText(text) {
    this.context.font = "50px Helvetica"
    const gradient = this.context.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    )
    gradient.addColorStop(0.1, "#4C4A59")
    gradient.addColorStop(0.5, "#0897B4")
    gradient.addColorStop(0.7, "#4CABA6")
    this.context.fillStyle = gradient
    this.context.textBaseline = "middle"
    this.context.textAlign = "center"
    this.context.font = this.fontSize + "px Oleo Script"
    this.context.lineWidth = 3
    // this.context.letterSpacing = "3px"
    this.context.strokeStyle = "goldenrod"
    // break into multiple rows
    let linesArray = []
    let lineCounter = 0
    let line = ""
    let words = text.split(" ")

    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + " "
      if (this.context.measureText(testLine).width > this.maxTextWidth) {
        line = words[i] + " "
        lineCounter++
      } else {
        line = testLine
      }
      linesArray[lineCounter] = line
    }
    let textHeight = lineCounter * this.lineHeight
    this.textY = canvas.height / 2 - textHeight / 2
    linesArray.forEach((line, index) => {
      this.context.fillText(
        line,
        this.textX,
        this.textY + index * this.lineHeight
      )
      this.context.strokeText(
        line,
        this.textX,
        this.textY + index * this.lineHeight
      )
    })
    this.convertToParticles()
  }
  convertToParticles() {
    this.particles = []
    const pixels = this.context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    for (let y = 0; y < this.canvasHeight; y += this.gap) {
      for (let x = 0; x < canvas.width; x += this.gap) {
        const index = (y * this.canvasWidth + x) * 4
        const alpha = pixels[index + 3]
        if (alpha > 0) {
          const red = pixels[index]
          const green = pixels[index + 1]
          const blue = pixels[index + 2]
          const color = `rgb(${red}, ${green}, ${blue})`
          this.particles.push(new Particle(this, x, y, color))
        }
      }
    }
  }
  render() {
    this.particles.forEach((particle) => {
      particle.draw()
      particle.update()
    })
  }
  resize(width, height) {
    this.canvasWidth = width
    this.canvasHeight = height
    this.textX = canvas.width / 2
    this.textY = canvas.height / 2
    this.maxTextWidth = this.canvasWidth * 0.5
  }
}

const effect = new Effect(c, canvas.width, canvas.height)
effect.wrapText(effect.textInput.value)

function animate() {
  c.clearRect(0, 0, this.canvas.width, this.canvas.height)
  effect.render()
  requestAnimationFrame(animate)
}
animate()

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  effect.resize(canvas.width, canvas.height)
  effect.wrapText(effect.textInput.value)
  console.log("resizing")
})
