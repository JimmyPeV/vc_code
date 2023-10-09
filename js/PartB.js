

let partBState = {
    preload: loadAssets,
    create: initialiseGame,
    update: gameUpdate
};


let threads_inclined;
let thread_changer;

let thread_inclined_array_ini = [];
let thread_inclined_array_fin = [];
let puntuajeB;
const LEVEL_HEALTH_SPAWN_PROB = [0.3, 0.2, 0.1];
const LEVEL_ENEMY_SPAWN_PROB_B = [0.5, 0.75, 1];
const LEVEL_ENEMY_VELOCITY_B = [100, 150, 200];
const SCORE_TO_NEXT_LEVEL_B = 100;
const MAX_SCORE_B = 350;

function loadAssets() {
    game.load.image('sky', 'assets/sky1.png');
    game.load.image('ground', 'assets/ground.png');
    game.load.image('thread', 'assets/string.png');
    game.load.image('purple', 'assets/trajectory_changer.png');
    game.load.spritesheet('character', 'assets/spriteSheet.png', 198.5, 211);


    game.load.image('disparo', 'assets/ammo.png');
    game.load.image('asteroid', 'assets/enemy1.png');
    game.load.image("heart", "assets/heart.png");
}



function initialiseGame() {

    game.add.sprite(0, 0, 'sky');

    level=1;
    puntuajeB=0;
    platform = game.add.group();
    platform.enableBody = true;

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    let ground = platform.create(0, game.world.height - 32, 'ground');
    ground.body.immovable = true;

    heartLives = game.add.group();
    heartLives.enableBody = true;
    heartLives.createMultiple(HEART_GROUP_SIZE,'heart');
    heartLives.forEach(function(lives){
        lives.scale.setTo(0.02, 0.02);
        lives.anchor.setTo(0.10, 0.5);    
    });
    heartLives.setAll('outOfBoundsKill', true);
    heartLives.setAll('checkWorldBounds', true);

    threads = game.add.group();
    threads.enableBody = true;
    thread_creator(n_webs);

    
    thread_changer_init = game.add.group();
    thread_changer_init.enableBody = true;
    thread_changer_end = game.add.group();
    thread_changer_end.enableBody = true;

    thread_creator_V2(true);
    characterIndex = 0;

    character = game.add.sprite(thread_pos_array[characterIndex] - 50, game.world.height - 101, 'character');
    character.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(character);
    character.animations.add('idle', [0, 1], 2.5, true);

    tiempoTexto = this.add.text(3, 10, "00:00:00", { font: "20px Arial", fill: "white", stroke: "black", strokeThickness: 4 });
    textoPuntuaje = this.add.text(3, 40, "Points: 0", { font: "20px Arial", fill: "white", stroke: "black", strokeThickness: 4 });
    textoPuntuaje.setText("Points: " + puntuaje);
    textoParte = this.add.text(739, 10, "Part B", { font: "20px Arial", fill: "white", stroke: "black", strokeThickness: 4 });
    textoLevel = this.add.text(746, 40, "Lvl " + level, { font: "20px Arial", fill: "white", stroke: "black", strokeThickness: 4 });

    crearDisparos(DISPAROS_GROUP_SIZE);

    enemies = game.add.group();
    enemies.enableBody = true;
    game.time.events.loop(Phaser.Timer.SECOND * 1, spawnEnemiesB, this);


    healthBar.style.display = "block";
    health = 100;
    updateHealthBar();
}
function spawnEnemiesB() {
    if (Math.random() < LEVEL_ENEMY_SPAWN_PROB_B[level - 1]) {
        let randomIndex = Math.floor(Math.random() * (n_webs - 1));
        let EThread = thread_pos_array[randomIndex];
    

        let enemy = enemies.create(EThread, 0, 'asteroid');
        enemy.scale.setTo(0.15, 0.15);
        enemy.anchor.setTo(0.5, 0.5);

        enemy.body.velocity.y = LEVEL_ENEMY_VELOCITY_B[level - 1];
    }
}



