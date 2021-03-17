const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
const image = document.getElementById('image');
const imageHeight = image.height,
        halfImageWidth = image.width / 2;

let level = 0;
let score = 250;


//unattached functions
const random = (a, b) => Math.random() * a + b;

function clearOut() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgba(0, 0, 0, 0.1)'
        context.fillRect(0, 0, canvas.width, canvas.height);
}
const colorRandom = () => {
        let r = random(250, 50),
                g = random(250, 50),
                b = random(250, 50),
                alpha = .7;
        return 'rgb(' + r + ',' + g + ',' + b + ',' + alpha + ')'
}


//gun object and related functions

let player = {
        x: (canvas.width / 2),
        y: canvas.height,
        dx: 15
}
function draw_image() {
        context.drawImage(image, player.x - halfImageWidth, player.y - imageHeight);
}
//class projectile
class projectile {
        constructor(x, y, radius, dx, dy, color) {
                this.x = x;
                this.y = y;
                this.dx = dx;
                this.dy = dy;
                this.radius = radius;
                this.color = color
        }
        drawCircle() {
                context.beginPath();
                context.arc(this.x, this.y, this.radius, Math.PI * 2, false);
                context.fillStyle = this.color;
                context.fill();
                context.closePath();

        }
        update() {

                if (this.y > 0 && this.x > 0) {
                        this.drawCircle();
                        this.y -= this.dy;
                        this.x -= this.dx;

                }

        }
}
//class circles
class circle {
        constructor(x, y, radius, dx, dy, color) {
                this.x = x;
                this.y = y;
                this.dx = dx;
                this.dy = dy;
                this.radius = radius;
                this.color = color
        }
        drawCircle() {
                context.beginPath();
                context.arc(this.x, this.y, this.radius, Math.PI * 2, false);
                context.fillStyle = this.color;
                context.fill();
                context.closePath();

        }
        update() {
                this.drawCircle()
                if (this.y < canvas.height) {
                        this.y += this.dy
                }
                else if (this.y >= canvas.height) {
                        this.y = 0;
                }
        }
}

//create explosion
class explosion {
        constructor(x, y, radius, dx, dy, color) {
                this.x = x;
                this.y = y;
                this.dx = dx;
                this.dy = dy;
                this.radius = radius;
                this.color = color
                this.alpha = 1;
        }
        drawCircle() {
                context.save()
                context.globalAlpha = this.alpha;

                context.beginPath();
                context.arc(this.x, this.y, this.radius, Math.PI * 2, false);
                context.fillStyle = this.color;
                context.fill();
                context.closePath();
                context.restore();

        }
        update() {

                if (this.y > 0 && this.x > 0) {
                        this.drawCircle();
                        this.y -= this.dy;
                        this.x -= this.dx;
                        this.alpha -= 0.04;

                }

        }
}

let duration = 0;
setInterval(() => {
        let date = new Date();
        let hour = date.getHours();
        let minutes = date.getMinutes()
        let seconds = date.getSeconds()
        hour = hour > 10 ? hour : '0' + hour;
        minutes = minutes > 10 ? minutes : '0' + minutes;
        seconds = seconds > 10 ? seconds : '0' + seconds;
        document.getElementById('localtime').innerHTML = hour + ' : ' + minutes + ' : ' + seconds;
        duration++;
        let h = parseInt(duration / 3600);
        let m = parseInt((duration - h * 3600) / 60);
        let s = duration - (h * 3600 + m * 60);
        h = h > 10 ? h : '0' + h;
        m = m > 10 ? m : '0' + m;
        s = s > 10 ? s : '0' + s;
        document.getElementById('duration').innerHTML = 'Time: ' + h + ' : ' + m + ' : ' + s;

}, 1000);

let projectiles = [];
let circles = [];
let explosions = [];
let numberOfCircle = 50;
let gameStatus = null;
//reset function
function reset() {
        projectiles = [];
        circles = [];
        explosions = [];
        level = 0;
        score = 100;
        fillCircle();
}
//load circles
const fillCircle = () => {
        for (let i = 0; i < numberOfCircle; i++) {
                circles.push(new circle(random(canvas.width - 40, 0), 0, random(30, 10), 0, random(2, 0.5), colorRandom()))

        }
}

