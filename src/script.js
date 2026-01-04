/////////////////////////////////////////////////////////////////////////
// IMPORT
import './main.css'
import {
    Clock,
    Scene,
    LoadingManager,
    WebGLRenderer,
    sRGBEncoding,
    Group,
    PerspectiveCamera,
    DirectionalLight,
    PointLight,
    MeshPhongMaterial
} from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/////////////////////////////////////////////////////////////////////////
// LOADING MANAGER
const ftsLoader = document.querySelector(".lds-roller")
const looadingCover = document.getElementById("loading-text-intro")
const loadingManager = new LoadingManager()

loadingManager.onLoad = function() {
    document.querySelector(".main-container").style.visibility = 'visible'
    document.querySelector("body").style.overflow = 'auto'

    const yPosition = { y: 0 }

    new TWEEN.Tween(yPosition)
        .to({ y: 100 }, 900)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onUpdate(function(){
            looadingCover.style.setProperty(
                'transform',
                `translate( 0, ${yPosition.y}%)`
            )
        })
        .onComplete(function () {
            looadingCover.parentNode.removeChild(
                document.getElementById("loading-text-intro")
            )
            TWEEN.remove(this)
        })

    introAnimation()
    ftsLoader.parentNode.removeChild(ftsLoader)

    // Reset scroll to top after loading
    window.scroll(0, 0)
}

/////////////////////////////////////////////////////////////////////////
// DRACO LOADER
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
const loader = new GLTFLoader(loadingManager)
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
// DIV CONTAINER CREATION
const container = document.getElementById('canvas-container')
const containerDetails = document.getElementById('canvas-container-details')
const containerMaking = document.getElementById('canvas-container-making')

/////////////////////////////////////////////////////////////////////////
// GENERAL VARIABLES
let oldMaterial
let secondContainer = false
let makingContainerActive = false
let width = container.clientWidth
let height = container.clientHeight

/////////////////////////////////////////////////////////////////////////
// SCENE CREATION
const scene = new Scene()

/////////////////////////////////////////////////////////////////////////
// RENDERER CONFIG (CAMERA 1 => layer 0)
const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
renderer.autoClear = true
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer.setSize(width, height)
renderer.outputEncoding = sRGBEncoding
container.appendChild(renderer.domElement)

// RENDERER 2 => For about section (layer 0)
const renderer2 = new WebGLRenderer({ antialias: false })
renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer2.setSize(width, height)
renderer2.outputEncoding = sRGBEncoding
containerDetails.appendChild(renderer2.domElement)

// RENDERER 3 => For making section (layer 1)
const renderer3 = new WebGLRenderer({ antialias: false, alpha: true })
renderer3.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer3.setSize(containerMaking.clientWidth, containerMaking.clientHeight)
renderer3.outputEncoding = sRGBEncoding
containerMaking.appendChild(renderer3.domElement)

/////////////////////////////////////////////////////////////////////////
// CAMERAS CONFIG
const cameraGroup = new Group()
scene.add(cameraGroup)

// CAMERA 1 sees layer 0
const camera = new PerspectiveCamera(35, width / height, 1, 100)
camera.position.set(19, 1.54, -0.1)
cameraGroup.add(camera)
camera.layers.enable(0)

// CAMERA 2 sees layer 0
const camera2 = new PerspectiveCamera(
    35,
    containerDetails.clientWidth / containerDetails.clientHeight,
    1,
    100
)
camera2.position.set(1.9, 2.7, 2.7)
camera2.rotation.set(0, 1.1, 0)
scene.add(camera2)
camera2.layers.enable(0)

// CAMERA 3 sees layer 1 (the “Making” section)
const camera3 = new PerspectiveCamera(
    35,
    containerMaking.clientWidth / containerMaking.clientHeight,
    1,
    100
)
camera3.position.set(2, 2, 5)
// disable all first, then enable layer 1 only
camera3.layers.disableAll()
camera3.layers.enable(1)
camera3.lookAt(0, 0, 0)
scene.add(camera3)

