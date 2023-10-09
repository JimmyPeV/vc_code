

let finalState = {
    preload:preloadAssets,
    create:initializeGame,
    update:updateFinal
};
//let fondo;
let survivedTime;
let survivedPoints;
let victory;

let leaderboard = [];
let leaderboardPoints = [];

function preloadAssets() {
    game.load.image('background', 'assets/fondo3.jpg')
    game.load.image('panel', 'assets/ui/red_panel.png');
    game.load.image('smallpanel', 'assets/ui/red_button11.png');
    game.load.image('barrasHorizontal', 'assets/ui/barsHorizontal.png');
    game.load.image('boton1', 'assets/ui/button1.png');
    game.load.image('boton2', 'assets/ui/button2.png');
    game.load.image('boton3', 'assets/ui/button3.png');
    game.load.image('leader', 'assets/ui/leaderboardsComplex.png')
    game.load.image('trofeo', 'assets/ui/trophy.png');

    //Music in the background thanks to ---
    //Tittle: --- - ---
    //game.load.audio('music', ['assets/music/platformer.mp3']);
}

function initializeGame() {
    healthBar.style.display = 'none';

    fondo = game.add.tileSprite(0, 0, 1920, 962, 'background');
    fondo.z=-10;
    fondo.scale.setTo(0.6231);

    var panel = game.add.sprite(game.world.width/2 + 80, game.world.height/2, 'panel');
    panel.anchor.setTo(0.5);
    panel.scale.setTo(4, 4);

    var barrasH = game.add.sprite(125, game.world.height/2, 'barrasHorizontal');
    barrasH.anchor.setTo(0.5);
    barrasH.scale.setTo(3);

    var leaderB = game.add.sprite(game.world.width/2 - 100, 120, 'leader');

    var pos1 = game.add.sprite(game.world.width/2 - 50, 275, 'boton1');
    pos1.anchor.setTo(0.5);
    pos1.scale.setTo(0.8);
    var pos2 = game.add.sprite(game.world.width/2 - 50, 350, 'boton2');
    pos2.anchor.setTo(0.5);
    pos2.scale.setTo(0.8);
    var pos3 = game.add.sprite(game.world.width/2 - 50, 425, 'boton3');
    pos3.anchor.setTo(0.5);
    pos3.scale.setTo(0.8);

    var panelButton = game.add.sprite(135, 222, 'smallpanel');
    panelButton.anchor.setTo(0.5);
    panelButton.scale.setTo(1.05, 0.8);

    var panelButton2 = game.add.sprite(135, game.world.height/2 - 5, 'smallpanel');
    panelButton2.anchor.setTo(0.5);
    panelButton2.scale.setTo(1.05, 0.8);
    panelButton2.inputEnabled = true;
    panelButton2.events.onInputDown.add(showCredits, this);

    var panelButton3 = game.add.sprite(135, game.world.height/2 + 65, 'smallpanel');
    panelButton3.anchor.setTo(0.5);
    panelButton3.scale.setTo(1.05, 0.8);
    panelButton3.inputEnabled = true;
    panelButton3.events.onInputDown.add(backToMenu, this);

    var enterText = game.add.text(135, 220, 'Press ENTER to restart',
        {font: '16px Fantasy',
        fill: '#000000',
        align: 'center'});
    enterText.anchor.setTo(0.5);
    enterText.scale.setTo(1, 1);

    var creditsText = game.add.text(135, game.world.height/2 - 5, 'Credits',
        {font: '16px Fantasy',
        fill: '#000000',
        align: 'center'});
    creditsText.anchor.setTo(0.5);
    creditsText.scale.setTo(1, 1);

    var exitText = game.add.text(135, game.world.height/2 + 65, 'Exit',
        {font: '16px Fantasy',
        fill: '#000000',
        align: 'center'});
    exitText.anchor.setTo(0.5);
    exitText.scale.setTo(1, 1);

    survivedTime = game.add.text(game.world.width/2 + 70, 180, 'Final Time',
    {font: '16px Fantasy',
        fill: '#FFFFFF',
        backgroundColor: '#e86a17',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'});
    survivedTime.anchor.setTo(0.5);

    survivedPoints = game.add.text(game.world.width/2 + 190, 180, 'Final Points',
    {font: '16px Fantasy',
        fill: '#FFFFFF',
        backgroundColor: '#e86a17',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'});
    survivedPoints.anchor.setTo(0.5);

    //mostrarLeaderboard();
    game.time.events.add(Phaser.Timer.SECOND * 20, function() {game.state.start('menu');});

    if(victoria == true){
        var victorioso = 'You Win!';
        console.log('deberia ganar');
    }
    else { var victorioso = 'You Lost!';
            console.log('deberia perder')}

    victory = game.add.text(game.world.width/2, 30, victorioso,
    {font: '64px Fantasy',
        fill: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'});
    victory.anchor.setTo(0.5);
    
    actualizarLeaderboard(tiempoTexto.text);
    actualizarLeaderboardPoints(puntuaje);
    captureEnterKey();
}

function updateFinal(){
    fondo.tilePosition.x -=1;
}

function actualizarLeaderboard(tiempo){
    if (leaderboard.length == 0) {
        leaderboard.push(tiempo);
    } 
    else {
        for (let i = 0; i < leaderboard.length; i++) {
            if (tiempo > leaderboard[i]) {
                leaderboard.splice(i, 0, tiempo);
                break;}
        }
        if (leaderboard.length > 3) {
            leaderboard.pop(); // Limitar el leaderboard a los primeros tres tiempos
        }
    }
}

function actualizarLeaderboardPoints(puntos){
    if (leaderboardPoints.length == 0) {
        leaderboardPoints.push(puntos);
    } 
    else {
        for (let i = 0; i < leaderboardPoints.length; i++) {
            if (puntos >= leaderboardPoints[i]) {
                leaderboardPoints.splice(i, 0, puntos);
                break;}
        }
        if (leaderboardPoints.length > 3) {
            leaderboardPoints.pop(); // Limitar el leaderboard a los primeros tres puntuajes
        }
    }
    mostrarLeaderboard();
}

function mostrarLeaderboard(){
    for (let i = leaderboard.length - 1; i >= 0; i--) {
        let time = game.add.text(game.world.width/2 + 70, 275 + i * 75, leaderboard[i], {
            font: '16px Fantasy',
            fill: '#000000',
            align: 'center'});
        time.anchor.setTo(0.5);
    }
    for (let i = leaderboardPoints.length - 1; i >= 0; i--) {
        let time = game.add.text(game.world.width/2 + 190, 275 + i * 75, leaderboardPoints[i], {
            font: '16px Fantasy',
            fill: '#000000',
            align: 'center'});
        time.anchor.setTo(0.5);
    }
}

function captureEnterKey() {
    let enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    enterKey.onDown.add(function() {
        game.state.start('game');
    }, this);
}

function showCredits(){
    console.log('muestra creditos');
    var creditsText1, creditsText2, creditsText3;

    creditsText1 = game.add.text(game.world.width/2, game.world.height/2, 'Pau Martinez Fortuny',
        {font: '32px Fantasy',
        fill: '#FFFFFF',
        backgroundColor: '#e86a17',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'});

    creditsText2 = game.add.text(game.world.width/2, game.world.height/2 + 60, 'Alberto Valls Martinez',
        {font: '32px Fantasy',
        fill: '#FFFFFF',
        backgroundColor: '#e86a17',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'});

    creditsText3 = game.add.text(game.world.width/2, game.world.height/2 + 120, 'Jaime Perez Villena',
        {font: '32px Fantasy',
        fill: '#FFFFFF',
        backgroundColor: '#e86a17',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'});

    game.time.events.add(Phaser.Timer.SECOND * 5, function() {
        creditsText1.destroy();
        creditsText2.destroy();
        creditsText3.destroy()});
}

function backToMenu(){
    game.state.start('menu');
}