fillCircle();
//animation

function update() {
        clearOut();
        draw_image();
        explosions.forEach((explosion, i) => {
                if (explosion.alpha <= 0) {
                        explosions.splice(i, 1);
                }
                else {
                        explosion.update();
                }
        });
        projectiles.forEach((projectile, i) => {
                projectile.update();
                if (projectile.y - projectile.radius < 0) {
                        setTimeout(() => {
                                projectiles.splice(i, 1)
                        }, 0);
                }
        });
        if (circles.length == 0) {
                level += 1;
                fillCircle();
                circle.dy += (level - 1) / 2;
                console.log(score)

        }
        circles.forEach((circle, i) => {
                circle.update();
                if (circle.y == 0) {
                        score -= circle.radius
                        console.log(score);
                }
                //collision detect
                projectiles.forEach((projectile, j) => {
                        const distance = Math.hypot(projectile.x - circle.x, projectile.y - circle.y)
                        if (distance - circle.radius - projectile.radius < 1) {
                                score += circle.radius;

                                projectiles.splice(j, 1)
                                for (let id = 0; id < circle.radius * 3; id++) {
                                        explosions.push(new explosion(projectile.x, projectile.y, random(2, 1), (Math.random() - 0.5) * random(10, 1), (Math.random() - 0.5) * random(10, 1), circle.color))

                                }

                                if (circle.radius - 10 > 10) {
                                        circle.radius -= 10;
                                        circle.dy *= 0.80;
                                }
                                else {
                                        circles.splice(i, 1);
                                }

                        }
                });
        });

        gameStatus = requestAnimationFrame(update);
        document.getElementById('level').innerHTML = 'Level : ' + level;
        document.getElementById('score').innerHTML = 'score : ' + Math.round(score);
        document.getElementById('status').innerHTML = 'Game started';



        if (score <= 0) {

                cancelAnimationFrame(gameStatus);
                document.getElementById('status').innerHTML = 'game Over'
                document.getElementById('startCover').style.display = 'flex';
                document.getElementById('welcome').style.display = 'none';
                document.getElementById('start').innerHTML = 'restart'

                //output game over;
        }
}

//event listener

document.onkeydown = (e) => {

        if (e.key == 'ArrowRight' && player.x < canvas.width) {
                player.x += player.dx;

        }
        else if (e.key == 'ArrowLeft' && player.x > 0) {
                player.x -= player.dx;
        }
        if (e.key == "Shift") {
                projectiles.push(new projectile(player.x - halfImageWidth / 2, player.y - imageHeight / 2, 4, 0, canvas.height/80, 'white'));
                score -= 1;
        }

}
//for mobile
document.getElementById('moveLeft').addEventListener('touchstart ', (e) => {
        player.x -= player.dx;
        console.log(e)
},false)
document.getElementById('shoot').addEventListener('touchstart ', (e) => {
        projectiles.push(new projectile(player.x - halfImageWidth / 2, player.y - imageHeight / 2, 4, 0, canvas.height/80, 'white'));
        score -= 1;       
},false)
document.getElementById('moveRight').addEventListener('touchstart ', (e) => {
        player.x += player.dx;
},false)

//start game
document.getElementById('start').addEventListener('click', () => {
        document.getElementById('startCover').style.display = 'none';
        document.getElementById('section1').style.display = 'flex';
        document.getElementById('section1').style.position = 'fixed';

        reset();
        update();
})

//html dom
const welcome = document.getElementById('welcome').textContent;
let i = 0;
document.getElementById('welcome').innerHTML = "";

function typewriter() {
        if (i < welcome.length) {
                document.getElementById('welcome').innerHTML += welcome.charAt(i)
                i++;
                setTimeout(typewriter, 200);
        }
}
typewriter();