/////////////////////////////////////////////////////////////////////////
// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))

    camera2.aspect = containerDetails.clientWidth / containerDetails.clientHeight
    camera2.updateProjectionMatrix()
    renderer2.setSize(containerDetails.clientWidth, containerDetails.clientHeight)
    renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1))

    camera3.aspect = containerMaking.clientWidth / containerMaking.clientHeight
    camera3.updateProjectionMatrix()
    renderer3.setSize(containerMaking.clientWidth, containerMaking.clientHeight)
    renderer3.setPixelRatio(Math.min(window.devicePixelRatio, 1))

    // Also update the contact camera below in the resizing event
    cameraContact.aspect = containerContact.clientWidth / containerContact.clientHeight
    cameraContact.updateProjectionMatrix()
    rendererContact.setSize(containerContact.clientWidth, containerContact.clientHeight)
    rendererContact.setPixelRatio(Math.min(window.devicePixelRatio, 1))
})

/////////////////////////////////////////////////////////////////////////
// SCENE LIGHTS
const sunLight = new DirectionalLight(0x435c72, 0.08)
sunLight.position.set(-100, 0, -100)
scene.add(sunLight)
// Enable layers 0,1,2 so it affects all models
sunLight.layers.enable(0)
sunLight.layers.enable(1)
sunLight.layers.enable(2)

const fillLight = new PointLight(0x88b2d9, 2.7, 4, 3)
fillLight.position.set(30, 3, 1.8)
scene.add(fillLight)
// Also enable layers 0,1,2
fillLight.layers.enable(0)
fillLight.layers.enable(1)
fillLight.layers.enable(2)

/////////////////////////////////////////////////////////////////////////
// LOADING GLB/GLTF MODEL

// 1) old_computers.glb => layer 0
loader.load('models/gltf/old_computers.glb', function (gltf) {
    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
            // Put mesh on layer 0
            obj.layers.set(0)
            oldMaterial = obj.material
            obj.material = new MeshPhongMaterial({ shininess: 45 })
        }
    })
    scene.add(gltf.scene)
    clearScene()
})

// 2) mac.glb => layer 1 for “Making” section
loader.load('models/gltf/personal_computer.glb', function (gltf2) {
    gltf2.scene.traverse((obj) => {
        if (obj.isMesh) {
            // Put mesh on layer 1
            obj.layers.set(1)
            obj.material = new MeshPhongMaterial({ shininess: 45 })
        }
    })

    // Place the second model so camera3 sees it
    gltf2.scene.position.set(0.5, -0.2, 0)
    gltf2.scene.scale.set(1.7, 1.7, 1.7)
    scene.add(gltf2.scene)
})

// Utility to dispose old references
function clearScene() {
    if (oldMaterial) oldMaterial.dispose()
    renderer.renderLists.dispose()
}


/////////////////////////////////////////////////////////////////////////
// CONTACT CONTAINER SETUP (layer 2)
/////////////////////////////////////////////////////////////////////////

const containerContact = document.getElementById('canvas-container-contact')

// Create a new renderer for the contact container
const rendererContact = new WebGLRenderer({ antialias: true, alpha: true })
rendererContact.setPixelRatio(Math.min(window.devicePixelRatio, 1))
rendererContact.setSize(containerContact.clientWidth, containerContact.clientHeight)
rendererContact.outputEncoding = sRGBEncoding
containerContact.appendChild(rendererContact.domElement)

// Create a new camera for the contact section (layer 2)
// Narrow the FOV to 35 so the model looks smaller (less “zoomed in”)
const cameraContact = new PerspectiveCamera(
  35, 
  containerContact.clientWidth / containerContact.clientHeight, 
  1, 
  100
)
// Make it see ONLY layer 2
cameraContact.layers.disableAll()
cameraContact.layers.enable(2)

// Pull the camera back and a bit higher
// so the phone is comfortably in view
cameraContact.position.set(0, 2, 15)
cameraContact.lookAt(0, 0, 0)
scene.add(cameraContact)

