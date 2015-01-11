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
        create: function(config){
            return $.extend(Object.create(this),config)
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
        getLeft: function(){
            return this.x;
        },
        getTop: function(){
            return this.y;
        },
        getRight: function(){
            return this.x + this.width;
        },
        getBottom: function () {
            return this.y + this.height;
        },
        draw: function(context){
            context.drawImage(this.image, this.getLeft(), this.getTop(), this.width, this.height);
        },
        intersects: function(sprite){
            return (Math.min(this.getBottom(), sprite.getBottom()) >= Math.max(this.getTop(), sprite.getTop()) && Math.min(this.getRight(), sprite.getRight()) >= Math.max(this.getLeft(), sprite.getLeft()));
        }
    })

    var MoveableSprite = Sprite.create({
        velocity: 0,
        direction: STATIONARY,
        move: function(bounds){
            if(this.direction === RIGHT) {
                if(this.getRight() + this.velocity < bounds.right){
                    this.x += this.velocity;
                } else {
                    this.x = bounds.right - this.width;
                }
            } else if(this.direction === LEFT) {
                if(this.getLeft() - this.velocity >= bounds.left){
                    this.x -= this.velocity;
                } else {
                    this.x = bounds.left;
                }
            } else if(this.direction === DOWN) {
                if(this.getBottom() + this.velocity < bounds.bottom){
                    this.y += this.velocity;
                } else {
                    this.y = bounds.bottom - this.height;
                }
            } else if(this.direction === UP) {
               if(this.getTop() - this.velocity >= bounds.top){
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
        velocity: 10,
        score: 0, 
        image: document.getElementById('cellImage'),
        eat: function(nutrition){
            this.health = Math.min(this.health + nutrition, MAX_HEALTH);
            this.score += nutrition;
        }

    })

    var Bacteria = MoveableSprite.create({
        attack: .5,
        width: 40,
        height: 40,
        velocity: 6,
        image: document.getElementById('standardBacteriaImage'),
        think: function(cell) {
            var deltaX = this.x - cell.x;
            var deltaY = this.y - cell.y
            if(Math.abs(deltaX) > Math.abs(deltaY)){
                this.direction = (deltaX > 0) ? LEFT : RIGHT;
            } else {
                this.direction = (deltaY> 0) ? UP : DOWN;
            }

        }
    })

    var BombBacteria = Bacteria.create({
        attack: 1,
        velocity: 1,
        image: document.getElementById('bombBacteriaImage')
    })

    var Lesson = Base.create({
        text: '',
        taught: false,
        teach: function() {
            if(this.taught === false){
              alert(this.text);
              this.taught = true;
            }
        }

    })

    var proteinLesson = Lesson.create({
        text: 'Cell need protein to survive'
    })

    var bacteriaLesson = Lesson.create({
        text: 'Bacteria can hurt cells'
    })

    var bombBacteriaLesson = Lesson.create({
        text: 'viruses can critically injure cells'
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
                left:0,
                top:0,
                right: this.width,
                bottom: this.height
            }

            this.cell = Cell.create({
                x: 5,
                y: 7
            });


            this.proteins = [];
            for(var i = 0; i < this.numProtein; i++){
                this.createProtein();
            }

            this.bacterias = [];
            for(var i = 0; i < 3; i++){
                this.createBacteria(Bacteria);
            }
            for(var i = 0; i < 7; i++){
                this.createBacteria(BombBacteria);
            }

            this.initalizeControls();
            this.startTime = Date.now();
            setInterval(this.loop.bind(this), 1000/60)
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
            this.cell.direction = STATIONARY;
        },

        clear: function() {
            this.canvas.width = this.canvas.width;
        },

        loop: function () {
            this.cell.move(this.bounds);

            var bacteria;
            for(var i= 0; i < this.bacterias.length; i++){
                bacteria = this.bacterias[i];
                bacteria.think(this.cell);
                bacteria.move(this.bounds);
            }

            var now = Date.now();
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

            if(this.proteins.length < 5 && (now - this.lastCreatedProteinTime) > 5000 ){
                this.createProtein();
            }

            var bacteria;
            for(var i = 0;i < this.bacterias.length; i++){
                bacteria = this.bacterias[i];
                if (bacteria.intersects(this.cell)) {
                    this.cell.health -= bacteria.attack;

                    switch(bacteria.getParent()) {
                        case Bacteria:
                            bacteriaLesson.teach();
                        break;
                        case BombBacteria:
                            bombBacteriaLesson.teach()
                        break;
                    }
                }
            }


            this.clear();
           
            for(var i = 0; i < this.proteins.length; i++){
                this.proteins[i].draw(this.context);
            }

            this.cell.draw(this.context);


            for(var i = 0; i < this.bacterias.length; i++){
                this.bacterias[i].draw(this.context);
            }

            this.scoreElement.textContent = this.cell.score;
            this.healthElement.textContent = this.cell.health;
            this.timerElement.textContent = ((now - this.startTime)/1000).toFixed(1);

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
            var size = Math.random() *10 + 30;

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


