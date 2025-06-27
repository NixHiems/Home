function addItemToList() {
    //create variable set to textbox value
    var list_input = document.getElementById("listInput")
    var list_item = list_input.value
    //create variable set to datetime value
    var list_date_raw = document.getElementById("listDate").value
    const date = new Date(list_date_raw);
    const list_date = date.toLocaleString('en-US',{
        weekday: 'short',   // Includes the abbreviated day of the week (e.g., Sun, Mon)
        year: '2-digit',    // Ensures a two-digit year
        month: '2-digit',   // Ensures a two-digit month
        day: '2-digit',     // Ensures a two-digit day
        hour: '2-digit',    // Ensures a two-digit hour
        minute: '2-digit',  // Ensures a two-digit minute
        hour12: true        // Ensures the time is in 12-hour format with AM/PM
    });
    //reset list_input and datetime
    list_input.value = ''
    list_input.focus()
    presetDateTime()
    //if the user did not submit an empty string do the following:
    if (list_item != '') {
        //create variable listArea which holds a value of a place in the document
        var listArea = document.getElementById("listArea")
        //define list item as having a checkbox that can be toggled on the left with the item and a removal button toggleGreen and itemDeleter both take this as an argument so that the functions know which element is calling it and so that we can get the parent element div to manipulate
        var string = `
        <div class="listItem"> 
            <div class="listCheckbox">
                <input type="checkbox" onclick="toggleGreen(this)">
            </div>
            <div class="listText">
                <div class="actualText" spellcheck="false" contenteditable onfocusout="refreshLocalStorage()">${list_item}</div>
            </div>
            <div class="listDate">
                <div class="actualText"><strong>${list_date}</strong></div>
            </div>
            <div class="listTrash">
                <input type="button" value="🗑️" onclick="itemDeleter(this)">
            </div>
        </div>`
        // Find the correct insertion point by comparing timestamps.
        // We want to insert the new item after the item with the closest earlier datetime.
        let insertionPoint = null;
        const items = listArea.getElementsByClassName("listItem")
        var newTimestamp = new Date(list_date_raw).getTime()
        if (items) {
            for (let i = 0; i < items.length; i++) {
                // Try to get the timestamp from the data attribute.
                let existingTimestamp = items[i].dataset.timestamp
                if (existingTimestamp) {
                    existingTimestamp = Date(existingTimestamp).getTime()
                } else {
                    // If no data attribute is present, fall back to parsing the displayed date string.
                    const dateStr = items[i].querySelector(".listDate .actualText").textContent
                    existingTimestamp = new Date(dateStr).getTime()
                }
                // Update insertionPoint if this item occurred before the new item.
                if (existingTimestamp < newTimestamp) {
                    insertionPoint = items[i]
                }
            }
        }

        // Insert the new item:
        //   - If an insertion point was found, insert after that item.
        //   - Otherwise, insert at the beginning.
        if (insertionPoint) {
            insertionPoint.insertAdjacentHTML('afterend', string)
        } else {
            listArea.insertAdjacentHTML('afterbegin', string)
        }
        refreshLocalStorage()
    }
}
//defines the variable as set to the value of the id listArea and sets it to empty string which completely clears all list items
function itemRemoveAll(){
    var listArea = document.getElementById("listArea")
    listArea.innerHTML = ""
    refreshLocalStorage()
}
function refreshLocalStorage() {
    var listArea = document.getElementById("listArea")
    localStorage.setItem("mystuff",listArea.innerHTML.replace(/<\/div>\s*\n\s*<div>/g, '</div>\n        <div>').trim())
}
function openEditor() {
    var thePlayer = document.getElementById("player")
    var currentHeight = thePlayer.getAttribute("height")
    if (currentHeight==="80") {
        thePlayer.setAttribute("height","152")
        document.getElementById("topEdit").style = "display: block"
    } else {
        thePlayer.setAttribute("height","80")
        document.getElementById("topEdit").style = "display: none"
    }
}
function editURL() {
    var thePlayer = document.getElementById("player")
    var URLlocation = document.getElementById("editURL")
    var theURL = URLlocation.value
    if (theURL!='') {
        thePlayer.setAttribute("src",theURL)
        URLlocation.value = ''
    }
}
//adds stylistic elements when checkbox is clicked
//returns to former style when unchecked
function toggleGreen(clickedElement){
    var twoUp = clickedElement.parentElement.parentElement
    if (clickedElement.checked) { 
        twoUp.style.color = "green"
        twoUp.style.backgroundColor = "#00FF8888"
        clickedElement.setAttribute('checked', true)
    } else {
        twoUp.style.color = "black"
        twoUp.style.backgroundColor = "#FFFFFF88"
        clickedElement.removeAttribute('checked')
    }
    refreshLocalStorage()
}
//item Deleter will removes the div with the denoted trashcan using built in function remove
function itemDeleter(clickedElement) {
    clickedElement.parentElement.parentElement.remove()
    refreshLocalStorage()
}
function presetDateTime() {
    var now = new Date()
    var yyyy = now.getFullYear()
    var mm = String(now.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
    var dd = String(now.getDate()).padStart(2, '0')
    document.getElementById('listDate').value = `${yyyy}-${mm}-${dd}T23:59`
}
window.onload = function() {
    if (localStorage.getItem("mystuff")) {
        var string = localStorage.getItem("mystuff")
        var listArea = document.getElementById("listArea")
        listArea.innerHTML += string
    }
    presetDateTime()
}
function addIfEnter(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        addItemToList()
    }
}
document.getElementById("listInput").addEventListener("keypress", function(event) {
    addIfEnter(event)
})
document.getElementById("listDate").addEventListener("keypress", function(event) {
    addIfEnter(event)
})