function gameUpdate() {
    //collisions
    game.physics.arcade.overlap(enemies, disparos, enemyHitB, null, this);
    game.physics.arcade.overlap(enemies, platform, decreaseHealthBar, null, this);
    game.physics.arcade.overlap(heartLives, character, liveHit, null, this);
    game.physics.arcade.overlap(enemies, thread_changer_init, changeThread, null, this);
    character.animations.play('idle');

    if (boolmouse) {
        //movimiento con raton
        mouseX = game.input.mousePointer.x;
        let relativePos = mouseX - thread_pos_array[characterIndex] + (x_thread / 4);
        if (relativePos < 0) {
            if (characterIndex > 0) {
                characterIndex--;
                character.body.position.setTo(thread_pos_array[characterIndex] - 50, game.world.height - 101);
            }
        }
        else if (relativePos > (thread_pos_array[characterIndex + 1] - thread_pos_array[characterIndex])) {
            if (characterIndex < n_webs - 2) {
                characterIndex++;
                character.body.position.setTo(thread_pos_array[characterIndex] - 50, game.world.height - 101);

            }
        }
    }
    //movimiento con flchas
    else {
        if (cursors.left.isDown && characterIndex > 0 && freeInput == true) {
            //left movement
            characterIndex--;
            character.body.position.setTo(thread_pos_array[characterIndex] - 50, game.world.height - 101);

            freeInput = false;
            game.time.events.add(650/n_webs, inputChorno, this);
        } else if (cursors.right.isDown && characterIndex < n_webs - 2 && freeInput == true) {
            //right movement
            characterIndex++;
            character.body.position.setTo(thread_pos_array[characterIndex] - 50, game.world.height - 101);
            character.animations.play('character2');
            freeInput = false;
            game.time.events.add(650/n_webs, inputChorno, this);

        }
    }
    manageShots();
    if (gameEnd) {
        gameOver();
    }

    if(puntuajeB >= MAX_SCORE_B){
        level=1;
        chcharacterIndex = 0;
        game.state.start('partC');
    }
}


function changeThread(enemy, thread) {
    if(Math.random() < 0.5 && !enemy.isChanging){
        
        let tween = game.add.tween(enemy).to({x:thread_inclined_array_fin[thread.myValue].x ,y:thread_inclined_array_fin[thread.myValue].y },1000/(n_webs/10),Phaser.Easing.Linear.None,true); 
    }
    enemy.isChanging = true;
    
}

function enemyHitB(enemy, disparo) {
    let x = enemy.body.x+16;
    let y = enemy.body.y;

    disparo.kill();
    enemy.kill();
    puntuajeB +=10;
    sumarPuntos();
    var boomAudio = new Audio("assets/songs/boom.mp3");
    boomAudio.play();

    if (level < NUM_LEVELS && puntuajeB == level * SCORE_TO_NEXT_LEVEL_B) {
        subirLevelB();
    }
    if(Math.random()<LEVEL_HEALTH_SPAWN_PROB[level-1]){
        spawnLife(x,y);
    }
}
function spawnLifeB(x,y){
    let heart = heartLives.getFirstExists(false);
    if(heart){
        heart.reset(x,y);
        heart.body.velocity.y = LEVEL_ENEMY_VELOCITY_B[level-1];
    }
    return heart;
}

function subirLevelB() {
    level += 1
    textoLevel.setText('Lvl ' + level);
    var levelAudio = new Audio("assets/songs/levelUp.mp3");
    levelAudio.play();
    if(level ==2){
    thread_creator_V2(false);
    }
    if (level == 3){
        thread_creator_V2(true);     
    }
}


