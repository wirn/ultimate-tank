interface Player {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  direction: Direction;
}

interface Projectile {
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: Direction;
}

enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
  None = "none",
}

interface Enemy {
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: "horizontal" | "vertical";
}

interface NonShootableEnemy extends Enemy {}

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private playerImage: HTMLImageElement;
  private enemyImage: HTMLImageElement;
  private nonShootableEnemyImage: HTMLImageElement;
  private enemies: Enemy[];
  private nonShootableEnemies: NonShootableEnemy[];
  private acceleration: number = 0.06; // Sänkt acceleration
  private maxSpeed: number = 4; // Sänkt maxhastighet
  private lives: number = 3;
  private level: number = 1;
  private startingPosition = {
    x: 300,
    y: 200,
  };
  private keyStates: Set<string> = new Set();
  private initialDelay: number = 2000;
  private gameStartTime: number;

  private initialEnemies: Enemy[] = [
    { x: 100, y: 150, size: 50, speed: 0.5, direction: "horizontal" },
    { x: 200, y: 300, size: 45, speed: 0.5, direction: "vertical" },
    { x: 550, y: 450, size: 60, speed: 0.5, direction: "horizontal" },
    { x: 300, y: 500, size: 40, speed: 0.5, direction: "vertical" },
    { x: 750, y: 150, size: 40, speed: 0.5, direction: "horizontal" },
    { x: 150, y: 100, size: 35, speed: 0.5, direction: "vertical" },
    { x: 550, y: 550, size: 55, speed: 0.5, direction: "horizontal" },
  ];

  private initialNonShootableEnemies: NonShootableEnemy[] = [
    { x: 50, y: 50, size: 40, speed: 0.5, direction: "horizontal" },
    { x: 700, y: 400, size: 50, speed: 0.5, direction: "vertical" },
  ];

  private projectiles: Projectile[] = [];

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.player = {
      x: this.startingPosition.x,
      y: this.startingPosition.y,
      size: 50,
      vx: 0,
      vy: 0,
      direction: Direction.None,
    };

    this.playerImage = new Image();
    this.playerImage.onload = () => this.draw();
    this.playerImage.src = "../assets/rocket.svg";

    this.enemyImage = new Image();
    this.enemyImage.onload = () => this.draw();
    this.enemyImage.src = "../assets/star.svg";

    this.nonShootableEnemyImage = new Image();
    this.nonShootableEnemyImage.onload = () => this.draw();
    this.nonShootableEnemyImage.src = "../assets/stars.svg";

    this.enemies = this.initialEnemies.map((enemy) => ({ ...enemy }));
    this.nonShootableEnemies = this.initialNonShootableEnemies.map((enemy) => ({
      ...enemy,
    }));

    this.attachEventListeners();
    this.draw();
    this.gameStartTime = Date.now();
    this.gameLoop();
  }

  private attachEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keyStates.add(event.key);
    if (event.key === " ") {
      this.shootProjectile();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keyStates.delete(event.key);
  }

  private movePlayer(): void {
    const currentTime = Date.now();
    if (currentTime - this.gameStartTime < this.initialDelay) {
      return; // Vänta tills initial väntetid är över
    }

    if (this.keyStates.has("ArrowUp") || this.keyStates.has("w")) {
      this.player.vy = Math.max(
        this.player.vy - this.acceleration,
        -this.maxSpeed
      );
      this.player.direction = Direction.Up;
    } else if (this.keyStates.has("ArrowDown") || this.keyStates.has("s")) {
      this.player.vy = Math.min(
        this.player.vy + this.acceleration,
        this.maxSpeed
      );
      this.player.direction = Direction.Down;
    } else if (this.keyStates.has("ArrowLeft") || this.keyStates.has("a")) {
      this.player.vx = Math.max(
        this.player.vx - this.acceleration,
        -this.maxSpeed
      );
      this.player.direction = Direction.Left;
    } else if (this.keyStates.has("ArrowRight") || this.keyStates.has("d")) {
      this.player.vx = Math.min(
        this.player.vx + this.acceleration,
        this.maxSpeed
      );
      this.player.direction = Direction.Right;
    }

    // Apply velocity to player's position
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    if (this.player.x < 0) {
      this.player.x = this.canvas.width - this.player.size;
    } else if (this.player.x + this.player.size > this.canvas.width) {
      this.player.x = 0;
    }

    if (this.player.y < 0) {
      this.player.y = this.canvas.height - this.player.size;
    } else if (this.player.y + this.player.size > this.canvas.height) {
      this.player.y = 0;
    }

    // Check for collisions with enemies
    if (this.checkCollision()) {
      this.lives--;

      if (this.lives === 0) {
        alert("Game Over");
        this.resetGame();
      } else {
        this.resetStartingPosition();
      }
    }

    this.draw();
  }

  private gameLoop(): void {
    requestAnimationFrame(() => this.gameLoop());
    this.movePlayer();
    this.moveProjectiles();
    this.checkProjectileCollisions();
    this.draw();
    this.checkLevelProgress();
  }

  private moveProjectiles(): void {
    const currentTime = Date.now();
    if (currentTime - this.gameStartTime < this.initialDelay) {
      return; // Vänta tills initial väntetid är över
    }

    this.projectiles.forEach((projectile, index) => {
      switch (projectile.direction) {
        case Direction.Up:
          projectile.y -= projectile.speed;
          break;
        case Direction.Down:
          projectile.y += projectile.speed;
          break;
        case Direction.Left:
          projectile.x -= projectile.speed;
          break;
        case Direction.Right:
          projectile.x += projectile.speed;
          break;
      }

      // Ta bort projektilen om den är utanför canvas
      if (
        projectile.x < 0 ||
        projectile.x > this.canvas.width ||
        projectile.y < 0 ||
        projectile.y > this.canvas.height
      ) {
        this.projectiles.splice(index, 1);
      }
    });
  }

  private drawProjectiles(): void {
    this.ctx.fillStyle = "red";
    this.projectiles.forEach((projectile) => {
      this.ctx.fillRect(
        projectile.x,
        projectile.y,
        projectile.size,
        projectile.size
      );
    });
  }

  private checkProjectileCollisions(): void {
    this.projectiles.forEach((projectile, pIndex) => {
      this.enemies.forEach((enemy, eIndex) => {
        if (
          projectile.x < enemy.x + enemy.size &&
          projectile.x + projectile.size > enemy.x &&
          projectile.y < enemy.y + enemy.size &&
          projectile.y + projectile.size > enemy.y
        ) {
          // Ta bort projektil och fiende vid kollision
          this.projectiles.splice(pIndex, 1);
          this.enemies.splice(eIndex, 1);
        }
      });
    });
  }

  private drawEnemies(): void {
    for (const enemy of this.enemies) {
      this.ctx.drawImage(
        this.enemyImage,
        enemy.x,
        enemy.y,
        enemy.size,
        enemy.size
      );
    }
    for (const enemy of this.nonShootableEnemies) {
      this.ctx.drawImage(
        this.nonShootableEnemyImage,
        enemy.x,
        enemy.y,
        enemy.size,
        enemy.size
      );
    }
  }

  private shootProjectile(): void {
    const projectileSize = 10;
    const projectileSpeed = 10;

    const projectile: Projectile = {
      x: this.player.x + this.player.size / 2 - projectileSize / 2,
      y: this.player.y + this.player.size / 2 - projectileSize / 2,
      size: projectileSize,
      speed: projectileSpeed,
      direction: this.player.direction,
    };

    this.projectiles.push(projectile);
  }

  private checkCollision(): boolean {
    for (const enemy of this.enemies) {
      if (
        this.player.x < enemy.x + enemy.size &&
        this.player.x + this.player.size > enemy.x &&
        this.player.y < enemy.y + enemy.size &&
        this.player.y + this.player.size > enemy.y
      ) {
        return true;
      }
    }
    for (const enemy of this.nonShootableEnemies) {
      if (
        this.player.x < enemy.x + enemy.size &&
        this.player.x + this.player.size > enemy.x &&
        this.player.y < enemy.y + enemy.size &&
        this.player.y + this.player.size > enemy.y
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
    switch (this.player.direction) {
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
      this.player.x + this.player.size / 2,
      this.player.y + this.player.size / 2
    );
    this.ctx.rotate(rotationAngle);

    this.ctx.drawImage(
      this.playerImage,
      -this.player.size / 2,
      -this.player.size / 2,
      this.player.size,
      this.player.size
    );

    this.ctx.restore();

    this.drawProjectiles();
    this.drawEnemies();
    this.moveEnemies();
    this.moveNonShootableEnemies();
    this.displayLives();
    this.displayLevel();
  }

  private resetGame(): void {
    this.resetStartingPosition();
    this.lives = 3;
    this.level = 1;
    this.resetEnemies();
    this.resetNonShootableEnemies();
    this.player.direction = Direction.None;
    this.gameStartTime = Date.now();
    this.draw();
  }

  private resetEnemies(): void {
    this.enemies = this.initialEnemies.map((enemy) => ({
      ...enemy,
      speed: 0.5 + (this.level - 1) * 0.25, // Justering av hastighet baserat på nivå
    }));
  }

  private resetNonShootableEnemies(): void {
    this.nonShootableEnemies = this.initialNonShootableEnemies.map((enemy) => ({
      ...enemy,
      speed: 0.5 + (this.level - 1) * 0.25, // Justering av hastighet baserat på nivå
    }));
  }

  private resetStartingPosition(): void {
    this.player.x = this.startingPosition.x;
    this.player.y = this.startingPosition.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.direction = Direction.None;
  }

  private moveEnemies(): void {
    const currentTime = Date.now();
    if (currentTime - this.gameStartTime < this.initialDelay) {
      return; // Vänta tills initial väntetid är över
    }

    this.enemies.forEach((enemy) => {
      if (enemy.direction === "horizontal") {
        enemy.x += enemy.speed;
        if (enemy.x > this.canvas.width - enemy.size || enemy.x < 0) {
          enemy.speed *= -1;
        }
      } else {
        enemy.y += enemy.speed;
        if (enemy.y > this.canvas.height - enemy.size || enemy.y < 0) {
          enemy.speed *= -1;
        }
      }
    });
  }

  private moveNonShootableEnemies(): void {
    const currentTime = Date.now();
    if (currentTime - this.gameStartTime < this.initialDelay) {
      return; // Vänta tills initial väntetid är över
    }

    this.nonShootableEnemies.forEach((enemy) => {
      if (enemy.direction === "horizontal") {
        enemy.x += enemy.speed;
        if (enemy.x > this.canvas.width - enemy.size || enemy.x < 0) {
          enemy.speed *= -1;
        }
      } else {
        enemy.y += enemy.speed;
        if (enemy.y > this.canvas.height - enemy.size || enemy.y < 0) {
          enemy.speed *= -1;
        }
      }
    });
  }

  private displayLives(): void {
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(`Liv: ${this.lives}`, 10, 30);
  }

  private displayLevel(): void {
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(`Nivå: ${this.level}`, this.canvas.width - 100, 30);
  }

  private checkLevelProgress(): void {
    if (this.enemies.length === 0) {
      this.level++;
      this.resetEnemies();
      this.resetNonShootableEnemies();
    }
  }
}

window.onload = () => {
  new Game("gameCanvas");
};

window.onload = () => {
  new Game("gameCanvas");
};
