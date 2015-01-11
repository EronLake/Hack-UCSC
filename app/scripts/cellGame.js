/**
 * Cell Game
 * @author Eron Lake
 */

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
    direction: 0
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

var jimmy = Cell.create({
    x: 5,
    y: 7
})

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
    

setInterval(function () {
    canvas.width = canvas.width;
    jimmy.draw(context);
    jimmy.x += jimmy.velocity;
}, 10)





 //     return (Math.min(this.bottom, region.bottom) >= Math.max(this.top, region.top) && Math.min(this.right, region.right) >= Math.max(this.left, region.left));