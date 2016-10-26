

var FULL_SPEED = 500;
var target_food;
var dims;
var split = false;
var i = 0;
var minMass;
var estavaDesviando = false;
var lastpos = {x : 0, y: 0};
var target_position = {x: 0, y:0};
var paraIr = {x: 0, y:0};
var viuVirus = false;
var m;
var y1;
var tentandoSair = 0;
var posicaoAntiga = {x: 0, y: 0};
var continuando = false;
var travar = 0;

module.exports = {
	// The robots name
name: 'Mesjk',

      // This function is called just once and it provides the board size
      game_setup: function(data) {
	      // example of data: { gameWidth: 1920, gameHeight: 1080 }
	      dims = { width: data.gameWidth, height: data.gameHeight };
	      minMass = data.maxMass;
      },

      // MANDATORY FUNCTION
      // this function is called approximately 60 times per second. It better be
      // fast, or you will loose some moves.
step: function(playerData, userData, foodsList, massList, virusList) {
	      if (i > 0) {
		      i--;
		      return;
	      }
	      if(travar>0){
		      travar--;
		      continuando=false;
		      return posicaoAntiga;

	      }
	      if (split){
		      i=20;
		      split=false;
		      return "split";
	      }




	      var closest_food;        


	      var biggest_cell;// get biggest cell
	      if (playerData !== undefined){
		      biggest_cell = get_biggest_cell(playerData.cells);

		      if (biggest_cell.mass < minMass) {
			      minMass = biggest_cell.mass;
		      }
		      var nearestEnemy = get_closest_enemy(biggest_cell, userData);

		      if (nearestEnemy !== null ) {
			      if (nearestEnemy.massTotal > minMass) {
				      if (get_biggest_cell(nearestEnemy.cells).mass  > biggest_cell.mass +  (biggest_cell.mass * 0.1)) {
					      target_position.x = (nearestEnemy.x - biggest_cell.x) * -50;
					      target_position.y = (nearestEnemy.y - biggest_cell.y) * -50;
					      lastpos.x = target_position.x;
					      lastpos.y = target_position.y;
					      return target_position;
				      } else
					      if (get_biggest_cell(nearestEnemy.cells).mass + (get_biggest_cell(nearestEnemy.cells).mass * 0.1)  < biggest_cell.mass) {
						      target_position.x = (nearestEnemy.x - biggest_cell.x) * 50;
						      target_position.y = (nearestEnemy.y - biggest_cell.y) * 50;
						      //console.log(playerData.cells.length );
						      if (get_biggest_cell(nearestEnemy.cells).mass + (get_biggest_cell(nearestEnemy.cells).mass * 0.1)  < (biggest_cell.mass / 2) && playerData.cells.length < 2) {
							      split = true;
						      }
						      lastpos.x = target_position.x;
						      lastpos.y = target_position.y;
						      return target_position;

					      }
			      }

		      }    
		      if (virusList.length > 0) {
			      if(continuando){
				      travar = 60;							
				      return posicaoAntiga;

			      }
			      var xv = virusList[0].x - biggest_cell.x;
			      var yv = virusList[0].y - biggest_cell.y;
			      var desaceleracao = 80;
			      if(virusList[0].mass < biggest_cell.mass){
				      var dEuVirus = Math.sqrt((biggest_cell.x-virusList[0].x)*(biggest_cell.x-virusList[0].x) + (biggest_cell.y-virusList[0].y)*(biggest_cell.y-virusList[0].y));
				      var dDirecaoVirus = (Math.abs((target_position.y*xv)-(target_position.x*yv))) / Math.sqrt((target_position.x*target_position.x)+(target_position.y*target_position.y));
				      if(dDirecaoVirus < biggest_cell.radius + virusList[0].radius){

					      if(xv >= biggest_cell.radius && yv <= -biggest_cell.radius){//1º quadrante
						      //console.log("1º quad - ",xv, ">>",yv);
						      target_position.y = FULL_SPEED/desaceleracao;
						      target_position.x = -FULL_SPEED;

					      }else{
						      if(xv >= biggest_cell.radius && yv < biggest_cell.radius && yv > -biggest_cell.radius){
							      //Do lado direito
							      //console.log("Lado direito",xv, ">>",yv);
							      target_position.y = FULL_SPEED;
							      target_position.x = FULL_SPEED/desaceleracao;

						      }else{
							      if(xv >= biggest_cell.radius && yv >= biggest_cell.radius){
								      //4ºquadrante embaixo
								      //console.log("4º quad",xv, ">>",yv);
								      target_position.y = -FULL_SPEED/desaceleracao;
								      target_position.x = FULL_SPEED;

							      }else{
								      if(xv> - biggest_cell.radius && xv < biggest_cell.radius && yv>biggest_cell.radius){
									      //Em baixo
									      //console.log("Embaixo",xv, ">>",yv);
									      target_position.y = -FULL_SPEED/desaceleracao;
									      target_position.x = -FULL_SPEED;

								      }else{
									      if(xv> - biggest_cell.radius && xv < biggest_cell.radius && yv<-biggest_cell.radius){
										      //Em cima
										      //console.log("Em cima",xv, ">>",yv);
										      target_position.y = FULL_SPEED/desaceleracao;
										      target_position.x = -FULL_SPEED;

									      }else{
										      if(xv <= biggest_cell.radius && yv <= -biggest_cell.radius){//2º quadrante
											      //console.log("2º quad",xv, ">>",yv);
											      target_position.y = -FULL_SPEED/desaceleracao;
											      target_position.x = -FULL_SPEED;

										      }else{
											      if(xv <= biggest_cell.radius && yv < biggest_cell.radius && yv > -biggest_cell.radius){
												      //Do lado esquerdo
												      //console.log("Lado esquerdo",xv, ">>",yv);
												      target_position.y = FULL_SPEED;
												      target_position.x = -FULL_SPEED/desaceleracao;

											      }else{
												      if(xv <= biggest_cell.radius && yv >= biggest_cell.radius){
													      //3ºquadrante embaixo
													      //console.log("3º quad",xv, ">>",yv);
													      target_position.y = -FULL_SPEED/desaceleracao;
													      target_position.x = -FULL_SPEED;

												      }
											      }

										      }
									      }
								      }

							      }
						      }
					      }   
					      continuando = true;
					      posicaoAntiga = target_position;
					      return target_position;
				      }else{
					      tentandoSair = 0;

				      }
			      }
		      }
		      continuando = 0;

		      ////console.log(nearestEnemy);

		      // get a new target food if we don't have a target or it has been eaten already
		      if (!target_food || was_eaten(target_food, foodsList)) {
			      target_food = get_closest_food(biggest_cell, foodsList);
		      }

		      // there might not be any visible food
		      if (!target_food) {        
			      // if no food is visible nearby, just walk around
			      target_position = wanderer(biggest_cell);
			      lastpos.x = target_position.x;
			      lastpos.y = target_position.y;
			      return target_position;
		      } else {
			      // go and get it, tiger!
			      // vSourceToDestination = vDestination - vSource;
			      // multiplication makes sure we are going as fast as possible.
			      target_position.x = (target_food.x - biggest_cell.x) * 50;
			      target_position.y = (target_food.y - biggest_cell.y) * 50;
			      lastpos.x = target_position.x;
			      lastpos.y = target_position.y;
			      return target_position;
		      }
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
	target_position = target;
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

function get_closest_enemy(origin, enemies) {
	if (enemies.length === 0) {
		return null;
	}

	// get the distance to all food cells
	var enemy_distances = enemies.filter(function(enemy) {
			if (enemy.mass == minMass) {
			return false; // skip
			}
			return true;
			}).map(function(enemy, idx) {
				return {'enemy': enemy, 'distance': calc_distance(origin, enemy)};
				});

	// sort descending
	enemy_distances.sort(function(a, b) { return a.distance - b.distance; });

	closest = enemy_distances[0].enemy;

	return closest;
}

// return the more massive cell
function get_biggest_cell(userData) {
	// sort descending
	userData.sort(function(a, b) { return b.mass - a.mass; });
	return userData[0];
}

// calculate the distance between two points
function calc_distance(a, b) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
