
let game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

let partAState = {
    preload: loadAssetsA,
    create: initialiseGameA,
    update: gameUpdateA
};

let platform;
let threads;
let x_thread = 800 / n_webs;

let thread_pos_array;
let character;
let characterIndex;
let freeInput = true;
let gameEnd = false;
let cursors;
let mouseX;

const DISPAROS_GROUP_SIZE = 10;
let disparos;
const VELOCIDAD_DISPARO = 200;
let fireButton;

let enemies;
let EThread;

const NUM_LEVELS = 3;
const LEVEL_ENEMY_SPAWN_PROB = [0.5, 0.75, 1];
const LEVEL_ENEMY_VELOCITY = [200, 250, 300];
const SCORE_TO_NEXT_LEVEL = 100;
const MAX_SCORE_A =350;

const HEART_GROUP_SIZE = 3;
let heartLives;
let level;
let tiempoTexto;
let tiempoTranscurrido = 0;
let puntuaje = 0;
let healthBar = document.getElementById("healthBar");
let health = 100;
let textoParte;
let textoLevel;

let victoria = false;

let crono = setInterval(actualizarCronometro, 1000);

game.state.add('menu', startState);
game.state.add('game', partAState);
game.state.add('partB', partBState);
game.state.add('partC', partCState);
game.state.add('final', finalState);

game.state.start('menu');

function loadAssetsA() {
    game.load.image('sky', 'assets/sky1.png');
    game.load.image('ground', 'assets/ground.png');
    game.load.image('thread', 'assets/string.png');
    game.load.image('purple', 'assets/trajectory_changer.png');
    game.load.spritesheet('character', 'assets/spriteSheet.png', 198.5, 211);


    game.load.image('disparo', 'assets/ammo.png');
    game.load.image('asteroid', 'assets/enemy1.png');
    game.load.image("heart", "assets/heart.png");
}



function initialiseGameA() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.add.sprite(0, 0, 'sky');

    platform = game.add.group();
    platform.enableBody = true;

    level=1;
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    let ground = platform.create(0, game.world.height - 32, 'ground');
    ground.body.immovable = true;

    threads = game.add.group();
    threads.enableBody = true;
    thread_creator(n_webs);

    
    characterIndex = 0;

    character = game.add.sprite(thread_pos_array[characterIndex] - 50, game.world.height - 101, 'character');
    character.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(character);
    character.animations.add('idle', [0, 1], 2.5, true);

    tiempoTexto = this.add.text(3, 10, "00:00:00", { font: "20px Arial", fill: "white", stroke: "black", strokeThickness: 4 });
    textoPuntuaje = this.add.text(3, 40, "Points: 0", { font: "20px Arial", fill: "white", stroke: "black", strokeThickness: 4 });
    textoParte = this.add.text(739, 10, "Part A", { font: "20px Arial", fill: "white", stroke: "black", strokeThickness: 4 });
    textoLevel = this.add.text(746, 40, "Lvl " + level, { font: "20px Arial", fill: "white", stroke: "black", strokeThickness: 4 });

    crearDisparos(DISPAROS_GROUP_SIZE);

    enemies = game.add.group();
    enemies.enableBody = true;
    game.time.events.loop(Phaser.Timer.SECOND * 1, spawnEnemies, this);

    heartLives = game.add.group();
    heartLives.enableBody = true;
    heartLives.createMultiple(HEART_GROUP_SIZE,'heart');
    heartLives.forEach(function(lives){
        lives.scale.setTo(0.02, 0.02);
        lives.anchor.setTo(0.10, 0.5);    
    });
    heartLives.setAll('outOfBoundsKill', true);
    heartLives.setAll('checkWorldBounds', true);

    healthBar.style.display = "block";
    health = 100;
    puntuaje = 0;
    updateHealthBar();
    tiempoTranscurrido = 0;
}
function spawnEnemies() {
    if (Math.random() < LEVEL_ENEMY_SPAWN_PROB[level - 1]) {
        let randomIndex = Math.floor(Math.random() * (n_webs - 1));
        let EThread = thread_pos_array[randomIndex];
    

        let enemy = enemies.create(EThread, 0, 'asteroid');
        enemy.scale.setTo(0.15, 0.15);
        enemy.anchor.setTo(0.5, 0.5);
        //enemy.isChanging = false;

        enemy.body.velocity.y = LEVEL_ENEMY_VELOCITY[level - 1];
    }
}


