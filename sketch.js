// Array of emotions with images, sounds, messages, and colors
let emotions = [];
let icons = [];
let currentMessage = "";
let currentSound = null;
let fft; // p5 FFT analyzer for sound visualization
let currentVisualizerColor;
let emotionSelected = false; // flag to track if an emotion is active
let fadeAlpha = 255; // for fading text effect
let cam;
let cameraStarted = false;
let particles = []; // particles for visual effect
let captureButton;
let backButton;
let noteInput;
let placeholderText = "Leave a note for yourself...";
let userTyped = false;
let countdown = 0;
let countdownStartTime = 0;
let isCountingDown = false;
let startButton;

function preload() {
  // Load all emotion data including images and sounds before setup
  emotions = [
    {
      label: "Motivation",
      img: loadImage("motivation.png"),
      sounds: [
        loadSound("mov1.mp3"),
        loadSound("mov2.mp3"),
        loadSound("mov3.mp3"),
        loadSound("mov4.mp3")
      ],
      message: "Rest if you must, but don’t quit. You’re stronger than you think, and you’re doing great✨",
      color: color(255, 100, 0)
    },
    {
      label: "Healing",
      img: loadImage("healing.png"),
      sounds: [
        loadSound("heal1.mp3"),
        loadSound("heal2.mp3"),
        loadSound("heal3.mp3"),
        loadSound("heal4.mp3")
      ],
      message: "Breathe in. Heal. Begin again🌿",
      color: color(100, 200, 180)
    },
    {
      label: "Being loved",
      img: loadImage("fallinlove.png"),
      sounds: [
        loadSound("lov1.mp3"),
        loadSound("lov2.mp3"),
        loadSound("lov3.mp3"),
        loadSound("lov4.mp3")
      ],
      message: "Love comes to you not because you are perfect, but because you are yourself – and that is enough💖",
      color: color(255, 150, 200)
    },
    {
      label: "Self-love",
      img: loadImage("lovemyself.png"),
      sounds: [
        loadSound("alone1.mp3"),
        loadSound("alone2.mp3"),
        loadSound("alone3.mp3"),
        loadSound("alone4.mp3")
      ],
      message: "Loving yourself is the first step to embracing happiness🎁",
      color: color(150, 100, 255)
    },
    {
      label: "Sadness",
      img: loadImage("sad.png"),
      sounds: [
        loadSound("sad1.mp3"),
        loadSound("sad2.mp3"),
        loadSound("sad3.mp3"),
        loadSound("sad4.mp3")
      ],
      message: "Sometimes, simply listening to your sadness is the first step toward peace🕊️",
      color: color(100, 100, 200)
    },
    {
      label: "Anger",
      img: loadImage("angry.png"),
      sounds: [
        loadSound("angry1.mp3"),
        loadSound("angry2.mp3"),
        loadSound("angry3.mp3"),
        loadSound("angry4.mp3")
      ],
      message: "Breathe deeply, letting all anger transform into the gentle strength of compassion🌸",
      color: color(255, 50, 50)
    }
  ];
}

function setup() {
  pixelDensity(1); // avoid retina scaling issues
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(18);
  noStroke();

  // Initialize FFT analyzer for sound visualization (Week 7 concept)
  fft = new p5.FFT();

  // Create icons for each emotion and position them evenly
  let spacing = width / (emotions.length + 1);
  for (let i = 0; i < emotions.length; i++) {
    let e = emotions[i];
    icons.push({
      label: e.label,
      x: spacing * (i + 1),
      y: height / 2,
      img: e.img,
      sounds: e.sounds,
      message: e.message,
      color: e.color,
      hovered: false
    });
  }

  // Setup UI buttons and inputs, hide them initially (Week 6 - input & interaction)
  captureButton = createButton('📸 Save your emotional journey');
  captureButton.position(width - 150, height - 50);
  captureButton.mousePressed(captureAndSave);
  captureButton.hide();

  backButton = createButton('Return');
  backButton.position(50, height - 50);
  backButton.mousePressed(resetToEmotionScreen);
  backButton.hide();

  noteInput = createInput('');
  noteInput.position(width / 2 - 150, height - 100);
  noteInput.size(300, 40);
  noteInput.input(() => {
    if (noteInput.value().length > 0) {
      userTyped = true; // track if user typed any note
    }
  });
  noteInput.hide();

  startButton = createButton("Tap to Begin 🎵");
  startButton.position(width / 2 - 80, height / 2);
  startButton.mousePressed(initInteraction);
}

// Unlock audio context on user interaction (required by browsers)
function initInteraction() {
  userStartAudio();
  startButton.hide();
}

// Start camera feed, show UI controls for capturing & notes (Week 5 & 6 - media input & UI)
function startCamera() {
  cam = createCapture(VIDEO);
  cam.size(width, height);
  cam.elt.muted = true;
  cam.hide();

  captureButton.show();
  backButton.show();
  noteInput.show();
}

