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


    var Base = {
        create: function(config){
            return $.extend(Object.create(this),config)
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
        }
    })

    var MoveableSprite = Sprite.create({
        velocity: 0,
        direction: STATIONARY,
        move: function(){
            if(this.direction === RIGHT) {
                this.x += this.velocity;
            } else if(this.direction === LEFT) {
                this.x -= this.velocity;
            } else if(this.direction === DOWN) {
                this.y += this.velocity;
            } else if(this.direction === UP) {
                this.y -= this.velocity;
            }
        }
    })

    var Protein = Sprite.create({
        nutrition: 5
    })

    var Cell = MoveableSprite.create({
        health: 100,
        width: 50,
        height: 50,
        velocity: 10,
        image: document.getElementById('cellImage')
    })

    var Bacteria = MoveableSprite.create({
        attack: 5,
        width: 10,
        height: 10
    })


    var World = Base.create({
        width: 0,
        height: 0,
        canvas: null,
        context: null,
        cell: null,
        initialize: function() {
            this.context = this.canvas.getContext('2d');
            this.cell = Cell.create({
                x: 5,
                y: 7
            });
            this.initalizeControls();
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
            this.canvas.width = canvas.width;
        },

        loop: function () {
            this.cell.move();
            this.clear();
            this.cell.draw(this.context);
        }
    })

    function main() {
        var world = World.create({
            canvas: document.getElementById('canvas')
        });
        world.initialize();
    }

    main();

})();


 //     return (Math.min(this.bottom, region.bottom) >= Math.max(this.top, region.top) && Math.min(this.right, region.right) >= Math.max(this.left, region.left));