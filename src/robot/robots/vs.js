var FULL_SPEED = 500;
var target_food;
var dims;
var matando = false;
var cont = 0;
var timer = 0;

module.exports = {
    name: 'VS',
    game_setup: function(data) {
        dims = { width: data.gameWidth, height: data.gameHeight };
    },

    step: function(playerData, userData, foodsList, massList, virusList) {
        var target_position = {x: 0, y:0};
        var closest_food;

        var biggest_cell = get_my_biggest_cell(playerData.cells);
        var smallest = smallest_cell(playerData.cells);
        var inimigo = get_closest_enemy(biggest_cell, userData);
        var objetivo = biggest_cell;

        cont++;

        if (!target_food || was_eaten(target_food, foodsList)) {
            target_food = get_closest_food(biggest_cell, foodsList);
            objetivo = target_food;
        }


        if (!target_food) {
            target_position = wanderer(biggest_cell);
        } else {
            target_position.x = (target_food.x - biggest_cell.x) * 50;
            target_position.y = (target_food.y - biggest_cell.y) * 50;
        }

        if(inimigo){
          inimigo = smallest_cell(inimigo.cells);
          if((((smallest.mass) <= (inimigo.mass*0.9)) || (smallest.mass*1.1) <= (inimigo.mass))&&(calc_distance(smallest,inimigo)<160))
          {
            target_position.x = (smallest.x - inimigo.x) * 50;
            target_position.y = (smallest.y - inimigo.y) * 50;
            objetivo = inimigo;
            return virusCaminho(virusList, playerData, target_position, objetivo);
          }
          if((inimigo.mass*1.1) <= (biggest_cell.mass)){
            target_position.x = (inimigo.x - biggest_cell.x) * 50;
            target_position.y = (inimigo.y - biggest_cell.y) * 50;
            objetivo = inimigo;
          }
          if((inimigo.mass*1.1) <= (biggest_cell.mass/2)){
            target_position.x = (inimigo.x - biggest_cell.x) * 50;
            target_position.y = (inimigo.y - biggest_cell.y) * 50;
            objetivo = inimigo;
            if(matando&&(cont > 30)&&(timer>6) && (playerData.cells.length < 4)){
              cont = 0;
              timer = 0;
              matando = false;
              return "split";
            }
            timer++;
            matando = true;
          }
        }
        return virusCaminho(virusList, playerData, target_position, objetivo);
    },

};

function virusCaminho(virusList, playerData, target, objetivo){
  if(virusList.length === 0){
    return target;
  }

  player = get_my_biggest_cell(playerData.cells);
  var virusRatio = virusList.map(function(vir, idx) {
      return {'Virus': vir, 'mass': vir.mass, 'x': vir.x, 'y': vir.y, 'ratio': ((vir.x - player.x)/(vir.y - player.y))};
  });

  if(!objetivo){
    objetivo = target;
  }
  for (var i = 0; i < virusRatio.length; i++){
    ratio = target.x/target.y;
    if(virusRatio[i].mass <= player.mass){
      //console.log("+++");
      //console.log("Ratio:" + ratio + "  VirusRatio:"+virusRatio[i].ratio);
      if(calc_distance(player, virusRatio[i]) >= calc_distance(player, objetivo)){
        //console.log(">>>");
        //console.log(target);
        if((((virusRatio[i].x/target.x)-(virusRatio[i].y/target.y))/Math.sqrt((1/target.x)*(1/target.x)+(1/target.y)*(1/target.y))) < player.radius){
          target.x = target.x*(-1);
          if((((virusRatio[i].x/target.x)-(virusRatio[i].y/target.y))/Math.sqrt((1/target.x)*(1/target.x)+(1/target.y)*(1/target.y))) < player.radius){
            target.x = target.x*(-1);
            target.y = target.y*(-1);
          }
          //console.log("$$$" + target);
          return target;
        }
      }
    }
  }
  return target;
}

function get_closest_enemy(origin, userData) {
    if (userData.length === 0) {
        return null;
    }
    var enemy_distances = userData.map(function(enemy, idx) {
        return {'Enemy': enemy, 'Distance': calc_distance(origin, enemy)};
    });
    enemy_distances.sort(function(a, b) { return a.distance - b.distance; });
    var closest = enemy_distances[0].Enemy;
    return closest;
}

function get_smallest_enemy(origin, userData) {
    if (userData.length === 0) {
        return null;
    }
    var enemy_distances = userData.map(function(enemy, idx) {
        return {'Enemy': enemy, 'Size': smallest_cell(enemy.cells)};
    });
    enemy_distances.sort(function(a, b) { return a.Size - b.Size; });
    closest = enemy_distances[0].Enemy;
    return closest;
}

function get_biggest_enemy(origin, userData) {
    if (userData.length === 0) {
        return null;
    }
    var enemy_distances = userData.map(function(enemy, idx) {
        return {'Enemy': enemy, 'Size': get_my_biggest_cell(enemy.cells)};
    });
    enemy_distances.sort(function(a, b) { return b.Size - a.Size; });
    closest = enemy_distances[0].Enemy;
    return closest;
}

function wanderer(my_position) {
    var wanderer_direction = 'UP';
    var target = {x: 0, y: 0};
    var limit = 250;
    if (my_position.x < limit && my_position.y > limit) {
        wanderer_direction = 'UP';
    } else if (my_position.y < limit && dims.width - my_position.x > limit) {
        wanderer_direction = 'RIGHT';
    } else if (dims.width - my_position.x < limit && dims.height - my_position.y > limit) {
        wanderer_direction = 'DOWN';
    } else if (dims.height - my_position.y < limit) {
        wanderer_direction = 'LEFT';
    }

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

function was_eaten(food, foodsList) {
    var exist = foodsList.filter(function(e) {
        return food.id === e.id;
    });
    return exist.length === 0;
}

function get_closest_food(origin, foodsList) {
    if (foodsList.length === 0) {
        return null;
    }
    var food_distances = foodsList.map(function(food, idx) {
        return {'food': food, 'distance': calc_distance(origin, food)};
    });
    food_distances.sort(function(a, b) { return a.distance - b.distance; });
    closest = food_distances[0].food;
    return closest;
}

function get_my_biggest_cell(userData) {
    userData.sort(function(a, b) { return b.mass - a.mass; });
    return userData[0];
}

function smallest_cell(userData) {
    userData.sort(function(a, b) { return a.mass - b.mass; });
    return userData[0];
}

function calc_distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
