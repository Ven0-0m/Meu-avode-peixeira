let estado = "menu";
let fasesDesbloqueadas = [true, false, false, false, false];
let faseAtual = 0;
let jogador, chefe, pet;
let mapaFundo = [], mapaPrincipal = [];
let tileSize = 18;
let imgTitulo, imgTilesetFundo, imgTilesetPrincipal, imgPlayer;
let imagensChefes = {}, imagensPets = {};
let jsonMapa; // Esta variável global não será mais o principal meio de carregar o JSON após a seleção de fase

let camX = 0;
let vidas = 3;
let vidaChefe = 100;

let konami = [];
let konamiCode = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let easterEgg = false;

// Variável para controlar a inversão dos controles (para a sugestão de melhoria)
let controlesInvertidos = false;

function preload() {
  imgTitulo = loadImage("titulo.png");
  imgTilesetFundo = loadImage("tilemap-backgrounds_packed.png");
  imgTilesetPrincipal = loadImage("tilemap_packed.png");
  imgPlayer = loadImage("vovo.png");

  imagensChefes = {
    1: loadImage("urutu.png"),
    2: loadImage("tatu.png"),
    3: loadImage("onca.png"),
    4: loadImage("ibama.png")
  };

  imagensPets = {
    1: loadImage("pet_urutu.png"),
    2: loadImage("pet_tatu.png"),
    3: loadImage("pet_onca.png"),
  };

  // Carrega fase-0.json apenas para o estado inicial, se necessário.
  // Para outras fases, o loadJSON será feito em mousePressed.
  jsonMapa = loadJSON("fase-0.json");
}
function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(30);

  if (estado === "menu") {
    image(imgTitulo, 0, 0, width, height);
    desenharBotao(width / 2 - 60, height - 80, "JOGAR");
    if (easterEgg) {
      fill("yellow");
      textAlign(CENTER);
      text("Konami Code Ativado!", width / 2, 30);
    }
  }

  else if (estado === "selecao") {
    textAlign(CENTER);
    fill(255);
    textSize(24);
    text("Selecione a fase", width / 2, 40);
    for (let i = 0; i < 5; i++) {
      let x = 100 + i * 90;
      let y = 100;
      fill(fasesDesbloqueadas[i] ? "lightgreen" : "gray");
      rect(x, y, 60, 60, 10);
      fill(0);
      text(`Fase ${i}`, x + 30, y + 30);
    }
    desenharBotao(20, height - 40, "História");
  }

  else if (estado === "historia") {
    background(10);
    fill(255);
    textSize(16);
    textAlign(LEFT);
    text("HISTÓRIA DO JOGO:\n\nSeu avô vivia no campo em tempos difíceis.\nA inflação era alta, o dinheiro valia pouco...\nA esperança estava na cidade — onde surgiram as oportunidades.\nAgora, ele precisa lutar contra feras e a burocracia do IBAMA para salvar sua terra e sua família!", 30, 40, width - 60, height - 60);
    desenharBotao(20, height - 40, "Voltar");
  }

  else if (estado === "jogo") {
    if (!jogador || mapaPrincipal.length === 0) return;
    camX = constrain(jogador.x - width / 2, 0, mapaPrincipal[0].length * tileSize - width);
    push();
    translate(-camX, 0);
    desenharMapa(mapaFundo, imgTilesetFundo);
    desenharMapa(mapaPrincipal, imgTilesetPrincipal);
    jogador.atualizar();
    jogador.mostrar();
    if (chefe) {
      chefe.atualizar();
      chefe.mostrar();
    }
    // Garante que pet seja uma imagem antes de tentar desenhar
    if (pet && typeof pet.width !== 'undefined') image(pet, jogador.x - 30, jogador.y - 30, 20, 20);
    pop();

    fill("red");
    rect(20, 20, vidas * 30, 10);
    fill("green");
    rect(20, 40, vidaChefe, 10);
  }
}

