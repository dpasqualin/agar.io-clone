// this is an example robot. It always goes for the closest food. It doesn't
// care for mass, viruses or opponents. Thug life.

var FULL_SPEED = 500;
var target_food;
var dims;

module.exports = {
    // The robots name
    name: 'MedrosoRobot',

    // This function is called just once and it provides the board size
    game_setup: function(data) {
        // example of data: { gameWidth: 1920, gameHeight: 1080 }
        dims = { width: data.gameWidth, height: data.gameHeight };
    },

    // MANDATORY FUNCTION
    // this function is called approximately 60 times per second. It better be
    // fast, or you will loose some moves.
    step: function(playerData, userData, foodsList, massList, virusList) {

        var target_position = {x: 0, y:0};
        var closest_food;
        var enemy_position = {x: 0, y:0};
    
        /*if (userData.length > 0) 
            //console.log("Medroso: ", userData.length);
        */
        /*for (var i = 0; i < userData.length ; i++ ) {
            //console.log("Medroso: ", userData[i].name);
        }*/

    
        enemy_position = anyone_around(playerData, userData); 
        if ( enemy_position ) {
            ////console.log("entrou enemy");
            //target_position = run_forest_run(enemy_position);
            return enemy_position;
        }

        // get biggest cell
        var biggest_cell = get_my_biggest_cell(playerData.cells);

        // get a new target food if we don't have a target or it has been eaten already
        if (!target_food || was_eaten(target_food, foodsList)) {
            target_food = get_closest_food(biggest_cell, foodsList);
        }

        // there might not be any visible food
        if (!target_food) {
            // if no food is visible nearby, just walk around
            target_position = wanderer(biggest_cell);
            return target_position;
        } else {
            // go and get it, tiger!
            // vSourceToDestination = vDestination - vSource;
            // multiplication makes sure we are going as fast as possible.
            target_position.x = (target_food.x - biggest_cell.x) * 50;
            target_position.y = (target_food.y - biggest_cell.y) * 50;
            return target_position;
        }
    },

};

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
    } else if (my_position.y < limit && dims.width - my_position.x > limit) {
        wanderer_direction = 'RIGHT';
    } else if (dims.width - my_position.x < limit && dims.height - my_position.y > limit) {
        wanderer_direction = 'DOWN';
    } else if (dims.height - my_position.y < limit) {
        wanderer_direction = 'LEFT';
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

// return the food that is closest to origin (usually one of our cells)
function get_closest_food(origin, foodsList) {

    // shit, nothing to eat :(
    if (foodsList.length === 0) {
        return null;
    }

    // get the distance to all food cells
    var food_distances = foodsList.map(function(food, idx) {
        return {'food': food, 'distance': calc_distance(origin, food)};
    });

    // sort descending
    food_distances.sort(function(a, b) { return a.distance - b.distance; });

    var closest = food_distances[0].food;

    return closest;
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


/* My functions */


// return the more massive cell
function get_my_biggest_cell(userData) {
    // sort descending
    userData.sort(function(a, b) { return b.mass - a.mass; });
    return userData[0];
}

// return the less massive cell
function get_enemy_smallest_cell(enemyData) {
    // sort ascending
    enemyData.sort(function(a, b) { return a.mass - b.mass; });
    return enemyData[0];
}

// calculate the distance between two points
function calc_distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}


// return the enemy that is closest to origin (usually one of our cells)
function get_closest_enemy(origin, userData) {

    // shit, nothing to eat :(
    if (userData.length === 0) {
        return null;
    }

    // get the distance to all enemy cells
    var enemies_distances = userData.map(function(enemy, idx) {
        var smallest_cell = get_enemy_smallest_cell(enemy.cells);
        return {'enemy': smallest_cell, 'distance': calc_distance(origin, smallest_cell)};
    });

    // sort ascending
    enemies_distances.sort(function(a, b) { return a.distance - b.distance; });

    var closest = enemies_distances[0].enemy;

    return closest;
}



function anyone_around(oMelhor, otosLazarentos) {
    
    // shit, nothing to eat :(  -> copiei mesmo
    if (otosLazarentos.length === 0) {
        return null;
    }
    
    /*
    //console.log("eu");
    //console.log(oMelhor);
    //console.log("otos");
    //console.log(otosLazarentos.length);
    //console.log(otosLazarentos);

    //console.log( "Brigar com Mocelin porque nao esta funfando nada aqui." );
    */
    
    /* 
        Causo: SuicideRobot e HunterRobot nasceram no mesmo lugar. 
                Os dois, com mesma massa, se perseguiram no mesmo lugar. 
                Nenhum teve sucesso. 
    */
    
    
    var go_direction = 'UP';
    var target = {x: 0, y: 0};
    var limit = 250;

    var l_lower = -50;
    var l_higher = 50;


    laza = get_closest_enemy(oMelhor, otosLazarentos);

    var hue_position = {x: 0, y:0};
    hue_position.x = (oMelhor.x - laza.x);
    hue_position.y = (oMelhor.y - laza.y);
    ////console.log(oMelhor.x, oMelhor.y, otosLazarentos[0].x, otosLazarentos[0].y,  hue_position);

    if ( hue_position.y < limit || hue_position.x < limit ) {

        // set direction based on current position, borders and enemies
        if (oMelhor.x < limit && oMelhor.y > limit) { // ajustar
            go_direction = 'UP';
        } else if (oMelhor.y < limit && dims.width - oMelhor.x > limit) {
            go_direction = 'RIGHT';
        } else if (dims.width - oMelhor.x < limit && dims.height - oMelhor.y > limit) {
            go_direction = 'DOWN';
        } else if (dims.height - oMelhor.y < limit) {
            go_direction = 'LEFT';
        } else if ( hue_position.y > 0 && hue_position.x > l_lower && hue_position.x < l_higher) {
            go_direction = 'UP';
        } else if ( hue_position.y > 0 && hue_position.x < l_lower && hue_position.x < l_higher) {
            go_direction = 'DEUP';
        } else if ( hue_position.y > 0 && hue_position.x > l_lower && hue_position.x > l_higher) {
            go_direction = 'DDUP';
        }  else if ( hue_position.x > 0 && hue_position.y > l_lower && hue_position.y < l_higher) {
            go_direction = 'RIGHT';
        } else if ( hue_position.x > 0 && hue_position.y < l_lower && hue_position.y < l_higher) {
            go_direction = 'DERIGHT';
        } else if ( hue_position.x > 0 && hue_position.y > l_lower && hue_position.y > l_higher) {  
            go_direction = 'DDRIGHT';
        }  else if ( hue_position.y < 0 && hue_position.x > l_lower && hue_position.x < l_higher) {
            go_direction = 'DOWN';
        } else if ( hue_position.y < 0 && hue_position.x < l_lower && hue_position.x < l_higher) {
            go_direction = 'DEDOWN';
        } else if ( hue_position.y < 0 && hue_position.x > l_lower && hue_position.x > l_higher) {
            go_direction = 'DDDOWN';
        }  else if ( hue_position.x < 0 && hue_position.y > l_lower && hue_position.y < l_higher) {
            go_direction = 'LEFT';
        } else if ( hue_position.x < 0 && hue_position.y < l_lower && hue_position.y < l_higher) {
            go_direction = 'DELEFT';
        } else if ( hue_position.x < 0 && hue_position.y > l_lower && hue_position.y > l_higher) {
            go_direction = 'DDLEFT';
        }
        //}
        
    }
    
    // go full speed towards the chosen direction
    switch (go_direction) {
        case 'UP':
            target.y = -FULL_SPEED;
            break;
        case 'DEUP':
            target.y = -FULL_SPEED;
            target.x = -FULL_SPEED;
            break;
        case 'DDUP':
            target.y = -FULL_SPEED;
            target.x = FULL_SPEED;
            break;
        case 'DOWN':
            target.y = FULL_SPEED;
            break;
        case 'DEDOWN':
            target.y = FULL_SPEED;
            target.x = -FULL_SPEED;
            break;
        case 'DDDOWN':
            target.y = FULL_SPEED;
            target.x = FULL_SPEED;
            break;
        case 'RIGHT':
            target.x = FULL_SPEED;
            break;
        case 'DERIGHT':
            target.x = FULL_SPEED;
            target.y = -FULL_SPEED;
            break;
        case 'DDRIGHT':
            target.x = FULL_SPEED;
            target.y = FULL_SPEED;
            break;
        case 'LEFT':
            target.x = -FULL_SPEED;
            break;
        case 'DELEFT':
            target.x = FULL_SPEED;
            target.y = -FULL_SPEED;
            break;
        case 'DDLEFT':
            target.x = FULL_SPEED;
            target.y = FULL_SPEED;
            break;
    }

    return target;
    
}


function run_forest_run( lazaTaAqui ) {
    
    var target_position = {x: 0, y:0};
    // go and get it, tiger!
    // vSourceToDestination = vDestination - vSource;
    // multiplication makes sure we are going as fast as possible.
    
    // Mas para o outro lado.
    target_position.x = (target_food.x - lazaTaAqui.x) * 50;
    target_position.y = (target_food.y - lazaTaAqui.y) * 50;
    return target_position;
    
}

