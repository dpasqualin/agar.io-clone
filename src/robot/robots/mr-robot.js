var DecisionTree = require("decision-tree");
var trainingData = require("./trainingData.json");
var paper = require("paper");



/* 
--------------- DEFINIÇÕES DO APRENDIZADO ---------------
i = indice do vetor de caracteristicas
Características:
    i0 - distancia da comida (0 - não tem comida, 1 - tem comida)
    i1 - distancia do virus (-1 - não tem virus ou esta longe, 1 - virus perto)
    i2 - tamanho do virus (0 - virus menor, 1 - virus maior)
    i3 - distancia do inimigo (0 - não tem inimigo, 1 - inimigo longe, 2 - inimigo perto, 3 - inimigo muito perto) 
    i4 - tamanho do inimigo (0 - inimigo menor, 1 - inimigo maior, 2 - inimigo duas ou mais vezes maior, 3 - inimigo quase atingindo a massa máxima)
    i5 - tamanho da celula (0 - pequena, 1 - pode ejetar massa, 2 - pode se dividir, 3 - tamanho quase maximo)
Classes:
    0 - ir na direção da comida
    1 - ir na direção do inimigo
    2 - fugir do inimigo
X   3 - se dividir
X   4 - ejetar massa
    5 - desviar
    6 - perambular
    7 - ir na direção do virus
Número de Casos = 2³*4³ = 512
*/

// this is an example robot. It always goes for the closest food. It doesn't
// care for mass, viruses or opponents. Thug life.

var ANGLE_SEARCH_VIRUS = 120;
var FULL_SPEED = 500;

var target_element;
var actual_prediction;
var old_prediction;
var edibles;
//TODO: Usar closestVirus na ações
var closestVirus;
var closestEnemy;

var dims;
var config;


var features = ["foodDistance","virusDistance","virusSize","enemyDistance","enemySize","cellSize"];
var dt = new DecisionTree(trainingData, "action", features);

//TODO: Não recalcular ameaças e outros, usar global
module.exports = {
    // The robots name
    name: 'MrRobot',

    // This function is called just once and it provides the board size
    game_setup: function(data) {
        // example of data: { gameWidth: 1920, gameHeight: 1080 }
        dims = { width: data.gameWidth, height: data.gameHeight };
        config = data;
    },

    // MANDATORY FUNCTION
    // this function is called approximately 60 times per second. It better be
    // fast, or you will loose some moves.
    step: function(playerData, userData, foodsList, massList, virusList) {


        // get biggest cell
        var biggest_cell = get_my_biggest_cell(playerData.cells);
        var state = robotState(biggest_cell, playerData, userData, foodsList, massList, virusList);
        var direction = {x:0, y:0};
        predict(state);
      
        if(actual_prediction === 0){
            if(!target_element || was_eaten(target_element, edibles)){
                target_element = eat(biggest_cell, edibles);
                if(target_element){
                    direction = goto(biggest_cell, target_element, FULL_SPEED);
                }
            }else{
                direction = goto(biggest_cell, target_element, FULL_SPEED);
            }

            
        }else if(actual_prediction === 1){
            if(!target_element){
                target_element = getClosestEnemyCell(biggest_cell, userData).item;
            }
            direction = goto(biggest_cell, target_element, FULL_SPEED);
        }
        else if(actual_prediction === 2){
            target_element = getClosestEnemyCell(biggest_cell, userData).item;
            direction = goto(biggest_cell, runaway(biggest_cell, userData), FULL_SPEED);
        }
        else if(actual_prediction === 5){
            if(!target_element){
                target_element = getClosestItem(biggest_cell, virusList).item;
            }
            direction = goto(biggest_cell, dodge(biggest_cell), FULL_SPEED);
        }else if(actual_prediction === 7){
            if(!target_element){
                target_element = getClosestItem(biggest_cell, virusList).item;
                if(target_element){
                    direction =  goto(biggest_cell, target_element, FULL_SPEED);
                }
            }else{
                 direction = goto(biggest_cell, target_element, FULL_SPEED);
            }
        }else{
            direction = wanderer(biggest_cell);
        }
        return direction;
    }
};

function predict(state){
    old_prediction = actual_prediction;
    actual_prediction = dt.predict(state);
    //prediction changed
    if(old_prediction!=actual_prediction){
        target_element = null;
    }
    
}

