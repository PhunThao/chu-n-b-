let emotions = []; // Array to store different emotional states
let icons = []; // Array to store icon data for each emotion
let currentMessage = ""; // Message shown based on selected emotion
let currentSound = null; // The current sound being played
let fft; // Fast Fourier Transform object for audio visualization
let currentVisualizerColor; // The color used in the visualizer
let emotionSelected = false; // Flag to check if an emotion is selected
let fadeAlpha = 255; // For fading text when emotion is selected
let cam; // Camera object
let cameraStarted = false; // Check if the camera has started
let particles = []; // Particle effect array
let captureButton; // Button to save current emotional state as image
let backButton; // Button to return to the emotion selection screen
let noteInput; // Input box for user to leave a personal note
let placeholderText = "Leave a note for yourself..."; // Placeholder text
let userTyped = false; // Flag to check if user has typed in the note
let countdown = 0; // Countdown duration for saving image
let countdownStartTime = 0; // Start time of countdown
let isCountingDown = false; // Whether countdown is currently active
let startButton; // Button to start the whole experience

function preload() {
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
  pixelDensity(1); // Ensures consistent display on all screens
  createCanvas(windowWidth, windowHeight); // Creates canvas that fits window
  imageMode(CENTER); // Images are drawn from their center
  textAlign(CENTER, CENTER); // Center-align text
  textSize(18); // Default text size
  noStroke(); // Disable outlines for shapes
  fft = new p5.FFT(); // Initialize FFT for audio spectrum

  let spacing = width / (emotions.length + 1); // Calculate spacing between icons
  for (let i = 0; i < emotions.length; i++) {
    let e = emotions[i];
    icons.push({ // Create icon data for each emotion
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

  captureButton = createButton('📸 Save your emotional journey'); // Button to save snapshot
  captureButton.position(width - 150, height - 50);
  captureButton.mousePressed(captureAndSave);
  captureButton.hide(); // Initially hidden

  backButton = createButton('Return'); // Button to go back to emotion menu
  backButton.position(50, height - 50);
  backButton.mousePressed(resetToEmotionScreen);
  backButton.hide();

  noteInput = createInput(''); // Input for user message
  noteInput.position(width / 2 - 150, height - 100);
  noteInput.size(300, 40);
  noteInput.input(() => {
    if (noteInput.value().length > 0) {
      userTyped = true; // Track if user typed something
    }
  });
  noteInput.hide();

  startButton = createButton("Tap to Begin 🎵"); // Initial start button
  startButton.position(width / 2 - 80, height / 2);
  startButton.mousePressed(initInteraction);
}

function initInteraction() {
  userStartAudio(); // Required to enable sound in browser on interaction
  startButton.hide(); // Hide the start button after clicked
}

function initInteraction() {
  userStartAudio(); // Required to enable sound in browser on interaction
  startButton.hide(); // Hide the start button after clicked
}

function draw() {
  background(255); // Clear background to white

  // Show webcam + overlay if emotion is selected and music is playing
  if (cam && emotionSelected && currentSound && currentSound.isPlaying()) {
    push();
    tint(255, 255);
    image(cam, width / 2, height / 2, width, height); // Show webcam
    fill(255, 255, 255, 30);
    rect(0, 0, width, height); // White overlay
    pop();
  }

  if (!emotionSelected) {
    // Display introduction message
    fill(100, fadeAlpha);
    textSize(24);
    text("Pause, embrace your feelings—let them soothe and empower your soul🌿🕊️", width / 2, 40);
    textSize(18);

    // Show all emotion icons with hover effect
    for (let icon of icons) {
      icon.hovered = dist(mouseX, mouseY, icon.x, icon.y) < 60;
      if (icon.hovered) {
        fill(255, 255, 200, 150);
        ellipse(icon.x, icon.y, 140, 140);
      }

      let scaleAmt = icon.hovered ? 1.1 : 1;
      let shake = icon.hovered ? random(-2, 2) : 0;

      push();
      translate(icon.x + shake, icon.y + shake);
      scale(scaleAmt);
      image(icon.img, 0, 0, 100, 100); // Draw emotion icon
      pop();

      fill(50);
      text(icon.label, icon.x, icon.y + 80); // Draw label
    }
  } else {
    // Fade out message after selection
    fadeAlpha -= 5;
    if (fadeAlpha < 0) fadeAlpha = 0;
  }

  // Show the emotional message
  if (currentMessage !== "") {
    textSize(22);
    let offsetY = sin(frameCount * 0.05) * 5; // Floating effect
    let lerpedColor = lerpColor(color(50), currentVisualizerColor, sin(frameCount * 0.05) * 0.5 + 0.5);
    fill(lerpedColor);
    text(currentMessage, width / 2, 40 + offsetY); // Show message at top
    textSize(18);
  }

  if (!userTyped && emotionSelected) {
    // Show placeholder if user hasn't typed yet
    fill(150);
    textSize(16);
    text(placeholderText, width / 2, height - 80);
  }

  if (emotionSelected && currentSound && currentSound.isPlaying()) {
    drawBarVisualizer(); // Show sound visualizer
    updateParticles(); // Update background particle effects
  }

  // Show countdown before saving image
  if (isCountingDown) {
    let elapsed = int((millis() - countdownStartTime) / 1000);
    let remaining = countdown - elapsed;

    if (remaining >= 0) {
      fill(0, 150);
      textSize(64);
      text(remaining + 1, width / 2, height / 2); // Show countdown
    }

    if (remaining < 0) {
      isCountingDown = false;
      saveCapturedImage(); // Save image after countdown ends
    }
  }
}
function drawBarVisualizer() {
  let spectrum = fft.analyze(); // Get sound spectrum
  let w = width / spectrum.length;

  noStroke();
  for (let i = 0; i < spectrum.length; i++) {
    let amp = spectrum[i];
    let h = map(amp, 0, 256, 0, height); // Map amplitude to height
    let x = i * w;
    fill(currentVisualizerColor);
    rect(x, height - h, w - 2, h); // Draw each bar
  }
}

function mousePressed() {
  if (!emotionSelected) {
    stopAllSounds(); // Stop any playing sounds
    currentMessage = "";
    currentVisualizerColor = color(100, 150, 255); // Default color

    for (let icon of icons) {
      if (icon.hovered) {
        let randomSound = random(icon.sounds); // Pick a random track
        currentSound = randomSound;
        currentSound.setVolume(1.0);
        currentSound.play();

        currentSound.onended(() => {
          emotionSelected = false;
          fadeAlpha = 255;
        });

        currentMessage = icon.message;
        currentVisualizerColor = icon.color;
        emotionSelected = true;

        if (!cameraStarted) {
          startCamera(); // Start webcam if not started
          cameraStarted = true;
        } else {
          captureButton.show();
          backButton.show();
          noteInput.show();
        }

        createParticles(icon.color); // Start background effect
      }
    }
  }
}

function stopAllSounds() {
  for (let icon of icons) {
    for (let s of icon.sounds) {
      if (s.isPlaying()) s.stop(); // Stop all sounds
    }
  }
}

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

function updateParticles() {
  for (let p of particles) {
    fill(red(p.color), green(p.color), blue(p.color), p.alpha);
    noStroke();
    ellipse(p.x, p.y, 5, 5);

    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 3; // Fade out
  }
  particles = particles.filter(p => p.alpha > 0); // Remove faded particles
}

function captureAndSave() {
  countdown = 5; // Set countdown time
  countdownStartTime = millis();
  isCountingDown = true;
}

function saveCapturedImage() {
  let c = get(); 
  let noteText = noteInput.value();

  let snapshot = createGraphics(width, height);
  snapshot.image(c, 0, 0);
  snapshot.fill(255, 230);
  snapshot.rect(0, height - 100, width, 100);
  snapshot.textAlign(CENTER, CENTER);
  snapshot.textSize(18);
  snapshot.fill(0);
  snapshot.text(noteText, width / 2, height - 60);

  snapshot.loadPixels();
  let imgData = snapshot.canvas.toDataURL("image/png");

  // Tạo link tải ảnh
  let a = document.createElement('a');
  a.href = imgData;
  a.download = 'emotional_postcard.png';
  document.body.appendChild(a);
  a.click(); // Kích hoạt tải về
  document.body.removeChild(a);
}

function resetToEmotionScreen() {
  emotionSelected = false;
  fadeAlpha = 255;
  stopAllSounds();
  currentMessage = "";
  particles = [];
  noteInput.value(""); // Clear input
  userTyped = false;
  captureButton.hide();
  backButton.hide();
  noteInput.hide();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