function crearDisparos(num) {
    disparos = game.add.group();
    disparos.enableBody = true;
    disparos.createMultiple(num, 'disparo');
    disparos.forEach(function (disparo) {
        disparo.scale.setTo(0.3, 0.25);
    });


    disparos.setAll('outOfBoundsKill', true);
    disparos.setAll('checkWorldBounds', true);
}

function resetMember(item) {
    item.kill();
}

function actualizarCronometro() {
    tiempoTranscurrido++;
    var horas = Math.floor(tiempoTranscurrido / 3600);
    var minutos = Math.floor((tiempoTranscurrido - (horas * 3600)) / 60);
    var segundos = Math.floor(tiempoTranscurrido - (horas * 3600) - (minutos * 60));
    var tiempoTextoFormateado = horas.toString().padStart(2, "0") + ":" + minutos.toString().padStart(2, "0") + ":" + segundos.toString().padStart(2, "0");
    tiempoTexto.setText(tiempoTextoFormateado);
}


function updateHealthBar() {
    healthBar.querySelector('.bar').style.width = health + '%';

}
function decreaseHealthBar(enemy) {
    enemy.kill();
    health -= 20;
    var damageAudio = new Audio("assets/songs/damage.mp3");
    var failAudio = new Audio("assets/songs/Fail.mp3");
    if (health <= 0) {
        damageAudio.play();
        updateHealthBar();
        gameEnd = true;
    }
    else {
        damageAudio.play();
        updateHealthBar();
    }

}


function gameUpdateA() {
    //collisions
    game.physics.arcade.overlap(enemies, disparos, enemyHit, null, this);
    game.physics.arcade.overlap(enemies, platform, decreaseHealthBar, null, this);
    game.physics.arcade.overlap(heartLives, character, liveHit, null, this);
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
    if(puntuaje == MAX_SCORE_A){
        level =1;
        characterIndex = 0;
        game.state.start('partB');
    }
}

function enemyHit(enemy, disparo) {
    
    let x = enemy.body.x+16;
    let y = enemy.body.y;
    
    disparo.kill();
    enemy.kill();
    sumarPuntos();
    var boomAudio = new Audio("assets/songs/boom.mp3");
    boomAudio.play();

    if (level < NUM_LEVELS && puntuaje == level * SCORE_TO_NEXT_LEVEL) {
        subirLevel();
    }
    if(Math.random()<0.1){
            spawnLife(x,y);
        }
}

function spawnLife(x,y){
    let heart = heartLives.getFirstExists(false);
    if(heart){
        heart.reset(x,y);
        heart.body.velocity.y = LEVEL_ENEMY_VELOCITY[level-1];
    }
    return heart;
}

function liveHit(lives, character) {
    character.kill();
    health = 100;
    updateHealthBar();
    var liveAudio = new Audio("assets/songs/Health.mp3");
    liveAudio.play();

}

function manageShots() {
    if (fireButton.justDown && !boolmouse) {
        fireShot();
    }

    else if (game.input.mousePointer.leftButton.justPressed(30) && boolmouse) {
        fireShot();
    }
}

function fireShot() {
    let shotX = character.x + 3 + character.width / 4;
    let shotY = character.y + -40;
    let shotVel = -VELOCIDAD_DISPARO;
    let shot = kaboom(shotX, shotY, shotVel);
    var shootAudio = new Audio("assets/songs/Shoot.mp3");
    shootAudio.play();
}

function kaboom(x, y, vel) {
    let shot = disparos.getFirstExists(false);
    if (shot) {
        shot.reset(x, y);
        shot.body.velocity.y = vel;
    }
    return shot;
}

function inputChorno() {
    freeInput = true;
}

//Alberto
function sumarPuntos() {
    puntuaje += 10;
    textoPuntuaje.setText("Points: " + puntuaje);
    
}

function subirLevel() {
    level += 1
    textoLevel.setText('Lvl ' + level);
    var levelAudio = new Audio("assets/songs/levelUp.mp3");
    levelAudio.play();
    
}



function thread_creator(n_webs) {
    let thread_pos = game.world.width / n_webs;
    thread_pos_array = [thread_pos];

    for (let i = 1; i < n_webs; i++) {
        let web_thread = threads.create(thread_pos, 0, 'thread');
        web_thread.anchor.setTo(0.5, 0);
        web_thread.body.immovable = true;

        thread_pos = thread_pos + (game.world.width / n_webs);
        thread_pos_array.push(thread_pos);
    }
}

function gameOver() {
    game.state.start('final');
}