function adjust_direction(origin, direction){
    'use strict';
    let pretended_position = new paper.Point(origin.x + direction.x, origin.y + direction.x);
    
    if(pretended_position.x <=0 || pretended_position.x >= config.gameHeight){
        if(Math.abs(pretended_position.angle) > 90){
            direction.angle = 180;
        }else{
            direction.angle = 0;
        }
    }else if(pretended_position.y <=0 || pretended_position.y >= config.gameWidth){
        if(pretended_position.angle > 0){
            direction.angle = 90;
        }else{
            direction.angle = -90;
        }
    }
    return direction;
}
//TODO: Considerar outras celulas do inimigo e nosso
function runaway(origin, enemyList){
    "use strict";
    let origin_point = new paper.Point(origin.x, origin.y);
    let enemy_point = new paper.Point(target_element.x, target_element.y);
    let direction = origin_point.subtract(enemy_point);
    // direction.angle += -180;
    return enemy_point.multiply(-1);
}

function dodge(origin){
    "use strict";
    let origin_point = new paper.Point(origin.x, origin.y);
    let virus_point = new paper.Point(target_element.x, target_element.y);
 
    let direction = virus_point.subtract(origin_point);
    direction.angle += 90;
    return direction;
}

function eat(origin, edibles){
    "use strict";
    let upLeft={"list":[], "mass":0}, upRight={"list":[], "mass":0}, downLeft={"list":[], "mass":0}, downRight={"list":[], "mass":0};
    for(let i = 0; i < edibles.length; i++){
        if(edibles[i].x >= origin.x && edibles[i].y >= origin.y){
            upLeft.list.push(edibles[i]);
            upLeft.mass+=edibles[i].mass;
        }else if(edibles[i].x >= origin.x && edibles[i].y <= origin.y){
            downLeft.list.push(edibles[i]);
            downLeft.mass+=edibles[i].mass;
        }else if(edibles[i].x <= origin.x && edibles[i].y <= origin.y){
            downRight.list.push(edibles[i]);
            downRight.mass+=edibles[i].mass;
        }else if(edibles[i].x <= origin.x && edibles[i].y >= origin.y){
            upRight.list.push(edibles[i]);
            upRight.mass+=edibles[i].mass;
        }
    }
    let upLeftClosest = getClosestItem(origin, upLeft.list);
    let upRightClosest = getClosestItem(origin, upRight.list);
    let downLeftClosest = getClosestItem(origin, downLeft.list);
    let downRightClosest = getClosestItem(origin, downRight.list);

    let upLeftDistance = upLeftClosest ? upLeftClosest.distance : 1;
    let upRightDistance = upRightClosest ? upRightClosest.distance : 1;
    let downLeftDistance = downLeftClosest ? downLeftClosest.distance : 1;
    let downRightDistance = downRightClosest ? downRightClosest.distance : 1;

    if(upLeft.list.length > 0 && upLeft.mass/upLeftDistance >= upRight.mass/upRightDistance && upLeft.mass/upLeftDistance >= downLeft.mass/downLeftDistance && upLeft.mass/upLeftDistance >= downRight.mass/downRightDistance)
        return upLeftClosest.item;
    if(upRight.list.length > 0 && upRight.mass/upRightDistance >= upLeft.mass/upLeftDistance && upRight.mass/upRightDistance >= downLeft.mass/downLeftDistance && upRight.mass/upRightDistance >= downRight.mass/downRightDistance)
        return upRightClosest.item;
    if(downLeft.list.length > 0 && downLeft.mass/downLeftDistance >= upRight.mass/upRightDistance && downLeft.mass/downLeftDistance >= upLeft.mass/upLeftDistance && downLeft.mass/downLeftDistance >= downRight.mass/downRightDistance)
        return downLeftClosest.item;
    if(downRight.list.length > 0 && downRight.mass/downRightDistance >= upRight.mass/upRightDistance && downRight.mass/downRightDistance >= downLeft.mass/downLeftDistance && downRight.mass/downRightDistance >= upLeft.mass/upLeftDistance)
        return downRightClosest.item;
    return null; //Shouldnt get here
}

