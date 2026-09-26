document.addEventListener('DOMContentLoaded', () => {
  const DOOR_SELECTION = document.getElementById('door-selection');
  const DOOR_SELECTION_OUTPUT = document.getElementById('door-selection-output');
  const DOOR_AMOUNT_INPUT = document.getElementById('door-amount-input');
  const DOOR_AMOUNT_OUTPUT = document.getElementById('door-amount-output');
  const RETRY_BTN = document.getElementById('retry-btn');
  const DOOR_TEMPLATE = document.getElementById('door-template');
  const CAR_TEMPLATE = document.getElementById('car-template');
  let isFirstSelection, winningDoorNumber, renderTimeout;

  enableDoorAmountInput();
  updateDoorAmountOutput();
  start();

  function start() {
    isFirstSelection = true;
    winningDoorNumber = randomDoorNumber();
    renderDoors();
    updateDoorSelectionOutputEl();
    setDoorSelectionOutput('Which door holds the stunning sports car?');
  }

  function reset() {
    toggleRetryBtn(false);
    start();
  }

  function renderDoors() {
    const fragment = new DocumentFragment();

    for (let n = 1; n <= getDoorCount(); n++) {
      const doorClone = DOOR_TEMPLATE.content.cloneNode(true);
      doorClone.querySelector('button').setAttribute('id', `door${n}`);
      doorClone.querySelector('button').setAttribute('name', `door${n}`);
      doorClone.querySelector('button').value = n;
      doorClone.querySelector('button').ariaLabel = `Door ${n}`;
      doorClone.querySelector('.door__number').innerText = n;

      if (n === winningDoorNumber) {
        assignCar(doorClone);
      }

      fragment.append(doorClone);
    }

    DOOR_SELECTION.replaceChildren(fragment);
  }

  function handleDoorSelection({ target }) {
    const selectedDoorNumber = Number.parseInt(target.value);

    if (isFirstSelection) {
      isFirstSelection = false;
      target.classList.add('door--selected');
      handleFirstSelection(selectedDoorNumber);
    } else {
      handleLastSelection(target, selectedDoorNumber);
    }
  }

  function handleFirstSelection(selectedDoorNumber) {
    const otherDoorNumber = selectedDoorNumber === winningDoorNumber ? calculatedLureDoorNumber(selectedDoorNumber) : winningDoorNumber;
    openAllDoorsButTwo(selectedDoorNumber, otherDoorNumber);
    setDoorSelectionOutput(`You select door ${selectedDoorNumber}.
                            Monty Hall opens all other doors but door ${otherDoorNumber}.
                            Do you change your door?`);
  }

  function handleLastSelection(selectedDoorEl, selectedDoorNumber) {
    openRemainingDoors();

    if (selectedDoorNumber === winningDoorNumber) {
      selectedDoorEl.classList.add('door--win');
      setDoorSelectionOutput('You win!');
    } else {
      setDoorSelectionOutput('You lose!');
    }

    toggleRetryBtn(true);
  }

  function openAllDoorsButTwo(selectedDoorNumber, otherDoorNumber) {
    getAllDoors().forEach(doorEl => {
      const doorNumber = Number.parseInt(doorEl.value);
      if (![selectedDoorNumber, otherDoorNumber].includes(doorNumber)) {
        openDoor(doorEl);
      }
    });
  }

  function openRemainingDoors() {
    getRemainingDoors().forEach(doorEl => openDoor(doorEl));
  }

  function assignCar(doorEl) {
    const carClone = CAR_TEMPLATE.content.cloneNode(true);
    doorEl.querySelector('.door__item').replaceWith(carClone);
  }

  function openDoor(doorEl) {
    doorEl.disabled = true;
  }

  function enableDoorAmountInput() {
    DOOR_AMOUNT_INPUT.disabled = false;
  }

  function updateDoorAmountOutput() {
    DOOR_AMOUNT_OUTPUT.value = getDoorCount();
  }

  function updateDoorSelectionOutputEl() {
    DOOR_SELECTION_OUTPUT.setAttribute('for', `door${getDoorNumbers().join(' door')}`);
  }

  function toggleRetryBtn(on) {
    RETRY_BTN.hidden = !on;
  }

  function randomDoorNumber() {
    return randomInt(getDoorCount()) + 1;
  }

  function calculatedLureDoorNumber(selectedDoorNumber) {
    const indexOfSelectedDoorNumber = selectedDoorNumber - 1;
    const doorNumbersWithoutSelected = getDoorNumbers().toSpliced(indexOfSelectedDoorNumber, 1);

    return doorNumbersWithoutSelected[randomInt(doorNumbersWithoutSelected.length)];
  }

  function getAllDoors() {
    return document.querySelectorAll('.door');
  }

  function getRemainingDoors() {
    return document.querySelectorAll('.door:not(:disabled)');
  }

  function getDoorCount() {
    return Number.parseInt(DOOR_AMOUNT_INPUT.value);
  }

  function getDoorNumbers() {
    return createNumberSequence(1, getDoorCount());
  }

  function setDoorSelectionOutput(value) {
    DOOR_SELECTION_OUTPUT.value = value;
  }

  DOOR_SELECTION.addEventListener('click', event => {
    if (event.target.matches('.door')) handleDoorSelection(event);
  });

  DOOR_AMOUNT_INPUT.addEventListener('input', () => {
    updateDoorAmountOutput();
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(reset, 500);
  });

  RETRY_BTN.addEventListener('click', reset);
});

// helpers

function randomInt(upTo) {
  return Math.floor(Math.random() * upTo);
}

function createNumberSequence(start, end) {
  const sequence = [];
  for (let n = start; n <= end; n++) {
    sequence.push(n);
  }
  return sequence;
}
