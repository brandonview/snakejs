var width = 30;
var height = 30;
var isGameOver = 0;

var snakeDirection = "UP";

function area () {
	return width * height;
}

/* Array of all game tiles */
var gametiles = [];

/* list of snake tiles
 * Ordered from head of snake to end of snake
 */
var snaketiles = [];

var blanktiles = [];

/* Class for a gametile */
function Gametile (type, x, y) {
	this.type = type;
	this.x = x;
	this.y = y;
}

Gametile.prototype.index = function() {
	return locationFromXY(this.x, this.y);
}

function locationFromXY(x,y) {
	return y * width + x;
}

/* Helper functions to get x and y values from indices */
function yFromIndex(index) {
	return Math.floor(index / height);
}

function xFromIndex(index) {
	return index % height;
}

/* place a food tile from the pool of blank spaces */
function placeFood(game, blanks) {
	blankTargetIndex = Math.floor(Math.random() * blanks.length); 
	target = blanks[blankTargetIndex];
	// remove the index from our list of blanks
	blanks.splice(blankTargetIndex, 1);
	// and change the game tile to a food tile
	game[target] = new Gametile ("food", xFromIndex(target), yFromIndex(target));
}

/* Sets up the gameboard with one food tile and one
 * snake tile and then fills the rest of them with 
 * blank tiles
 */
function gameInit() {
	// fill all the gametiles with blank tiles
	for (i=0; i < area(); i++) {
		gametiles[i] = new Gametile("blank", xFromIndex(i), yFromIndex(i));
		blanktiles[i] = i;
	}
	
	// assign a two snake tiles to the center of the board
	centerIndex = area() / 2 + Math.floor(width / 2);
	gametiles[centerIndex] = new Gametile("snake", xFromIndex(centerIndex), yFromIndex(centerIndex));
	gametiles[centerIndex + width] = new Gametile("snake", xFromIndex(centerIndex), yFromIndex(centerIndex)+1);
	// remove from list of blank tiles
	blanktiles.splice(blanktiles.indexOf(centerIndex), 1);
	blanktiles.splice(blanktiles.indexOf(centerIndex + width), 1);
	//add to list of snaketiles
	snaketiles[snaketiles.length] = centerIndex;
	snaketiles[snaketiles.length] = centerIndex + width;
	
	// place random food tile
	placeFood(gametiles, blanktiles);
}

function drawGame() {
	var htmlString = [];
	for (i=0; i < area(); i++) {
		if (gametiles[i].type != undefined) { htmlString.push('<div class = \"' + gametiles[i].type + '\"></div>\n' ); }
		if (xFromIndex(i) === (width - 1)) {
			htmlString.push("<br>\n");
		}
	}
	return htmlString.join("");
}

// Function that will update the gametiles array after the snake moves
function movementAction(nextHead, oldTail) {
	switch(gametiles[nextHead].type) {
		case "blank":
			gametiles[nextHead].type = "snake";
			snaketiles[0] = nextHead;
			blanktiles.splice(blanktiles.indexOf(nextHead), 1);
			blanktiles[blanktiles.length] = oldTail;
			break;
		case "food":
			//change to a snake
			gametiles[nextHead].type = "snake";
			snaketiles[0] = nextHead;
			blanktiles.splice(blanktiles.indexOf(nextHead, 1));
			// add to the end of the snake
			snaketiles[snaketiles.length] = oldTail;
			// update gametiles with new snake segment
			gametiles[oldTail].type = "snake";
			// add new food
			placeFood(gametiles, blanktiles);
			break;
		case "snake":
			isGameOver = 1;
			break;
	}
}

// move every tile in the snake
// each tile takes the location of the one preceding it
function moveSnake() {
	// next head tile
	var nextHead = snaketiles[0];
	
	// make note of the end of the snake
	// then remove
	// restore if snake runs into food
	var oldTail = snaketiles[snaketiles.length - 1];
	gametiles[oldTail].type = "blank";
	
	//determine next location for the head
	switch(snakeDirection) {
		case "UP":
			if (yFromIndex(snaketiles[0]) == 0) {
				nextHead = locationFromXY(xFromIndex(snaketiles[0]), height-1); 
			}
			else { nextHead -= width;}
			break;
		case "DOWN":
			if (yFromIndex(snaketiles[0]) == height-1) {
				nextHead = locationFromXY(xFromIndex(snaketiles[0]), 0); 
			}
			else { nextHead += width;}
			break;
		case "LEFT":
			if (xFromIndex(snaketiles[0]) == 0) {
				nextHead = locationFromXY(width-1, yFromIndex(snaketiles[0])); 
			}
			else { nextHead--;}
			break;
		case "RIGHT":
			if (xFromIndex(snaketiles[0]) == width-1) {
				nextHead = locationFromXY(0, yFromIndex(snaketiles[0])); 
			}
			else { nextHead++;}
			break;
	}
	
	// move all snaketiles to the location of the snaketile preceding it
	for (i=snaketiles.length-1; i>0; i--) {
		snaketiles[i] = snaketiles[i-1];
	}
	// update gametiles with new head info
	movementAction(nextHead, oldTail);	
}


function runGame() {
	gameInit();
	drawGame();
	document.getElementById('snake-game').innerHTML = drawGame();

	var gameLoop = setInterval(function() {
		moveSnake();
		document.getElementById('snake-game').innerHTML = drawGame();
		document.onkeydown = function(event) {
			if (event.keyCode == 38) { snakeDirection = "UP"; } 
			else if (event.keyCode == 40) { snakeDirection = "DOWN"; }
			else if (event.keyCode == 39) { snakeDirection = "RIGHT"; }
			else if (event.keyCode == 37) { snakeDirection = "LEFT"; }
		}
		if (isGameOver) {clearInterval(gameLoop);}
		}, 75);
}