function robotState(origin, playerData, userData, foodsList, massList, virusList){
    "use strict";
    let virusDistance=-1, virusSize=0, enemyDistance=0, enemySize=0, cellSize=0;
    closestVirus = getClosestItem(origin, virusList);
    closestEnemy = getClosestEnemyCell(origin, userData);
    if(virusList.length > 0){
        virusDistance = (closestVirus.distance <= (origin.radius + closestVirus.item.radius+10)) ? 1 : -1;
        virusSize = +(closestVirus.item.mass > origin.mass);
    }
    if(userData.length > 0){
        let distance = origin.radius + closestEnemy.item.radius;
        if(closestEnemy.distance <= (distance+10)){
            enemyDistance = 3;
        }else if(closestEnemy.distance <= (distance+(config.minVisibleDistance*1/3))){
            enemyDistance = 2;
        }else{
            enemyDistance = 1;
        }
        if(closestEnemy.item.mass > origin.mass+(origin.mass*0.1)){
            if(closestEnemy.item.mass >= config.maxMass*95){
                enemySize = 3;
            }else if(closestEnemy.item.mass >= origin.mass*2){
                enemySize = 2;
            }else{
                enemySize = 1;
            }
        }
    }
    if(origin.mass >= config.maxMass*95){
        cellSize = 3;
    }else if(origin.mass >= 30){
        cellSize = 1;
    }else if(origin.mass >= 20){
        cellSize = 2;
    }
    edibles = foodsList.concat(massList);

    if(old_prediction === 5){
        edibles = edibles.filter((item)=>!isBehindVirus(item,origin,closestVirus.item));

    }
    return {
        "foodDistance": +(edibles.length > 0),
        "virusDistance": virusDistance,
        "virusSize": virusSize,
        "enemyDistance": enemyDistance,
        "enemySize": enemySize,
        "cellSize":cellSize
    };
}

function getClosestEnemyCell(origin, enemies) {
    if (enemies.length === 0) {
        return null;
    }

    // get the distance to all food cells
    var distances = enemies.map(function(item, idx) {
        return getClosestItem(origin, item.cells);
    });

    // sort descending
    distances.sort(function(a, b) { return a.distance - b.distance; });
    return distances[0];
}

function getClosestItem(origin, list) {
    if (list.length === 0) {
        return null;
    }

    // get the distance to all food cells
    var distances = list.map(function(item, idx) {
        return {'item': item, 'distance': calc_distance(origin, item)};
    });

    // sort descending
    distances.sort(function(a, b) { return a.distance - b.distance; });
    return distances[0];
}

// go and get it, tiger!
// vSourceToDestination = vDestination - vSource;
// multiplication makes sure we are going as fast as possible.
function goto(origin, dest, speed){
    var direction = {
                    x: (dest.x - origin.x) * speed,
                    y: (dest.y - origin.y) * speed
        
    };
    return direction;
}

// when no food is in sight, this robot will just happily walk around.
// the default direction is up, but when it gets near the top it will turn
// right, then down when near the right border, and finally left and up again,
// if necessary.
function wanderer(my_position) {
    var wanderer_direction = 'UP';
    var target = {x: 0, y: 0};
    var limit = 250;

    // set direction based on current position and borders
    if (my_position.x < limit && my_position.y > limit) {
        wanderer_direction = 'UP';
        if(old_prediction === 5 && isBehindVirus({x:0, y:-FULL_SPEED}, my_position, closestVirus.item)){
            wanderer_direction = 'DOWN';
        }
    } else if (my_position.y < limit && dims.width - my_position.x > limit) {
        wanderer_direction = 'RIGHT';
        if(old_prediction === 5 && isBehindVirus({x:FULL_SPEED, y:0}, my_position, closestVirus.item)){
            wanderer_direction = 'LEFT';
        }
    } else if (dims.width - my_position.x < limit && dims.height - my_position.y > limit) {
        wanderer_direction = 'DOWN';
        if(old_prediction === 5 && isBehindVirus({x:0, y:FULL_SPEED}, my_position, closestVirus.item)){
            wanderer_direction = 'UP';
        }
    } else if (dims.height - my_position.y < limit) {
        wanderer_direction = 'LEFT';
        if(old_prediction === 5 && isBehindVirus({x:-FULL_SPEED, y:0}, my_position, closestVirus.item)){
            wanderer_direction = 'RIGHT';
        }
    }

    // go full speed towards the chosen direction
    switch (wanderer_direction) {
        case 'UP':
            target.y = -FULL_SPEED;
            break;
        case 'DOWN':
            target.y = FULL_SPEED;
            break;
        case 'RIGHT':
            target.x = FULL_SPEED;
            break;
        case 'LEFT':
            target.x = -FULL_SPEED;
            break;
    }

    return target;
}

// return true if food is not present anymore
// (probably eaten by us or someone else)
function was_eaten(food, foodsList) {
    var exist = foodsList.filter(function(e) {
        return food.id === e.id;
    });

    return exist.length === 0;
}

// return the more massive cell
function get_my_biggest_cell(userData) {
    // sort descending
    userData.sort(function(a, b) { return b.mass - a.mass; });
    return userData[0];
}

// calculate the distance between two points
function calc_distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function isBehindVirus(item, origin, closestVirus){
    'use strict';
    let distItem = calc_distance(origin, item);
    let distVirus = calc_distance(origin, closestVirus);
    let distItemVirus = calc_distance(item, closestVirus);

    return (distVirus < distItem) && (distItem > distItemVirus);
}
