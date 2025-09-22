(function () {
  const cells = Array.from(document.querySelectorAll('[data-cell]'));
  const statusEl = document.getElementById('status');
  const resetBtn = document.getElementById('reset');

  let board; // 9 element array: 'X' | 'O' | null
  let xTurn; // true if X's turn
  let over;  // game over

  function newGame() {
    board = Array(9).fill(null);
    xTurn = true;
    over = false;
    statusEl.textContent = `Player X’s turn`;
    for (const c of cells) {
      c.textContent = '';
      c.dataset.mark = '';
      c.classList.remove('win');
      c.disabled = false;
    }
  }

  function handleClick(e) {
    const idx = cells.indexOf(e.currentTarget);
    if (over || board[idx]) return;

    const mark = xTurn ? 'X' : 'O';
    board[idx] = mark;
    renderCell(idx, mark);

    const win = checkWin(mark);
    if (win) {
      over = true;
      statusEl.textContent = `Player ${mark} wins!`;
      for (const i of win) cells[i].classList.add('win');
      disableAll();
      return;
    }

    if (board.every(Boolean)) {
      over = true;
      statusEl.textContent = `It’s a draw!`;
      disableAll();
      return;
    }

    xTurn = !xTurn;
    statusEl.textContent = `Player ${xTurn ? 'X' : 'O'}’s turn`;
  }

  function renderCell(i, mark) {
    const c = cells[i];
    c.textContent = mark;
    c.dataset.mark = mark;
  }

  function disableAll() {
    for (const c of cells) c.disabled = true;
  }

  function checkWin(mark) {
    const b = board.map((v) => v === mark);
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const line of lines) {
      const [a, b1, c] = line;
      if (b[a] && b[b1] && b[c]) return line;
    }
    return null;
  }

  // setup
  for (const c of cells) c.addEventListener('click', handleClick);
  resetBtn.addEventListener('click', newGame);
  newGame();
})();
