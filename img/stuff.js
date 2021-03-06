function thing() {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  function render() {
  }
  function preload() {
    game.load.spritesheet('button', 'img/button_sprite_sheet.png', 193, 71);
    game.load.image('sky', 'img/sky.png');
    game.load.image('ground', 'img/platform.png');
    game.load.image('star', 'img/star.png');
    game.load.image('tree', 'img/tree.png');
    game.load.image('cloud', 'img/cloud.png');
    game.load.spritesheet('dude', 'img/dude.png', 32, 48);
    game.load.spritesheet('baddie', 'img/baddie.png', 32, 32);
  }
  var scoreText, button, backgrounds, platforms, player, cursors, stars, baddies, lasers, trees;
  var mouseTouchDown = false;
  var baddiesKilled = 0;
  var score = 0;

  function resetLaser(laser) {
    laser.kill();
  }

  function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, 2800, 600);

    backgrounds = game.add.group();
    backgrounds.enableBody = true;
    backgrounds.createMultiple(5, 'sky');
    for (var i = 0; i < backgrounds.length; i++) {
      var background = backgrounds.getChildAt(i);
      background.checkWorldBounds = false;
    }
    spawnBackground();

    lasers = game.add.group();
    lasers.enableBody = true;
    lasers.physicsBodyType = Phaser.Physics.ARCADE;
    lasers.createMultiple(20, 'star');
    lasers.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetLaser);
    lasers.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    lasers.setAll('checkWorldBounds', true);

    platforms = game.add.group();
    platforms.enableBody = true;
    platforms.physicsBodyType = Phaser.Physics.ARCADE;
    platforms.createMultiple(5, 'ground');
    for (var i = 0; i < platforms.length; i++) {
      var ground = platforms.getChildAt(i);
      ground.checkWorldBounds = false;
    }
    spawnFloor();

    player = game.add.sprite(400, 600 - 130, 'dude');

    game.physics.arcade.enable(player);

    player.body.bounce.y = 0.2;
    player.body.gravity.y = 1000;
    player.body.mass = 0.1;
    player.body.collideWorldBounds = true;

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    player.anchor.setTo(0.5, 0.5);
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON);
    cursors = game.input.keyboard.createCursorKeys();
    stars = game.add.group();

    stars.enableBody = true;

    for (var i = 0; i < 12; i++) {
      var star = stars.create(i * 70, 0, 'star');
      star.body.gravity.y = 900;
      star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    scoreText = game.add.text(game.camera.x + 16, game.camera.y + 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#000'
    });

    scoreText.fixedToCamera = true;

    baddies = game.add.group();
    baddies.enableBody = true;
    baddies.physicsBodyType = Phaser.Physics.ARCADE;
    baddies.createMultiple(20, 'baddie');
    baddies.callAll('events.onKilled.add', 'events.onKilled', spawnBaddie);
    baddies.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    game.physics.arcade.enable(baddies);

    for (var i = 0; i < baddies.length; i++) {
      var baddie = baddies.getChildAt(i);
      baddie.body.bounce.y = 0.2;
      baddie.body.gravity.y = 300;
      baddie.body.collideWorldBounds = true;
      baddie.checkWorldBounds = false;
      baddie.animations.add('left', [0, 1], 10, true);
      baddie.animations.add('right', [2, 3], 10, true);
    }

    trees = game.add.group();
    trees.enableBody = true;
    trees.physicsBodyType = Phaser.Physics.ARCADE;
    trees.createMultiple(20, 'tree');
    trees.callAll('events.onKilled.add', 'events.onKilled', spawnTree);
    trees.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    trees.setAll('checkWorldBounds', true);
    game.physics.arcade.enable(trees);

    for (var i = 0; i < trees.length; i++) {
      var tree = trees.getChildAt(i);
      tree.body.bounce.y = 0.2;
      tree.body.collideWorldBounds = false;
      tree.body.immovable = true;
    }

    button = game.add.button(game.camera.x + (game.width * 0.5), game.camera.y + (game.height * 0.5), 'button', actionOnClick, this, 2, 1, 0);
    button.anchor.setTo(0.5, 0.5);
    button.fixedToCamera = true;
    button.visible = false;

    spawnBaddie();
    spawnTree();
  }
  function actionOnClick () {
    game.state.restart(true, true);
    button.visible = false;
  }
  function collectStar(player, star) {
    star.kill();

    score += 10;
    scoreText.text = 'Score: ' + score;
  }

  function killBaddie(baddie, laser) {
    baddie.kill();
    laser.kill();
    score += 10;
    scoreText.text = 'Score: ' + score;
    baddiesKilled += 1;
  }

  function update() {
    game.world.setBounds(player.position.x - (game.width * 0.5), 0, game.width*2, game.height);
    var hitPlatform = game.physics.arcade.collide(player, platforms);
    var baddieHitPlatform = game.physics.arcade.collide(baddies, platforms);
    var hitBaddie = game.physics.arcade.collide(player, baddies);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(trees, platforms);
    game.physics.arcade.collide(player, trees);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(baddies, lasers, killBaddie, null, this);

    killStuff(backgrounds);
    killStuff(platforms);
    killStuff(trees);
    player.body.velocity.x = 100;
    if (hitBaddie) {
      player.kill();
    }
    player.animations.play('right');


    if ((cursors.up.isDown || game.input.activePointer.isDown && game.input.x > (game.width*0.5)) && player.body.touching.down) {
      player.body.velocity.y = -550;
    }

    baddies.setAll('body.velocity.x', 100);

    for (var i = 0; i < baddies.length; i++) {
      var baddie = baddies.getChildAt(i);
      if (player.x < baddie.x && player.alive) {
        baddie.body.velocity.x -= 50;

        baddie.animations.play('left');
      } else if (player.x > baddie.x && player.alive) {
        baddie.body.velocity.x += 50;

        baddie.animations.play('right');
      } else {
        baddie.animations.stop();
        baddie.frame = 2;
        baddie.body.velocity.x = 0;
      }

      if (player.body.bottom < baddie.body.bottom && baddie.body.touching.down && baddieHitPlatform && player.alive) {
        baddie.body.velocity.y = -350;
      }
    }
    if (game.input.activePointer.isDown && game.input.x < (game.width*0.5)) {
      if (!mouseTouchDown) {
        touchDown();
      }
    } else {
      if (mouseTouchDown) {
        touchUp();
      }
    }

    if (!player.alive) {
      button.visible = true;
    }
  }
  function touchDown() {
    mouseTouchDown = true;
    fireLaser();
  }

  function touchUp() {
    mouseTouchDown = false;
  }

  function fireLaser() {
    var laser = lasers.getFirstExists(false);
    if (laser) {
      laser.reset(player.body.center.x, player.body.center.y+10);
      laser.body.velocity.x = -500;
    }
  }
  function spawnBaddie() {
    for (var i = -1; i < baddiesKilled; i++) {
      setTimeout(function(){
        var baddie = baddies.getFirstExists(false);
        if (baddie) {
          baddie.reset(game.camera.x - 32, game.world.height - 150);
          baddie.body.velocity.x = 0;
        }
      }, 500 + (500 * i));
    }
  }
  function spawnTree() {
    var tree = trees.getFirstExists(false);
    if (tree) {
      tree.reset(game.camera.x + (game.width * 1.1), game.camera.y + (game.height - 68));
    }
  }
  function spawnFloor() {
    var ground = platforms.getFirstExists(false);
    if (ground) {
      var lastGround = farthestLeftThing(platforms);
      do {
        ground.reset(lastGround == null ? 0 : lastGround.body.right, game.camera.y + (game.height - 32));

        ground.body.immovable = true;
        ground.events.onKilled.add(spawnFloor, this);
        ground.checkWorldBounds = false;
        ground = platforms.getFirstExists(false);
        if (!ground) {
          break;
        }
        lastGround = farthestLeftThing(platforms);
      } while (Phaser.Rectangle.intersects(lastGround.getLocalBounds(), game.camera.view));
    }
  }
  function spawnBackground() {
    var background = backgrounds.getFirstExists(false);
    if (background) {
      var leftestBackground = farthestLeftThing(backgrounds);
      do {
        background.reset(leftestBackground == null ? 0 : leftestBackground.body.right, game.camera.y);

        background.body.immovable = true;
        background.events.onKilled.add(spawnBackground, this);
        background.checkWorldBounds = false;
        background = backgrounds.getFirstExists(false);
        if (!background) {
          break;
        }
        leftestBackground = farthestLeftThing(backgrounds);
      } while (Phaser.Rectangle.intersects(leftestBackground.getLocalBounds(), game.camera.view));
    }
  }
  function farthestLeftThing(things) {
    var last = {x: -100};
    var found = false;
    for (var i = 0; i < things.length; i++) {
      var thing = things.getChildAt(i);
      if (thing.alive && thing.x > last.x) {
        last = thing;
        found = true;
      }
    }
    return found ? last : null;
  }
  function killStuff(stuffs) {
    for (var i = 0; i < stuffs.length; i++) {
      var platform = stuffs.getChildAt(i);
      if (platform.alive && platform.body.right < game.camera.x) {
        platform.kill();
      }
    }
  }
}
