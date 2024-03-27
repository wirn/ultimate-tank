const appContainer = document.getElementById("app");
const el = document.createElement("div");
el.innerHTML = `
  <h1>Ultimate Tank!</h1>
 `;
appContainer?.appendChild(el);

// Define the character's starting position and size
interface Character {
  x: number;
  y: number;
  size: number;
  direction: string;
}

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private character: Character;
  private characterImage: HTMLImageElement;
  private obstacleImage: HTMLImageElement;
  private obstacles: {
    x: number;
    y: number;
    size: number;
    speed: number;
    direction: string;
  }[];
  private speed: number = 5;
  private lives: number = 3;
  private startingPossition = {
    x: 300,
    y: 200,
  };

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.character = {
      x: this.startingPossition.x,
      y: this.startingPossition.y,
      size: 50,
      direction: "right",
    };

    this.characterImage = new Image();
    this.characterImage.onload = () => this.draw();
    this.characterImage.src = "../assets/caret-down.svg";

    this.obstacleImage = new Image();
    this.obstacleImage.onload = () => this.draw();
    this.obstacleImage.src = "../assets/star.svg";

    this.obstacles = [
      { x: 100, y: 150, size: 50, speed: 1, direction: "horizontal" },
      { x: 200, y: 300, size: 45, speed: 1, direction: "vertical" },
      { x: 550, y: 450, size: 60, speed: 1, direction: "horizontal" },
      { x: 300, y: 500, size: 40, speed: 1, direction: "vertical" },
      { x: 750, y: 100, size: 40, speed: 1, direction: "horizontal" },
    ];

    this.attachEventListeners();
    this.draw();
  }

  private attachEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Update character position based on arrow key input
    switch (event.key) {
      case "ArrowUp":
        this.character.y -= this.speed;
        this.character.direction = "up";
        break;
      case "ArrowDown":
        this.character.y += this.speed;
        this.character.direction = "down";
        break;
      case "ArrowLeft":
        this.character.x -= this.speed;
        this.character.direction = "left";
        break;
      case "ArrowRight":
        this.character.x += this.speed;
        this.character.direction = "right";
        break;
    }

    // Wrap around logic for moving out of canvas boundaries
    if (this.character.x < 0) {
      this.character.x = this.canvas.width - this.character.size;
    } else if (this.character.x + this.character.size > this.canvas.width) {
      this.character.x = 0;
    }

    if (this.character.y < 0) {
      this.character.y = this.canvas.height - this.character.size;
    } else if (this.character.y + this.character.size > this.canvas.height) {
      this.character.y = 0;
    }

    // Check for collisions with obstacles after potentially wrapping
    if (this.checkCollision()) {
      this.lives--;

      // Do not reset to starting position here; just decrement lives
      if (this.lives === 0) {
        alert("Spelet är slut");
        this.resetGame();
      } else {
        this.resetStartingPossition();
      }
    }

    this.draw();
  }

  private drawObstacles(): void {
    for (const obstacle of this.obstacles) {
      this.ctx.drawImage(
        this.obstacleImage,
        obstacle.x,
        obstacle.y,
        obstacle.size,
        obstacle.size
      );
    }
  }
  private checkCollision(): boolean {
    for (const obstacle of this.obstacles) {
      if (
        this.character.x < obstacle.x + obstacle.size &&
        this.character.x + this.character.size > obstacle.x &&
        this.character.y < obstacle.y + obstacle.size &&
        this.character.y + this.character.size > obstacle.y
      ) {
        return true;
      }
    }
    return false;
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(
      this.character.x + this.character.size / 2,
      this.character.y + this.character.size / 2
    );
    switch (this.character.direction) {
      case "up":
        this.ctx.rotate(Math.PI);
        break;
      case "down":
        this.ctx.rotate(0);
        break;
      case "left":
        this.ctx.rotate(Math.PI / 2);
        break;
      case "right":
        this.ctx.rotate(-Math.PI / 2);
        break;
    }

    this.ctx.drawImage(
      this.characterImage,
      -this.character.size / 2,
      -this.character.size / 2,
      this.character.size,
      this.character.size
    );

    this.ctx.restore();

    this.drawObstacles();
    this.moveObstacles();

    this.displayLives();
  }

  private resetGame(): void {
    this.resetStartingPossition();
    this.lives = 3;
    this.draw();
  }

  private resetStartingPossition(): void {
    this.character.x = this.startingPossition.x;
    this.character.y = this.startingPossition.y;
  }

  private moveObstacles(): void {
    this.obstacles.forEach((obstacle) => {
      if (obstacle.direction === "horizontal") {
        obstacle.x += obstacle.speed;
        if (obstacle.x > this.canvas.width - obstacle.size || obstacle.x < 0) {
          obstacle.speed *= -1; // Change direction
        }
      } else {
        // "vertical"
        obstacle.y += obstacle.speed;
        if (obstacle.y > this.canvas.height - obstacle.size || obstacle.y < 0) {
          obstacle.speed *= -1; // Change direction
        }
      }
    });
  }

  private displayLives(): void {
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.fillText(`Liv: ${this.lives}`, 10, 30); // Visar antalet liv i övre vänstra hörnet
  }
}

// Initialize the game when the page has loaded
window.onload = () => {
  new Game("gameCanvas");
};