loader.load('models/gltf/bell.glb', function (gltf3) {
    gltf3.scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.layers.set(2);
        obj.material = new MeshPhongMaterial({ shininess: 45 });
      }
    });
  
    // Position & scale as usual
    gltf3.scene.position.set(-0, -1.1, 3); // glb position (left, up/down)
    gltf3.scene.scale.set(0.42, 0.42, 0.42);
  
    // **Rotate** the model 180 degrees around the Y-axis
    // (π radians = 180°). Tweak as needed.
    gltf3.scene.rotation.y = Math.PI;

    // gltf3.scene.rotation.y = 0.1745; // ~10° (since Math.PI ~ 3.14159)

    // gltf3.scene.rotation.y = Math.PI / 6; // 30° 

  
    scene.add(gltf3.scene);
  });
  

// Track whether the .third contact section is in view
let contactContainerActive = false
const contactSection = document.querySelector('.third')
const contactObserver = new IntersectionObserver((entries) => {
  if (entries[0].intersectionRatio > 0.05) {
    contactContainerActive = true
  } else {
    contactContainerActive = false
  }
}, {
  threshold: 0.05
})
contactObserver.observe(contactSection)


/////////////////////////////////////////////////////////////////////////
// INTRO CAMERA ANIMATION
function introAnimation() {
    new TWEEN.Tween(camera.position.set(0,4,2.7))
        .to({ x: 0, y: 2.4, z: 8.8 }, 3500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(function () {
            TWEEN.remove(this)
            document.querySelector('.header').classList.add('ended')
            document.querySelector('.first>p').classList.add('ended')
        })
}

/////////////////////////////////////////////////////////////////////////
// CLICK LISTENERS
document.getElementById('aglaea').addEventListener('click', () => {
    document.getElementById('aglaea').classList.add('active')
    document.getElementById('euphre').classList.remove('active')
    document.getElementById('thalia').classList.remove('active')
    document.getElementById('content').innerHTML = 
        'I specialize in creating visually stunning and user-friendly digital experiences. ' +
        'With a keen eye for detail and a love for innovative design, I craft websites that ' +
        'are not only beautiful but also highly functional.'
    animateCamera({ x: 1.9, y: 2.7, z: 2.7 },{ y: 1.1 })
})

document.getElementById('thalia').addEventListener('click', () => {
    document.getElementById('thalia').classList.add('active')
    document.getElementById('aglaea').classList.remove('active')
    document.getElementById('euphre').classList.remove('active')
    document.getElementById('content').innerHTML = 
        'I find joy in exploring new cultures and discovering breathtaking landscapes. ' +
        'Whether wandering through bustling city streets or hiking remote mountain trails, ' +
        'I embrace every journey as an opportunity to learn & grow.'
    animateCamera({ x: -0.9, y: 3.1, z: 2.6 },{ y: -0.1 })
})

document.getElementById('euphre').addEventListener('click', () => {
    document.getElementById('euphre').classList.add('active')
    document.getElementById('aglaea').classList.remove('active')
    document.getElementById('thalia').classList.remove('active')
    
    document.getElementById('content').innerHTML = `
        There’s nothing like getting lost in a compelling read, whether at home, in a café,
        or on a long flight to my next destination. <br>
        <em>"Once you learn to read, you will be forever free."</em> - Frederick Douglass.
    `
    animateCamera({ x: -0.4, y: 2.7, z: 1.9 }, { y: -0.6 })
})

function animateCamera(position, rotation) {
    new TWEEN.Tween(camera2.position)
        .to(position, 1800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(function () {
            TWEEN.remove(this)
        })
    new TWEEN.Tween(camera2.rotation)
        .to(rotation, 1800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(function () {
            TWEEN.remove(this)
        })
}

/////////////////////////////////////////////////////////////////////////
// PARALLAX CONFIG
const cursor = { x:0, y:0 }
const clock = new Clock()
let previousTime = 0

/////////////////////////////////////////////////////////////////////////
// RENDER LOOP
function rendeLoop() {
    TWEEN.update()

    // Always render the main camera (layer 0)
    renderer.render(scene, camera)

    // If second container is in view, render camera2 (layer 0)
    if (secondContainer) {
        renderer2.render(scene, camera2)
    }

    // If the making section is in view, render camera3 (layer 1)
    if (makingContainerActive) {
        renderer3.render(scene, camera3)
    }

    // If the contact section is in view, render cameraContact (layer 2)
    if (contactContainerActive) {
        rendererContact.render(scene, cameraContact)
    }

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Subtle parallax effect for the fillLight / cameraGroup
    const parallaxY = cursor.y
    fillLight.position.y -= (parallaxY * 9 + fillLight.position.y - 2) * deltaTime

    const parallaxX = cursor.x
    fillLight.position.x += (parallaxX * 8 - fillLight.position.x) * 2 * deltaTime

    cameraGroup.position.z -= (parallaxY / 3 + cameraGroup.position.z) * 2 * deltaTime
    cameraGroup.position.x += (parallaxX / 3 - cameraGroup.position.x) * 2 * deltaTime

    requestAnimationFrame(rendeLoop)
}
rendeLoop()

/////////////////////////////////////////////////////////////////////////
// MOUSE MOVE
document.addEventListener('mousemove', (event) => {
    event.preventDefault()
    cursor.x = event.clientX / window.innerWidth - 0.5
    cursor.y = event.clientY / window.innerHeight - 0.5
    handleCursor(event)
}, false)

const customCursor = document.querySelector('.cursor')
function handleCursor(e) {
    const x = e.clientX
    const y = e.clientY
    if (customCursor) {
      customCursor.style.cssText = `left: ${x}px; top: ${y}px;`
    }
}

/////////////////////////////////////////////////////////////////////////
// DISABLE RENDERER BASED ON CONTAINER VIEW (.second => camera2)
const watchedSection = document.querySelector('.second')
function obCallback(payload) {
    if (payload[0].intersectionRatio > 0.05){
        secondContainer = true
    } else {
        secondContainer = false
    }
}
const ob = new IntersectionObserver(obCallback, {
    threshold: 0.05
})
ob.observe(watchedSection)

/////////////////////////////////////////////////////////////////////////
// MAKING SECTION OBSERVER (.making-section => camera3)
const makingSection = document.querySelector('.making-section')
function makingObserverCallback(entries) {
    if (entries[0].intersectionRatio > 0.05) {
        makingContainerActive = true
    } else {
        makingContainerActive = false
    }
}
const makingObserver = new IntersectionObserver(makingObserverCallback, {
    threshold: 0.05
})
makingObserver.observe(makingSection)

/////////////////////////////////////////////////////////////////////////
// MAGNETIC MENU
const btn = document.querySelectorAll('nav > .a')
function update(e) {
    const span = this.querySelector('span')
    if (e.type === 'mouseleave') {
        span.style.cssText = ''
    } else {
        const { offsetX: x, offsetY: y } = e
        const { offsetWidth: width, offsetHeight: height } = this
        const walk = 20
        const xWalk = (x / width) * (walk * 2) - walk
        const yWalk = (y / height) * (walk * 2) - walk
        span.style.cssText = `transform: translate(${xWalk}px, ${yWalk}px);`
    }
}
btn.forEach(b => b.addEventListener('mousemove', update))
btn.forEach(b => b.addEventListener('mouseleave', update))

///////////////////////////////////////////////////////////////////////
// PROJECTS SLIDER (RESPONSIVE)
const projectsContainer = document.getElementById('projectsContainer')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')
const viewport = document.querySelector('.portfolio-viewport')

let currentIndex = 0

function getGapPx() {
  const style = window.getComputedStyle(projectsContainer)
  const gapValue = (style.gap || style.columnGap || "0px").toString().split(" ")[0]
  return parseFloat(gapValue) || 0
}

function getCardWidth() {
  const card = projectsContainer.querySelector('.portfolio-card')
  if (!card) return 0
  const gap = getGapPx()
  return card.getBoundingClientRect().width + gap
}

function getVisibleCards() {
  const cardWidth = getCardWidth()
  if (!cardWidth) return 1
  const viewportWidth = viewport.getBoundingClientRect().width
  return Math.max(1, Math.floor(viewportWidth / cardWidth))
}

function getMaxIndex() {
  const totalCards = projectsContainer.querySelectorAll('.portfolio-card').length
  const visibleCards = getVisibleCards()
  return Math.max(0, totalCards - visibleCards)
}

function clampIndex() {
  const maxIndex = getMaxIndex()
  if (currentIndex > maxIndex) currentIndex = maxIndex
  if (currentIndex < 0) currentIndex = 0
}

function updateArrows() {
  const maxIndex = getMaxIndex()
  if (prevBtn) prevBtn.disabled = currentIndex === 0
  if (nextBtn) nextBtn.disabled = currentIndex === maxIndex

  if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? "0.35" : "1"
  if (nextBtn) nextBtn.style.opacity = currentIndex === maxIndex ? "0.35" : "1"
}

function updateSlider() {
  clampIndex()
  const cardWidth = getCardWidth()
  projectsContainer.style.transform = `translateX(-${currentIndex * cardWidth}px)`
  updateArrows()
}

nextBtn.addEventListener('click', () => {
  currentIndex += 1
  updateSlider()
})

prevBtn.addEventListener('click', () => {
  currentIndex -= 1
  updateSlider()
})

window.addEventListener('resize', updateSlider)

updateSlider()


// IntersectionObserver for the portfolio section fade
const portfolioSection = document.getElementById('projects')
const portfolioObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.intersectionRatio > 0.1) {
      entry.target.classList.add('visible')
    } else {
      entry.target.classList.remove('visible')
    }
  })
}, {
  threshold: 0.1
})
portfolioObserver.observe(portfolioSection)

