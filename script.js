const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById("pin");
const sha256HashView = document.getElementById("sha256-hash");
const resultView = document.getElementById("result");
const checkButton = document.getElementById("check");
const successSound = document.getElementById("successSound");

// Function to store data in local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Function to retrieve data from local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Function to generate a random 3-digit number
function getRandom3DigitNumber() {
  return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

// Function to generate SHA256 hash of the given string
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Retrieve or generate the SHA256 hash of a fixed 3-digit number
async function getSHA256Hash() {
  let storedNumber = retrieve("originalNumber");
  let hash;

  if (!storedNumber) {
    storedNumber = getRandom3DigitNumber();
    store("originalNumber", storedNumber);
    hash = await sha256(storedNumber.toString());
    store("sha256", hash);
  } else {
    hash = retrieve("sha256");
  }

  return hash;
}

// Main function to display the SHA256 hash
async function main() {
  sha256HashView.textContent = "Calculating...";
  try {
    const hash = await getSHA256Hash();
    sha256HashView.textContent = hash;
  } catch (error) {
    sha256HashView.textContent = "Error generating hash!";
    console.error("Hash Generation Error:", error);
  }
}

// Function to check user input
async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.textContent = "💡 Enter a 3-digit number";
    resultView.classList.remove("hidden", "success", "error");
    return;
  }

  const storedNumber = retrieve("originalNumber");

  if (pin === storedNumber) {
    resultView.textContent = "🎉 Correct!";
    resultView.classList.add("success");
    resultView.classList.remove("error");

    // Play success sound only if user has interacted with page
    if (successSound) {
      successSound.play().catch(err => console.warn("Audio play blocked:", err));
    }
  } else {
    resultView.textContent = "❌ Incorrect, try again!";
    resultView.classList.add("error");
    resultView.classList.remove("success");
  }

  resultView.classList.remove("hidden");
}

// Ensure pinInput only accepts numbers and is 3 digits long
pinInput.addEventListener("input", (e) => {
  pinInput.value = e.target.value.replace(/\D/g, "").slice(0, 3);
});

// Attach the test function to the button
checkButton.addEventListener("click", test);

// Ensure audio plays only after user interaction
document.body.addEventListener("click", () => {
  if (successSound) {
    successSound.play().catch(err => console.warn("Audio play blocked:", err));
  }
}, { once: true });

// Run the main function on page load
main();