function desenharBotao(x, y, texto) {
  fill(255);
  rect(x, y, 120, 30, 10);
  fill(0);
  textAlign(CENTER, CENTER);
  text(texto, x + 60, y + 15);
}

function mousePressed() {
  if (estado === "menu") {
    if (mouseX > width / 2 - 60 && mouseX < width / 2 + 60 && mouseY > height - 80 && mouseY < height - 50) {
      estado = "selecao";
    }
  }

  else if (estado === "selecao") {
    for (let i = 0; i < 5; i++) {
      let x = 100 + i * 90;
      let y = 100;
      if (mouseX > x && mouseX < x + 60 && mouseY > y && mouseY < y + 60) {
        if (fasesDesbloqueadas[i]) {
          faseAtual = i;
          // Correção: passa o JSON carregado diretamente para carregarMapa
          loadJSON(`fase-${i}.json`, (loadedJson) => {
            carregarMapa(loadedJson);
            estado = "jogo";
          });
        }
      }
    }

    if (mouseX > 20 && mouseX < 140 && mouseY > height - 40 && mouseY < height - 10) {
      estado = "historia";
    }
  }

  else if (estado === "historia") {
    if (mouseX > 20 && mouseX < 140 && mouseY > height - 40 && mouseY < height - 10) {
      estado = "selecao";
    }
  }
}
function carregarMapa(jsonData) { // Agora recebe jsonData como argumento
  mapaFundo = [];
  mapaPrincipal = [];

  // Verifique os nomes exatos das suas camadas no arquivo JSON
  // Por exemplo, se forem "Camada de Tiles 2" e "Camada de Tiles 1"
  let camadaFundo = jsonData.layers.find(l => l.name.includes("2"));
  let camadaPrincipal = jsonData.layers.find(l => l.name.includes("1"));

  let largura = jsonData.width;

  if (camadaFundo && camadaFundo.data) {
    let dados = camadaFundo.data;
    for (let i = 0; i < dados.length; i += largura) {
      mapaFundo.push(dados.slice(i, i + largura));
    }
  }

  if (camadaPrincipal && camadaPrincipal.data) {
    let dados = camadaPrincipal.data;
    for (let i = 0; i < dados.length; i += largura) {
      mapaPrincipal.push(dados.slice(i, i + largura));
    }
  }

  jogador = new Jogador(50, 100);
  chefe = new Chefe(400, 100, faseAtual + 1); // Garante que o tipo do chefe comece de 1
  pet = null;
  vidaChefe = 100;
  vidas = 3;
}

function desenharMapa(mapa, tileset) {
  for (let y = 0; y < mapa.length; y++) {
    for (let x = 0; x < mapa[y].length; x++) {
      let bloco = mapa[y][x];
      if (bloco > 0) {
        let sx = ((bloco - 1) % 20) * tileSize;
        let sy = floor((bloco - 1) / 20) * tileSize;
        image(tileset, x * tileSize, y * tileSize, tileSize, tileSize, sx, sy, tileSize, tileSize);
      }
    }
  }
}
class Jogador {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vy = 0;
    this.w = 20;
    this.h = 30;
    this.noChao = false;
    this.atacando = false;
    this.dano = 0;
  }

  atualizar() {
    this.vy += 1.2;
    this.y += this.vy;

    // Lógica para controle invertido (usando a variável global)
    if (controlesInvertidos) {
      if (keyIsDown(65)) this.x += 3; // A move para direita
      if (keyIsDown(68)) this.x -= 3; // D move para esquerda
    } else {
      if (keyIsDown(65)) this.x -= 3; // A move para esquerda
      if (keyIsDown(68)) this.x += 3; // D move para direita
    }

    if (this.y + this.h > height - 20) {
      this.y = height - 20 - this.h;
      this.vy = 0;
      this.noChao = true;
    } else {
      this.noChao = false;
    }

    // Reseta o estado de ataque após um curto período ou após colidir
    if (this.atacando) {
      setTimeout(() => {
        this.atacando = false;
      }, 100); // Define um pequeno atraso para o ataque
    }

    if (chefe && this.atacando && this.colide(chefe)) {
      chefe.levarDano(10);
      this.atacando = false; // Garante que o ataque só aconteça uma vez por "hit"
    }
  }

  mostrar() {
    image(imgPlayer, this.x, this.y, this.w, this.h);
  }

  atacar() {
    this.atacando = true;
  }

  colide(obj) {
    return (
      this.x + this.w > obj.x &&
      this.x < obj.x + obj.w &&
      this.y + this.h > obj.y &&
      this.y < obj.y + obj.h
    );
  }

  levarDano() {
    vidas--;
    if (vidas <= 0) {
      estado = "menu";
      // Reinicia o jogo ou mostra tela de game over
      vidas = 3; // Reinicia vidas para a próxima vez
      vidaChefe = 100; // Reinicia vida do chefe
      faseAtual = 0; // Volta para a primeira fase
      fasesDesbloqueadas = [true, false, false, false, false]; // Reinicia desbloqueio
    }
  }
}

