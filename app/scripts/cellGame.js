/**
 * Cell Game
 * @author Eron Lake
 */
(function() {

  'use strict';

  var LEFT = 1;
  var UP = 2;
  var RIGHT = 4;
  var DOWN = 8;
  var KEY_LEFT = 37;
  var KEY_UP = 38;
  var KEY_RIGHT = 39;
  var KEY_DOWN = 40;
  var STATIONARY = 0;
  var MAX_HEALTH = 100;


  var Base = {
    create: function(config) {
      return $.extend(Object.create(this), config)
    },

    isInstanceOf: function(prototype) {
      return prototype.isPrototypeOf(this);
    },

    getParent: function() {
      return Object.getPrototypeOf(this);
    },

    isChildOf: function(prototype) {
      return this.getParent() === prototype;
    }
  }

  var Sprite = Base.create({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    getLeft: function() {
      return this.x;
    },
    getTop: function() {
      return this.y;
    },
    getRight: function() {
      return this.x + this.width;
    },
    getBottom: function() {
      return this.y + this.height;
    },
    draw: function(context) {
      context.drawImage(this.image, this.getLeft(), this.getTop(), this.width, this.height);
    },
    intersects: function(sprite) {
      return (Math.min(this.getBottom(), sprite.getBottom()) >= Math.max(this.getTop(), sprite.getTop()) && Math.min(this.getRight(), sprite.getRight()) >= Math.max(this.getLeft(), sprite.getLeft()));
    }
  })

  var MoveableSprite = Sprite.create({
    velocity: 0,
    direction: STATIONARY,
    move: function(bounds) {
      if (this.direction === RIGHT) {
        if (this.getRight() + this.velocity < bounds.right) {
          this.x += this.velocity;
        } else {
          this.x = bounds.right - this.width;
        }
      } else if (this.direction === LEFT) {
        if (this.getLeft() - this.velocity >= bounds.left) {
          this.x -= this.velocity;
        } else {
          this.x = bounds.left;
        }
      } else if (this.direction === DOWN) {
        if (this.getBottom() + this.velocity < bounds.bottom) {
          this.y += this.velocity;
        } else {
          this.y = bounds.bottom - this.height;
        }
      } else if (this.direction === UP) {
        if (this.getTop() - this.velocity >= bounds.top) {
          this.y -= this.velocity;
        } else {
          this.y = bounds.top;
        }
      }
    }
  })

  var Protein = Sprite.create({
    nutrition: 5,
    image: document.getElementById('proteinImage')
  })

  var Cell = MoveableSprite.create({
    health: MAX_HEALTH,
    width: 50,
    height: 50,
    velocity: 5,
    score: 0,
    image: document.getElementById('cellImage'),
    eat: function(nutrition) {
      this.health = Math.min(this.health + nutrition, MAX_HEALTH);
      this.score += nutrition;
    }

  })

  var Bacteria = MoveableSprite.create({
    attack: .1,
    width: 40,
    height: 40,
    velocity: 4.5,
    iq: .4,
    image: document.getElementById('standardBacteriaImage'),
    think: function(cell) {
      if (this.iq > Math.random()) {
        // artificial inteligence
        var deltaX = this.x - cell.x;
        var deltaY = this.y - cell.y
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          this.direction = (deltaX > 0) ? LEFT : RIGHT;
        } else {
          this.direction = (deltaY > 0) ? UP : DOWN;
        }
      } else {
        // atrificial stupidity
        var directions = [LEFT, UP, RIGHT, DOWN, STATIONARY];
        var index = Math.floor(Math.random() * directions.length)
        this.direction = directions[index];
      } 
    }
  })

  var BombBacteria = Bacteria.create({
    attack: 1,
    velocity: .5,
    width: 15,
    height: 30,
    iq: .2,
    image: document.getElementById('bombBacteriaImage')
  })

  var Lesson = Base.create({
    text: '',
    taught: false,
    teach: function() {
      if (this.taught === false) {
        alert(this.text);
        this.taught = true;
      }
    }

  })

  var proteinLesson = Lesson.create({
    text: 'Proteins nourish cells.'
  })

  var bacteriaLesson = Lesson.create({
    text: 'Bacteria can damage cells.'
  })

  var bombBacteriaLesson = Lesson.create({
    text: 'Viruses can critically injure cells.'
  })

  var lowHealthLesson = Lesson.create({
    text: 'Cells need protein to survive.'
  })

  var deathLesson = Lesson.create({
    text: 'When a cell becomes too unhealthy it dies.'
  })




  var World = Base.create({
    width: 0,
    height: 0,
    canvas: null,
    context: null,
    cell: null,
    numProtein: 5,
    numBacteria: 2,
    initialize: function() {

      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.context = this.canvas.getContext('2d');
      this.bounds = {
        left: 0,
        top: 0,
        right: this.width,
        bottom: this.height
      }

      this.cell = Cell.create({
        x: (this.width - Cell.width) / 2,
        y: (this.height - Cell.height) / 2
      });


      this.proteins = [];
      for (var i = 0; i < this.numProtein; i++) {
        this.createProtein();
      }

      this.bacterias = [];
      for (var i = 0; i < 3; i++) {
        this.createBacteria(Bacteria);
      }
      for (var i = 0; i < 7; i++) {
        this.createBacteria(BombBacteria);
      }

      this.initalizeControls();
      this.startTime = Date.now();
      this.timer = setInterval(this.loop.bind(this), 1000 / 60)
    },

    initalizeControls: function() {

      this.keyCodeToDirection = {};
      this.keyCodeToDirection[KEY_LEFT] = LEFT
      this.keyCodeToDirection[KEY_UP] = UP
      this.keyCodeToDirection[KEY_RIGHT] = RIGHT
      this.keyCodeToDirection[KEY_DOWN] = DOWN

      document.addEventListener('keydown', this.onKeyDown.bind(this), true);
      document.addEventListener('keyup', this.onKeyUp.bind(this), true);
    },

    onKeyDown: function(event) {

      var direction = this.keyCodeToDirection[event.keyCode];

      if (direction) {
        event.preventDefault();
        this.cell.direction = direction;
      }
    },

    onKeyUp: function(event) {
      var direction = this.keyCodeToDirection[event.keyCode];
      if (direction === this.cell.direction) {
        this.cell.direction = STATIONARY;
      }
    },

    clear: function() {
      this.canvas.width = this.canvas.width;
    },

    loop: function() {

      var now = Date.now();

      // move cell
      this.cell.move(this.bounds);

      // move protein
      if (this.proteins.length < 5 && (now - this.lastCreatedProteinTime) > 3000) {
        this.createProtein();
      }

      // move bacteria
      var bacteria;
      for (var i = 0; i < this.bacterias.length; i++) {
        bacteria = this.bacterias[i];
        bacteria.think(this.cell);
        bacteria.move(this.bounds);
      }

      //collision detection 
      var i = this.proteins.length;
      var protein;
      while (i--) {
        protein = this.proteins[i];
        if (protein.intersects(this.cell)) {
          this.proteins.splice(i, 1);
          this.cell.eat(protein.nutrition);
          proteinLesson.teach();
        }
      }

      var bacteria;
      for (var i = 0; i < this.bacterias.length; i++) {
        bacteria = this.bacterias[i];
        if (bacteria.intersects(this.cell)) {

          // TODO refactor into cell prototype
          this.cell.health = Math.max(this.cell.health - bacteria.attack, 0);

          switch (bacteria.getParent()) {
            case Bacteria:
              bacteriaLesson.teach();
              break;
            case BombBacteria:
              bombBacteriaLesson.teach()
              break;
          }
        }
      }
      // draw
      this.clear();

      for (var i = 0; i < this.proteins.length; i++) {
        this.proteins[i].draw(this.context);
      }

      this.cell.draw(this.context);


      for (var i = 0; i < this.bacterias.length; i++) {
        this.bacterias[i].draw(this.context);
      }

      this.scoreElement.textContent = this.cell.score;
      this.healthElement.textContent = this.cell.health.toFixed(0);
      this.timerElement.textContent = ((now - this.startTime) / 1000).toFixed(1);

      // continue?
      if (this.cell.health < 20) {
        lowHealthLesson.teach();
      }

      if (this.cell.health <= 0) {
        deathLesson.teach();
        clearInterval(this.timer);
        document.getElementById('restart').classList.add('visible');
      }
    },

    createBacteria: function(bacteriaType) {

      var bacteria = bacteriaType.create({
        x: Math.random() * (this.width - bacteriaType.width),
        y: Math.random() * (this.height - bacteriaType.height),
      })

      this.bacterias.push(bacteria);
      this.lastCreatedBacteriaTime = Date.now();
    },

    createProtein: function() {
      var size = Math.random() * 10 + 30;

      var protein = Protein.create({
        width: size,
        height: size,
        x: Math.random() * (this.width - size),
        y: Math.random() * (this.height - size),
      })

      this.proteins.push(protein);
      this.lastCreatedProteinTime = Date.now();
    }
  })

  function main() {
    var world = World.create({
      canvas: document.getElementById('canvas'),
      width: window.innerWidth,
      height: window.innerHeight * .7,
      healthElement: document.getElementById('health'),
      timerElement: document.getElementById('timer'),
      scoreElement: document.getElementById('score')
    });
    world.initialize();
  }

  main();

})();