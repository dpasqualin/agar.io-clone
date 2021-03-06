// this is an example robot. It always goes for the closest food. It doesn't
// care for mass, viruses or opponents. Thug life.

var FULL_SPEED = 500;
var target_food;
var dims;

module.exports = {
    // The robots name
    name: 'ExampleRobot',

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

    closest = food_distances[0].food;

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
