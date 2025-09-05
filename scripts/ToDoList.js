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
        <input type="checkbox" onclick="toggleColor(this,'#0F88','green')">
        </div>
        <div class="listText">
        <div class="actualText" spellcheck="false" contenteditable onfocusout="refreshLocalStorage()">${list_item}</div>
        </div>
        <div class="listDate">
        <div class="actualText"><strong>${list_date}</strong></div>
        </div>
        <div class="listAddSubitem">
        <input type="button" value="➕" onclick="subitemAdder(this)">
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
                if (existingTimestamp <= newTimestamp) {
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
    if (currentHeight==="152") {
        thePlayer.setAttribute("height","80")
        document.getElementById("editURL").style = "display: block"
    } else {
        thePlayer.setAttribute("height","152")
        document.getElementById("editURL").style = "display: none"
    }
}
function editURL() {
    var thePlayer = document.getElementById("player")
    var URLlocation = document.getElementById("editURL")
    var theURL = URLlocation.value
    if (theURL!='') {
        thePlayer.setAttribute("src",theURL)
        URLlocation.value = ''
        localStorage.setItem("URL",theURL)
    }
}
function openBesideHeader() {
    var element = document.getElementById("besideHeaderContent");
    var expander = document.querySelector("#besideHeader input");
    var displayStyle = window.getComputedStyle(element).display;
    if (displayStyle === "none") {
        element.style.display = "flex";
        expander.value = ">"
    } else {
        element.style.display = "none";
        expander.value = "<"
    }
}
function editCounter(counterId) {
    const dateInput = document.getElementById(`counterDate${counterId}`);
    const titleInput = document.getElementById(`counterTitle${counterId}`);
    const counterDay = document.getElementById(`counterDay${counterId}`);

    if (!dateInput.value) {
        counterDay.textContent = "0";
        return;
    }

    const selectedDate = new Date(dateInput.value);
    selectedDate.setTime(selectedDate.getTime() + 14400000); // Offset for time correction

    const today = new Date();
    const timeDiff = today - selectedDate;

    // Convert time difference into days, hours, and minutes
    const days = Math.floor(timeDiff / 86400000); // 1 day = 86400000 ms
    const hours = Math.floor((timeDiff % 86400000) / 3600000); // 1 hour = 3600000 ms
    const minutes = Math.floor((timeDiff % 3600000) / 60000); // 1 min = 60000 ms

    // Format output as "DD, HH:MM"
    counterDay.innerHTML = `${days} <span class="counterHHMM">${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}</span>`;

    // Store the title and date in localStorage
    const counterData = {
        title: titleInput.textContent,
        date: dateInput.value
    };
    localStorage.setItem(`counter${counterId}`, JSON.stringify(counterData));
}