function draw() {
  background(255);

  // Show camera feed as background when emotion selected and sound playing
  if (cam && emotionSelected && currentSound && currentSound.isPlaying()) {
    push();
    tint(255, 255);
    image(cam, width / 2, height / 2, width, height);
    fill(255, 255, 255, 30); // semi-transparent overlay for soft effect
    rect(0, 0, width, height);
    pop();
  }

  if (!emotionSelected) {
    // Show intro message + emotion icons with hover effect
    fill(100, fadeAlpha);
    textSize(24);
    text("Pause, embrace your feelings—let them soothe and empower your soul🌿🕊️", width / 2, 40);
    textSize(18);

    for (let icon of icons) {
      // Detect if mouse is near icon (hover)
      icon.hovered = dist(mouseX, mouseY, icon.x, icon.y) < 60;
      if (icon.hovered) {
        fill(255, 255, 200, 150);
        ellipse(icon.x, icon.y, 140, 140);
      }

      // Slight scale and shake effect on hover for interactivity
      let scaleAmt = icon.hovered ? 1.1 : 1;
      let shake = icon.hovered ? random(-2, 2) : 0;

      push();
      translate(icon.x + shake, icon.y + shake);
      scale(scaleAmt);
      image(icon.img, 0, 0, 100, 100);
      pop();

      fill(50);
      text(icon.label, icon.x, icon.y + 80);
    }
  } else {
    // Fade out intro text smoothly after emotion is selected
    fadeAlpha -= 5;
    if (fadeAlpha < 0) fadeAlpha = 0;
  }

  // Display current emotion message with subtle vertical oscillation & color lerp (Week 7 - animation & color)
  if (currentMessage !== "") {
    textSize(22);
    let offsetY = sin(frameCount * 0.05) * 5;
    let lerpedColor = lerpColor(color(50), currentVisualizerColor, sin(frameCount * 0.05) * 0.5 + 0.5);
    fill(lerpedColor);
    text(currentMessage, width / 2, 40 + offsetY);
    textSize(18);
  }

  // Show placeholder text in note input if user hasn't typed yet
  if (!userTyped && emotionSelected) {
    fill(150);
    textSize(16);
    text(placeholderText, width / 2, height - 80);
  }

  // If playing sound, show sound visualizer bars and particles (Week 7 - FFT & particles)
  if (emotionSelected && currentSound && currentSound.isPlaying()) {
    drawBarVisualizer();
    updateParticles();
  }

  // Countdown for capture timer, show big number
  if (isCountingDown) {
    let elapsed = int((millis() - countdownStartTime) / 1000);
    let remaining = countdown - elapsed;

    if (remaining >= 0) {
      fill(0, 150);
      textSize(64);
      text(remaining + 1, width / 2, height / 2);
    }

    if (remaining < 0) {
      isCountingDown = false;
      saveCapturedImage();
    }
  }
}

// Draw bar visualizer using FFT frequency data (Week 7)
function drawBarVisualizer() {
  let spectrum = fft.analyze(); // get frequency spectrum array
  let w = width / spectrum.length;

  noStroke();
  for (let i = 0; i < spectrum.length; i++) {
    let amp = spectrum[i];
    let h = map(amp, 0, 256, 0, height); // map amplitude to height
    let x = i * w;
    fill(currentVisualizerColor);
    rect(x, height - h, w - 2, h);
  }
}

// Handle mouse press to select an emotion (Week 4 & 3: event, if-else logic)
function mousePressed() {
  if (!emotionSelected) {
    stopAllSounds();
    currentMessage = "";
    currentVisualizerColor = color(100, 150, 255); // default blue

    for (let icon of icons) {
      if (icon.hovered) {
        // Play a random sound from the selected emotion's set
        let randomSound = random(icon.sounds);
        currentSound = randomSound;
        currentSound.setVolume(1.0);
        currentSound.play();

        // When sound ends, reset UI to emotion selection screen
        currentSound.onended(() => {
          emotionSelected = false;
          fadeAlpha = 255;
        });

        currentMessage = icon.message;
        currentVisualizerColor = icon.color;
        emotionSelected = true;

        if (!cameraStarted) {
          startCamera();
          cameraStarted = true;
        } else {
          captureButton.show();
          backButton.show();
          noteInput.show();
        }

        // Create visual particles with emotion color
        createParticles(icon.color);
      }
    }
  }
}

// Stop all sounds playing (safety to prevent overlap)
function stopAllSounds() {
  for (let icon of icons) {
    for (let s of icon.sounds) {
      if (s.isPlaying()) s.stop();
    }
  }
}

// Create particles for visual effect (Week 7 - particles)
function createParticles(col) {
  particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: width / 2,
      y: height / 2,
      vx: random(-2, 2),
      vy: random(-2, 2),
      alpha: 255,
      color: col
    });
  }
}

// Update particle positions and fade them out
function updateParticles() {
  for (let p of particles) {
    fill(red(p.color), green(p.color), blue(p.color), p.alpha);
    noStroke();
    ellipse(p.x, p.y, 5, 5);

    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 3; // slowly fade out
  }
  // Remove particles that are fully transparent
  particles = particles.filter(p => p.alpha > 0);
}

// Start countdown to capture screen
function captureAndSave() {
  countdown = 5; // 5 seconds countdown
  countdownStartTime = millis();
  isCountingDown = true;
}

// Save the current canvas with user's note overlaid
function saveCapturedImage() {
  let c = get(); // grab current canvas pixels
  let noteText = noteInput.value();

  // Create new graphics layer to draw snapshot + text
  let snapshot = createGraphics(width, height);
  snapshot.image(c, 0, 0);
  snapshot.fill(255, 230);
  snapshot.rect(0, height - 100, width, 100); // semi-transparent rectangle for note bg
  snapshot.textAlign(CENTER, CENTER);
  snapshot.textSize(18);
  snapshot.fill(0);
  snapshot.text(noteText, width / 2, height - 60);

  snapshot.loadPixels();
  save(snapshot, 'postcard.jpg'); // save image as jpg
}

// Reset to emotion selection screen, clear states
function resetToEmotionScreen() {
  emotionSelected = false;
  fadeAlpha = 255;
  stopAllSounds();
  currentMessage = "";
  particles = [];
  noteInput.value("");
  userTyped = false;
  captureButton.hide();
  backButton.hide();
  noteInput.hide();
}

// Handle browser window resize to adjust canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