class Chefe {
  constructor(x, y, tipo) {
    this.x = x;
    this.y = y;
    this.vy = 0;
    this.dir = 1;
    this.w = 40;
    this.h = 40;
    this.tipo = tipo;
    this.cdAtaque = 0;
  }

  atualizar() {
    if (vidaChefe <= 0) {
      chefe = null;
      if (faseAtual < fasesDesbloqueadas.length -1) { // Evita erro se for a última fase
        fasesDesbloqueadas[faseAtual + 1] = true;
      }
      // Verifica se a imagem do pet existe para o tipo de chefe
      pet = imagensPets[this.tipo];
      // Se quiser voltar para seleção de fase ou tela de vitória
      estado = "selecao"; // Ou "vitoria" se tiver um estado de vitória
      return;
    }

    this.cdAtaque--;

    if (this.tipo === 1) {
      // Urutu: pula pra frente
      if (this.cdAtaque <= 0) {
        this.vy = -10;
        this.cdAtaque = 90;
      }
      this.y += this.vy;
      this.vy += 0.8;
      // Garante que o chefe não caia para sempre
      if (this.y > height - this.h) {
        this.y = height - this.h;
        this.vy = 0;
      }
    }

    if (this.tipo === 2) {
      // Tatu: dash horizontal
      this.x += this.dir * 3;
      if (this.x < 100 || this.x > 500) this.dir *= -1;
    }

    if (this.tipo === 3) {
      // Onça: corre aleatoriamente
      this.x += this.dir * 5;
      if (this.x < 50 || this.x > 550) this.dir *= -1;
    }

    if (this.tipo === 4) {
      // IBAMA: inverte controles
      if (this.cdAtaque <= 0) {
        inverterControles();
        this.cdAtaque = 200;
      }
    }

    if (jogador && this.colide(jogador)) {
      jogador.levarDano();
    }
  }

  mostrar() {
    image(imagensChefes[this.tipo], this.x, this.y, this.w, this.h);
  }

  colide(obj) {
    return (
      this.x + this.w > obj.x &&
      this.x < obj.x + obj.w &&
      this.y + this.h > obj.y &&
      this.y < obj.y + obj.h
    );
  }

  levarDano(qtd) {
    vidaChefe -= qtd;
  }
}
function keyPressed() {
  konami.push(key);
  if (konami.length > 10) konami.shift();

  if (konami.join(",").toLowerCase() === konamiCode.join(",").toLowerCase()) {
    easterEgg = true;
  }

  if ((key === " " || key === "k") && jogador && jogador.noChao) {
    jogador.vy = -10;
    jogador.noChao = false;
  }

  if (key === "j" && jogador) {
    jogador.atacar();
  }
}

function inverterControles() {
  // Apenas inverte a variável de estado
  controlesInvertidos = true;

  setTimeout(() => {
    controlesInvertidos = false;
  }, 3000);
}