const appContainer = document.getElementById("app");
const el = document.createElement("div");
el.innerHTML = `
  <h1>Ultimate Tank!</h1>
 `;
appContainer?.appendChild(el);

interface Character {
  x: number;
  y: number;
  size: number;
  direction: Direction;
}

enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
  None = "none",
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
  private keyStates: Set<string> = new Set();

  private initialObstacles = [
    { x: 100, y: 150, size: 50, speed: 1, direction: "horizontal" },
    { x: 200, y: 300, size: 45, speed: 1, direction: "vertical" },
    { x: 550, y: 450, size: 60, speed: 1, direction: "horizontal" },
    { x: 300, y: 500, size: 40, speed: 1, direction: "vertical" },
    { x: 750, y: 100, size: 40, speed: 1, direction: "horizontal" },
  ];

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.character = {
      x: this.startingPossition.x,
      y: this.startingPossition.y,
      size: 50,
      direction: Direction.None,
    };

    this.characterImage = new Image();
    this.characterImage.onload = () => this.draw();
    this.characterImage.src = "../assets/rocket.svg";

    this.obstacleImage = new Image();
    this.obstacleImage.onload = () => this.draw();
    this.obstacleImage.src = "../assets/star.svg";

    this.obstacles = this.initialObstacles.map((obstacle) => ({ ...obstacle }));

    this.attachEventListeners();
    this.draw();
    this.gameLoop();
  }

  private attachEventListeners(): void {
    //window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keyStates.add(event.key);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keyStates.delete(event.key);
  }

  private moveCharacter(): void {
    const isUp = this.keyStates.has("ArrowUp") || this.keyStates.has("w");
    const isDown = this.keyStates.has("ArrowDown") || this.keyStates.has("s");
    const isLeft = this.keyStates.has("ArrowLeft") || this.keyStates.has("a");
    const isRight = this.keyStates.has("ArrowRight") || this.keyStates.has("d");

    if (isUp && isLeft) {
      this.character.direction = Direction.Left;
      this.character.x -= this.speed;
      this.character.y -= this.speed;
    } else if (isUp && isRight) {
      this.character.direction = Direction.Down;
      this.character.x += this.speed;
      this.character.y -= this.speed;
    } else if (isDown && isLeft) {
      this.character.direction = Direction.Left;
      this.character.x -= this.speed;
      this.character.y += this.speed;
    } else if (isDown && isRight) {
      this.character.direction = Direction.Right;
      this.character.x += this.speed;
      this.character.y += this.speed;
    } else if (isUp) {
      this.character.direction = Direction.Up;
      this.character.y -= this.speed;
    } else if (isDown) {
      this.character.direction = Direction.Down;
      this.character.y += this.speed;
    } else if (isLeft) {
      this.character.direction = Direction.Left;
      this.character.x -= this.speed;
    } else if (isRight) {
      this.character.direction = Direction.Right;
      this.character.x += this.speed;
    }

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

    if (this.checkCollision()) {
      this.lives--;

      if (this.lives === 0) {
        alert("Spelet är slut");
        this.resetGame();
      } else {
        this.resetStartingPossition();
      }
    }

    this.draw();
  }

  private gameLoop(): void {
    requestAnimationFrame(() => this.gameLoop());
    this.moveCharacter();
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

    // Determine rotation based on the direction
    let rotationAngle = 0; // Default direction is to the right
    switch (this.character.direction) {
      case Direction.Up:
        rotationAngle = Math.PI * 2; // 1.5; // 270 degrees to face up
        break;
      case Direction.Down:
        rotationAngle = Math.PI; // 90 degrees to face down
        break;
      case Direction.Left:
        rotationAngle = Math.PI * 1.5; // 180 degrees to face left
        break;
      case Direction.Right:
        rotationAngle = Math.PI * 0.5; // 0 degrees to face right
        break;
    }

    this.ctx.save();
    this.ctx.translate(
      this.character.x + this.character.size / 2,
      this.character.y + this.character.size / 2
    );
    this.ctx.rotate(rotationAngle);

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
    this.resetObstacles();
    this.draw();
  }

  private resetObstacles(): void {
    this.obstacles = this.initialObstacles.map((obstacle) => ({ ...obstacle }));
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