// Skills fade in/out
const skillsSection = document.querySelector('.making-section')
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.intersectionRatio > 0.1) {
      entry.target.classList.add('visible')
    } else {
      entry.target.classList.remove('visible')
    }
  })
}, {
  threshold: 0.1
})
skillsObserver.observe(skillsSection)

// about fade in/out
const secondSection = document.querySelector('.second')
const secondObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.intersectionRatio > 0.1) {
            entry.target.classList.add('visible')
        } else {
            entry.target.classList.remove('visible')
        }
    })
}, {
    threshold: 0.1
})
secondObserver.observe(secondSection)

// contact fade in/out
const thirdSection = document.querySelector('.third')
const thirdObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.intersectionRatio > 0.1) {
            entry.target.classList.add('visible')
        } else {
            entry.target.classList.remove('visible')
        }
    })
}, {
    threshold: 0.1
})
thirdObserver.observe(thirdSection)

// Smooth scroll among nav links
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("nav a").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault()
            const targetId = this.getAttribute("href").substring(1)
            const targetSection = document.getElementById(targetId)
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: "smooth"
                })
            }
        })
    })

    // Ensure sections fit screen height
    function adjustSectionsHeight() {
        document.querySelectorAll("section").forEach(section => {
            section.style.minHeight = window.innerHeight + "px"
        })
    }

    adjustSectionsHeight()
    window.addEventListener("resize", adjustSectionsHeight)
})

// Footer year
document.addEventListener("DOMContentLoaded", function() {
    const footerYearEl = document.getElementById("footer-year")
    footerYearEl.textContent = "© " + new Date().getFullYear() + " LuluLogics"
})


// Contact form submission handler
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const serviceID = 'service_xrasxud';
    const templateToUser = 'template_v1fs56r';   // Auto-reply to user
    const templateToMe   = 'template_g2xhabt';   // Notification to you
  
    // Send to you first
    emailjs.sendForm(serviceID, templateToMe, this)
      .then(function() {
        console.log("Message sent to Lulu ✅");
  
        // Then auto-reply to user
        emailjs.sendForm(serviceID, templateToUser, document.getElementById('contact-form'))
          .then(() => {
            alert('Message successfully sent to Lulu! ✅');
            document.getElementById('contact-form').reset();
          }, (error) => {
            alert('Auto-reply failed: ' + JSON.stringify(error));
          });
  
      }, function(error) {
        alert('Oops! Something went wrong sending to Lulu.\n' + JSON.stringify(error));
      });
  });
