const cardList = document.querySelector(".cards");
const addBtn = document.querySelector(".add-btn");
const nameInput = document.querySelector(".name-input");
const randomBtn = document.querySelector(".random-btn");
const resetBtn = document.querySelector(".reset-btn");

addBtn.addEventListener("click", addName);
cardList.addEventListener("click", deleteCard);
randomBtn.addEventListener("click", randomSelect);
resetBtn.addEventListener("click", resetCards);

function addName(e) {
  e.preventDefault();
  if (!nameInput.value) {
    return true;
  }
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/add-name");
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // Response
      const response = JSON.parse(this.responseText);
      console.log(response);
      const cardDiv = createCardElement(response.name);
      cardList.appendChild(cardDiv);
      nameInput.value = "";
    }
  };

  // Content-type
  xhttp.setRequestHeader("Content-Type", "application/json");
  // Send request with data
  xhttp.send(
    JSON.stringify({
      name: nameInput.value,
    })
  );
}

function deleteCard(e) {
  const item = e.target;
  if (item.classList[0] !== "trash-btn") {
    return true;
  }

  const card = item.parentElement;
  const selectedName = card.querySelector(".item").innerText;

  const xhr = new XMLHttpRequest;
  xhr.open('GET', '/delete-name/' + selectedName, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      const response = JSON.parse(xhr.responseText);
      card.classList.add("drop");
      card.addEventListener("transitionend", (e) => {
        card.remove();
      });
    }
  };

  xhr.send();
}

function randomSelect(e) {
  const cards = cardList.querySelectorAll(".card");
  console.log(cards);

  if (cards.length == 0) {
    return true;
  }
  const incompleteCard = [];
  cards.forEach((card, index) => {
    if (!card.classList.contains("completed")) {
      incompleteCard.push(card);
    }
  });

  console.log(incompleteCard);
  let prevNum = 0;
  let selectedItem;
  const max = incompleteCard.length - 1;

  if (max == 0) {
    selectedItem = incompleteCard[0];
    const selectedName = selectedItem.querySelector(".item").innerText;
    const xhr = new XMLHttpRequest;
    xhr.open('GET', '/set-complete/' + selectedName, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        const response = JSON.parse(xhr.responseText);
        selectedItem.classList.remove("selecting");
        selectedItem.classList.add("completed");
        selectedItem.querySelector(
          ".status"
        ).innerHTML = `<i class="fas fa-check"></i>`;
        randomBtn.disabled = true;
        randomBtn.classList.add("disabled")
      }
    };

    xhr.send();
    return;
  }

  let interval = setInterval(() => {
    let ranNum = getRandomNumber(max);
    console.log(ranNum);
    selectedItem = incompleteCard[ranNum];
    selectedItem.classList.add("selecting");
    incompleteCard[prevNum].classList.remove("selecting");

    prevNum = ranNum;
  }, 1000 / 4);

  setTimeout(() => {
    clearInterval(interval);

    const selectedName = selectedItem.querySelector(".item").innerText;
    const xhr = new XMLHttpRequest;
    xhr.open('GET', '/set-complete/' + selectedName, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        const response = JSON.parse(xhr.responseText);
        selectedItem.classList.remove("selecting");
        selectedItem.classList.add("completed");
        selectedItem.querySelector(
          ".status"
        ).innerHTML = `<i class="fas fa-check"></i>`;
      }
    };

    xhr.send();
  }, 1000 * 3);
}

function resetCards() {
  const xhr = new XMLHttpRequest;
  xhr.open('GET', '/reset-all/', true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      const response = JSON.parse(xhr.responseText);
      console.log(response);
      const cards = cardList.querySelectorAll(".card");

      cards.forEach((card) => {
        card.classList.remove("completed");
        card.querySelector(
          ".status"
        ).innerHTML = `<i class="fas fa-hourglass-start"></i>`;
      });
      randomBtn.disabled = false;
      randomBtn.classList.remove("disabled");
    }
  };

  xhr.send();
}

function createCardElement(value) {
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  const item = document.createElement("h3");
  item.innerText = value;
  item.classList.add("item");
  cardDiv.appendChild(item);

  const status = document.createElement("button");
  status.innerHTML = `<i class="fas fa-hourglass-start"></i>`;
  status.classList.add("status");
  cardDiv.appendChild(status);

  const trashButton = document.createElement("button");
  trashButton.innerHTML = `<i class="fas fa-trash"></i>`;
  trashButton.classList.add("trash-btn");
  cardDiv.appendChild(trashButton);
  return cardDiv;
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * (max - 0 + 1)) + 0;
}

// BUG: when deleting card, before card vanish and click random button still able to loop the card
