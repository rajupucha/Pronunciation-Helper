 function startListening() {
            const expected = document.getElementById("expectedText").value.trim();
            if (!expected) {
                alert("⚠ Please enter the text to be spoken before starting!");
                return;
            }

            // Check if browser supports speech recognition
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                alert("Your browser doesn't support speech recognition. Try Chrome or Edge.");
                return;
            }

            document.getElementById("spokenDisplay").textContent = "Listening...";
            document.getElementById("accuracyScore").textContent = "0";
            document.getElementById("feedback").textContent = "";
            document.getElementById("mismatches").textContent = "No mismatches yet";

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.start();

            recognition.onresult = function(event) {
                const spokenText = event.results[0][0].transcript.trim();
                console.log("Recognized:", spokenText);

                displaySpokenWithHighlights(expected, spokenText);

                const result = compareWords(expected, spokenText);
                document.getElementById("accuracyScore").textContent = result.accuracy;
                document.getElementById("feedback").textContent = result.feedbackText;

                const mismatchBox = document.getElementById("mismatches");
                if (result.mismatchList.length > 0) {
                    mismatchBox.innerHTML = result.mismatchList.map(msg => `<div>${msg}</div>`).join("");
                } else {
                    mismatchBox.textContent = "No mismatches ✅";
                }
            };

            recognition.onerror = function(event) {
                console.error("Recognition error:", event.error);
                document.getElementById("spokenDisplay").textContent = "Error occurred: " + event.error;
            };

            recognition.onend = function() {
                console.log("Recognition ended");
            };
        }

        function cleanAndSplit(text) {
            return text
                .toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?""''\[\]]/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim()
                .split(' ');
        }

        function compareWords(expected, spoken) {
            const expectedWords = cleanAndSplit(expected);
            const spokenWords = cleanAndSplit(spoken);
            
            let match = 0;
            const mismatches = [];
            const maxLength = Math.max(expectedWords.length, spokenWords.length);

            for (let i = 0; i < maxLength; i++) {
                const expectedWord = expectedWords[i] || "[missing]";
                const spokenWord = spokenWords[i] || "[missing]";

                if (i < expectedWords.length && i < spokenWords.length && expectedWord === spokenWord) {
                    match++;
                } else {
                    mismatches.push(`Expected: "${expectedWord}", Heard: "${spokenWord}" at position ${i + 1}`);
                }
            }

            const accuracy = Math.round((match / expectedWords.length) * 100);
            const feedbackText = getFeedback(accuracy);

            return {
                accuracy,
                feedbackText,
                mismatchList: mismatches
            };
        }
        function getFeedback(score) {
            if (score === 100) return "Perfect! 🏆";
            else if (score >= 80) return "Great! Just a few mistakes.";
            else if (score >= 50) return "Good try, but needs improvement.";
            else return "Try again. Speak clearly and slowly.";
        }

        function displaySpokenWithHighlights(expected, spoken) {
            const expectedWords = cleanAndSplit(expected);
            const spokenWords = cleanAndSplit(spoken);

            const container = document.getElementById("spokenDisplay");
            container.innerHTML = "";

            for (let i = 0; i < spokenWords.length; i++) {
                const wordSpan = document.createElement("span");
                wordSpan.textContent = spokenWords[i] + " ";
                wordSpan.className = "word";

                if (i < expectedWords.length && spokenWords[i] === expectedWords[i]) {
                    wordSpan.classList.add("match");
                } else {
                    wordSpan.classList.add("mismatch");
                }

                container.appendChild(wordSpan);
            }
        }

        function playSpoken() {
            const container = document.getElementById("spokenDisplay");
            const recognizedText = container.textContent.trim();

            if (!recognizedText || recognizedText === "Listening..." || recognizedText === "Your spoken text will appear here...") {
                alert("No speech recognized yet!");
                return;
            }

            const utterance = new SpeechSynthesisUtterance(recognizedText);
            window.speechSynthesis.speak(utterance);
        }