// This function connects a <input type="file"> to a preview box
// so that when the user uploads a file, it shows an image + delete button
function setupFileInput(inputId, previewId) {
    // Like Java's `Scanner scanner = new Scanner(System.in);`
    // Here we "grab" HTML elements from the page by their ID
    let input = document.getElementById(inputId);   // file input (face or ID)
    let preview = document.getElementById(previewId); // div where preview will appear
    
    // Add an event listener (like Java's ActionListener)
    // This triggers when the user selects a file
    input.addEventListener("change", function () {
        
        preview.innerHTML = ""; // clear old preview (like resetting state)
        
        // If input has a file (like checking null in Java)
        if (input.files && input.files[0]) {
            
            // Create an <img> element dynamically
            let img = document.createElement("img");
            // Set the image source to the file that user picked
            // URL.createObjectURL → temporary link for local file
            img.src = URL.createObjectURL(input.files[0]);
            
            // Create a delete button ("X")
            let btn = document.createElement("button");
            btn.textContent = "X";       // the label of the button
            btn.className = "remove-btn"; // optional CSS styling
            
            // Add event listener to button (like actionPerformed in Java)
            btn.addEventListener("click", function (e) {
                e.preventDefault();      // prevent form from auto-submitting
                input.value = "";        // clear the file input
                preview.innerHTML = "";  // remove preview from screen
            });
            
            // Finally, add the image and the button to the preview box
            preview.appendChild(img);
            preview.appendChild(btn);
        }
    });
}

// Call the function twice, one for "face" input, another for "ID" input
// This is like reusing a method in Java instead of duplicating code
setupFileInput("face", "facePreview");
setupFileInput("id", "idPreview");