function thread_creator_V2(direction) {
    let catetoX = 800 / n_webs;
    let catetoY;
    let empty = true;
    if(direction){
        
                for (let i = 0; i < n_webs - 2; i++) {
                        let randomY = Math.floor(Math.random() * (game.world.height-250 )); //puntoY del hilo1
                        let randomY2 = Math.floor(Math.random() * (game.world.height-200)) + randomY / 10; //puntoY del hilo2
                        catetoY = randomY2 - randomY;
                        if (catetoY>1 && catetoY<100) {
                            let web_inclined_thread = game.add.graphics(0, 0);
                            web_inclined_thread.lineStyle(3, 0x800080);
                            web_inclined_thread.moveTo(thread_pos_array[i], randomY); //thread_pos_array[i] es el puntoX del hilo1
                            web_inclined_thread.lineTo(thread_pos_array[i] + catetoX, randomY2); //thread_pos_array[i] + catetoX es el puntoX del hilo2

                            let point_ini = thread_changer_init.create(thread_pos_array[i], randomY, 'purple', thread_inclined_array_fin.length);
                            point_ini.myValue = thread_inclined_array_fin.length; //generar los puntos de inicio y final de hilos (sprites)
                            point_ini.anchor.setTo(0.5);
                            point_ini.scale.setTo(0.5);
                            let point_fin = thread_changer_end.create(thread_pos_array[i] + catetoX, randomY2, 'purple');
                            point_fin.anchor.setTo(0.5);
                            point_fin.scale.setTo(0.5);
                            
                            thread_inclined_array_ini.push({x: thread_pos_array[i], y: randomY});
                            thread_inclined_array_fin.push({x: thread_pos_array[i]+ catetoX , y: randomY2 }); //guardamos el PUNTO donde TERMINAN los hilos
                        }
                        else{
                            thread_inclined_array_ini.push({x: 0, y: 0});
                            thread_inclined_array_fin.push({x: 0, y: 0});
                            
                        }
                    }
            
                            thread_inclined_array_ini.push({x: 0, y: 0});
                            thread_inclined_array_fin.push({x: 0, y: 0});
            
    }

    else if(!direction){
        
        for (let i = 1; i < n_webs - 1; i++) {
                let randomY = Math.floor(Math.random() * (400 - 40 + 1)); //puntoY del hilo1
                let randomY2 = Math.floor(Math.random() * (300 - 40 + 1)) + randomY / 6; //puntoY del hilo2
                catetoY = randomY2 - randomY;
                if (randomY < randomY2) {
                    let web_inclined_thread = game.add.graphics(0, 0);
                    web_inclined_thread.lineStyle(3, 0x800080);
                    web_inclined_thread.moveTo(thread_pos_array[i], randomY); //thread_pos_array[i] es el puntoX del hilo1
                    web_inclined_thread.lineTo(thread_pos_array[i] - catetoX, randomY2); //thread_pos_array[i] + catetoX es el puntoX del hilo2

                    let point_ini = thread_changer_init.create(thread_pos_array[i], randomY, 'purple', thread_inclined_array_ini.length);
                    point_ini.myValue = thread_inclined_array_ini.length; //generar los puntos de inicio y final de hilos (sprites)
                    point_ini.anchor.setTo(0.5);
                    point_ini.scale.setTo(0.5);
                    let point_fin = thread_changer_end.create(thread_pos_array[i] - catetoX, randomY2, 'purple');
                    point_fin.anchor.setTo(0.5);
                    point_fin.scale.setTo(0.5);
                    
                    thread_inclined_array_ini.push({x: thread_pos_array[i], y: randomY});
                    thread_inclined_array_fin.push({x: thread_pos_array[i] - catetoX , y: randomY2 }); //guardamos el PUNTO donde TERMINAN los hilos
                }
                else{
                    thread_inclined_array_ini.push({x: 0, y: 0});
                    thread_inclined_array_fin.push({x: 0  , y: 0 });
                }
            }
    }

if(thread_changer_init.countLiving() === 0){
    thread_inclined_array_ini= [];
    thread_inclined_array_fin= [];
   return thread_creator_V2(true);
}
    
}