//adds stylistic elements when checkbox is clicked
//returns to former style when unchecked
function toggleColor(clickedElement,bgColor=0,txtColor=0){
    var twoUp = clickedElement.parentElement.parentElement
    if (clickedElement.checked) {
        twoUp.classList.add("done")
        twoUp.classList.remove("overdue")
        clickedElement.setAttribute('checked', true)
        const now = new Date()
        if (getInfo(twoUp).parsedDate > now) {
            notifyUser("Great work!", `You took care of "${getInfo(twoUp).title}" before it was due! Keep it up!`,"https://em-content.zobj.net/source/skype/289/partying-face_1f973.png");
        }
    } else {
        twoUp.classList.remove("done")
        clickedElement.removeAttribute('checked')
    }
    refreshLocalStorage()
}
function subitemAdder(clickedElement) {
    var twoUp = clickedElement.parentElement.parentElement;
    var string = `
    <div class="sublistItem">
    <div class="listCheckbox">
    <input type="checkbox" onclick="toggleColor(this)">
    </div>
    <div class="listText">
    <div class="actualText" spellcheck="false" contenteditable onfocusout="refreshLocalStorage()"></div>
    </div>
    <div class="listTrash">
    <input type="button" value="🗑️" onclick="itemDeleter(this)">
    </div>
    </div>`;
    twoUp.innerHTML += string;
    var newSubitem = twoUp.querySelector(".sublistItem:last-child .actualText");
    newSubitem.focus();
    refreshLocalStorage();
}
//item Deleter will removes the div with the denoted trashcan using built in function remove
function itemDeleter(clickedElement) {
    clickedElement.parentElement.parentElement.remove()
    refreshLocalStorage()
}
function getInfo(item) {
    var thisDate = item.querySelector(".listDate .actualText strong")?.innerText;
    if (thisDate) {
        var parsedDate = new Date(thisDate.replace(/(\w{3}), /, ''));
    } else {
        var parsedDate = null;
    }
    return {
        title: item.querySelector(".listText .actualText")?.innerText,
        date: thisDate,
        parsedDate: parsedDate
    }
}
function notifyUser(title, message, icon) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message, icon: icon });
        if (title === "Oh no!") {
            const audio = new Audio("assets/notification.mp3");
            audio.play();
        }
    } else if (Notification.permission !== "denied") {
        alert(title, message);
        new Notification(title, { body: message, icon: icon });
    }
}
function checkAll() {
    function checkDates() {
        document.querySelectorAll(".listItem").forEach(item => {
            itemTitle = getInfo(item).title
            itemDate = getInfo(item).date
            parsedDate = getInfo(item).parsedDate
            const now = new Date();
            if (parsedDate < now) {
                const checkbox = item.querySelector(".listCheckbox input");
                // Only proceed if the checkbox is unchecked AND item isn't already red
                if (!checkbox.checked && !item.classList.contains("overdue")) {
                    item.classList.add("overdue");
                    refreshLocalStorage();
                    notifyUser("Oh no!", `You set '${itemTitle}' to be due ${itemDate}. Please finish it!`,"https://em-content.zobj.net/source/skype/289/face-screaming-in-fear_1f631.png");
                    setTimeout(() => recheck(item),1000);
                }
            }
        });
    }
    function recheck(item) {
        exists = document.body.contains(item)
        if (exists) {
            itemTitle = getInfo(item).title
            itemDate = getInfo(item).date
            checkbox = item.querySelector(".listCheckbox input");
            // Only proceed if the checkbox is unchecked AND item isn't yet green
            if (!checkbox.checked && !item.classList.contains("done")) {
                item.classList.add("overdue");
                notifyUser("Oh no!", `You set "${itemTitle}" to be due ${itemDate}. Please finish it!`,"https://em-content.zobj.net/source/skype/289/face-screaming-in-fear_1f631.png");
                setTimeout(() => recheck(item), 1000);
            } else {
                notifyUser("Good work!", `You took care of "${itemTitle}" after the reminder. Keep it up!`,"https://em-content.zobj.net/source/skype/289/thumbs-up_1f44d.png");
            }
        }
    }
    checkDates();
    editCounter(1);
    editCounter(2);
    editCounter(3);
};
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
    for (let i = 1; i <= 3; i++) {
        const counterData = localStorage.getItem(`counter${i}`);
        if (counterData) {
            const parsedData = JSON.parse(counterData);
            document.getElementById(`counterTitle${i}`).textContent = parsedData.title;
            document.getElementById(`counterDate${i}`).value = parsedData.date;
            editCounter(i); // Update displayed days
        }
    }
    if (localStorage.getItem("URL")) {
        var theURL = localStorage.getItem("URL")
        var thePlayer = document.getElementById("player")
        thePlayer.src = theURL
    }
    presetDateTime()
    Notification.requestPermission()
    setInterval(checkAll, 10000);
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
document.getElementById("listArea").addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        var activeElement = document.activeElement;
        if (activeElement.classList.contains("actualText")) {
            var twoUp = activeElement.parentElement.parentElement;
            if (twoUp.classList.contains("sublistItem")) {
                event.preventDefault(); // Prevents default behavior (like inserting a new line)
var addButton = twoUp.parentElement.querySelector(".listAddSubitem input")
subitemAdder(addButton);
            }
        }
    }
});
