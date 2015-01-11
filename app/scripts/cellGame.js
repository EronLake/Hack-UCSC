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
        numProtein: 5,
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
            this.canvas.width = this.canvas.width;
        },

        loop: function () {
            this.cell.move(this.bounds);
            

            this.clear();
            this.cell.draw(this.context);
            for(var i = 0; i < this.proteins.length; i++){
                this.proteins[i].draw(this.context);
            }

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
        }
    })

    function main() {
        var world = World.create({
            canvas: document.getElementById('canvas'),
            width: 600,
            height: 400
        });
        world.initialize();
    }

    main();

})();


 //     return (Math.min(this.bottom, region.bottom) >= Math.max(this.top, region.top) && Math.min(this.right, region.right) >= Math.max(this.left, region.left));