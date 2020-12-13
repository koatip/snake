'use strict';

// Adjunk alapértékeket a változókhoz

const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

// Használd a canvas "getAttributumát, hogy a magasságát és szélességét elmentsd"
// const canvasWidth = canvas.getAttribute('width');
// const canvasHeight = canvas.getAttribute('height');

// Létrehozunk egy "box" változót, beállítjuk 10-re az értékét (ez fogja tárolni
// az alap méretét az almának és a kigyó "egységnyi" testének)
// Deklarálunk egy üres "snake" listát, amiben a testrészei lesznek
// Kell egy "timerId", ami az időzítőt fogja tárolni. Nem kell alapérték neki.
// Deklarálunk egy "apple" elemet, ami indulásként két koordinátát fog tárolni
// (hogy hol legyen az alma induláskor a canvason)

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const box = 10;
const snake = [];
let timerId;
let speed = 50;
const apple = new Position(40, 40);

//Irányok kezeléséhez segítségnek megadunk egy 2D listát, amit később fel tudunk használni:
// Ha x tengely mentén jobbra megyünk egy egységnyit ("box"),
// függőlegesen meg nem mozdulunk , akkor a lista első eleme jelenti az aktuális irányt és így tovább

const directions = [
    [box, 0], // right
    [0, box], //down
    [(-1 * box), 0], // left
    [0, (-1 * box)] // up
];
const X = 0;
const Y = 1;

// Kezdésnek kitűzünk egy indulási irányt a "directions listából" (itt még nincs mozgás, csak az irányt kitűzzük)
// Ez az actDirection, mint aktuális irány fogja tárolni, hogy merre haladjon (nőjön a kígyó)
let actDirection = directions[0];

// --------------------------- Print Table -----------------------------------------

// Kezdjünk játszani. Hozzunk létre egy start Game function-t.
// Hozzunk létre egy lokális Objektumot "snakeBody", ami két koordinátát fog tárolni.
// egyik property neve legyen: widthP, (szélességi pozició)
// másik property neve: heightP
// Így adjuk meg, hogy hol helyezkedjen el az induláskor.
// Használjuk egységként a 'box' értéket:
// Pl: let snakeBody = { widthP: box, heightP: 0};
// Adjuk hozzá a snakeListánkhoz, mint induló "testrész";
// Itt fogjuk elindítani az időzítőt is kicsit később
// Még ebben a metódusban hívjunk meg egy "printTable()" függvényt,
// Amit a következőkben fogunk megírni

function startGame() {
    snake.push(new Position(250, 200));

    timerId = setInterval(moveSnake, speed);

    printTable();
};

startGame();

//Első lépésnek meg kell rajzolni a világos zöld táblát, majd utána rá kell rajzolni
// a piros színű almát (haszáljuk a két induló értéket, koordinátaként,
// majd a box egységet, hogy mekkora méretre fesse fel az almát => fillRect).
// Végül a kigyó sötétzöld testét is meg kell rajzolni.
// Bár most még csak egy testrésze van, mindig ciklussal végig kell menni rajta és "felül"
// festeni a canvast(ctx.fillRect)
function printTable() {
    // canvas background
    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // apple
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x, apple.y, box, box);

    // snake
    ctx.fillStyle = 'green';
    for (const part of snake) {
        ctx.fillRect(part.x, part.y, box, box);
    }

    // head
    ctx.fillStyle = 'yellow';
    ctx.fillRect(snake[snake.lenght - 1].x, snake[snake.lenght - 1].y, box, box);
}

// -------------------------- Move snake, move!! -------------------------------

// Kezdjünk el mozogni.
// Hozzunk létre egy moveSnake függvényt, ami mozgatni fogja a kígyót.
// Elsőnek állapítsuk meg, "hol a feje a kígyónak". => a snake lista utolsó eleme lesz.
// Ha majd eszik a kigyó mindig nőni fog a lista a "feje" felé. Mentsük ki egy lokális
// változóba pl: 'headOfSnake'
// Hozzunk létre még egy lokális változót: "newHeadPosition"
// Ki kell számolnunk és ebbe kell belementenünk a két új koordinátát a headOfSnake és
// a korábban létrehozott actDirection megfelelő értékeivel. (két elemű lista)
// Miután kiszámoltuk, megvannak a koordináták, hozzunk létre egy:
// "newBodyPart" Objektumot, hasonlóan mint a startGame-ben, adjuk át a megfelelő position-ket
// a newHeadPosition-ből.
// Már csak hozzá kell adnunk a snake listához az új testrészt. Végül vegyük ki az első elemet
// a "kígyó farok részét". => shift() metódus .
// Így gyakorlatilag eltoljuk egy irányba a kígyót
// Megváltoztak a kigyó testjének koordinátái, újra kell rajzolnunk a táblát.
// Hívjuk meg a függvény végén a már megírt printTable() metódust, hogy az
// újra rajzolja a táblát a kígyó új testrészével együtt
// Még most nem láthatunk változást, hiszen a moveSnake függvényt is meg kell hívni
// De előtte még....

function moveSnake() {
    const headOfSnake = snake[snake.length - 1];

    if (apple.x < headOfSnake.x) {
        actDirection = directions[2];
    } else if (apple.x > headOfSnake.x) {
        actDirection = directions[0];
    } else if (apple.y > headOfSnake.y) {
        actDirection = directions[1];
    } else if (apple.y < headOfSnake.y) {
        actDirection = directions[3];
    }


    let newHeadPosition = new Position(headOfSnake.x + actDirection[X], headOfSnake.y + actDirection[Y]);
    let count = 4;
    while (inBody(newHeadPosition) && count) {
        actDirection = directions[Math.floor(Math.random() * 4)];
        newHeadPosition = new Position(headOfSnake.x + actDirection[X], headOfSnake.y + actDirection[Y]);
        count--;
    }


    const eat = checkEating(newHeadPosition);

    if (!hasCollision(newHeadPosition)) {
        snake.push(newHeadPosition);
        if (!eat)
            snake.shift();
    }

    printTable();
}

// Hozzunk létre egy EventListener-t, ami a billentyűk leütését figyeli és ennek megfelelően
// változtatja az "actDirection" irányát.
// Segítségül egy iránynak megírtuk

window.addEventListener('keydown', (event) => {
    event.preventDefault();
    switch (event.code) {
        case "ArrowRight":
            if (snake.length == 1 || actDirection[X] != -10) {
                actDirection = directions[0];
            }
            break;
        case "ArrowDown":
            if (snake.length == 1 || actDirection[Y] != -10) {
                actDirection = directions[1];
            }
            break;
        case "ArrowLeft":
            if (snake.length == 1 || actDirection[X] != 10) {
                actDirection = directions[2];
            }
            break;
        case "ArrowUp":
            if (snake.length == 1 || actDirection[Y] != 10) {
                actDirection = directions[3];
            }
    }
});

// Ha most mindent jól csináltunk, akkor a nyilak leütésének megfelelően mindig változni
// fog az aktuális irány. Ideje élesítenünk a moveSnake() függvényt.
// Nincs már másra szükség, mint a startGame()-ben hozzunk létre egy setIntervalt, mondjuk 200ms-al
// adjuk meg callback function-ként a moveSnake-et:
// timerId = setInterval(moveSnake, 200);
// Mentés után már mozogni kell a pici kígyónknak a billentyűzet segítségével
// Addig ne menj tovább, amíg ezt a működést nem sikerül összehozni

// ---------------------------------------- Az Evés ----------------------------------

// Kezdjük el táplálni a háziállatunkat
// Létrehozzuk az étkezést ellenörző metódusunkat
// Mentsük ki egy lokális változóba a kigyó fejét (utolsó elem a listában)
// Nézzük meg, hogy mindkét koordináta megegyezik e a fej és alma esetén(egy helyen vannak)
// Ha igen, készítsünk egy "newBody" Objektet az alma koordinátáival
// Majd adjuk hozzá a kígyó testéhez, hogy nőni tudjon.
// helyezzük el az almát egy random helyen, vagyis generáljunk random koordinátát neki
function checkEating(head) {
    if (apple.x === head.x && apple.y === head.y) {
        do {
            apple.x = Math.floor(Math.random() * canvas.width / box) * box;
            apple.y = Math.floor(Math.random() * canvas.height / box) * box;
        } while (inBody(apple));

        // speed--;
        // clearInterval(timerId);
        // timerId = setInterval(moveSnake, speed);
        return true;
    }
    return false;
};

// Még be kell kötnünk a megfelelő helyre a checkEating()-et.
// Hívjuk meg a moveSnake()-ben legfelül. Most odáig kellett eljutnunk, hogy
// mozog a kígyó, nő a teste, ha almára lép, és random helyen jelenik meg az alma
// Nincs sok hátra. Ideje az ütközéseket ellenőrizni

// ----------------------------------- Az Ütközés ---------------------------------

// Ismét a fejét kell megvizsgálnunk.
// Mentsük ki egy változóba a fej objektumát. Nézzük meg, hogy a fej koordinátái
// túlnyúlnak e a canvas méretén (canvasWidth, canvasHeight változó)
// vagy bármelyik testrészének koordinátájával megegyeznek. Akkor térjen vissza true értékkel
// különben false.
// Megj: figyeljünk arra, hogy a fej önmagával történő vizsgálatát elkerüljük
function hasCollision(head) {
    if (inBody(head)) {
        clearInterval(timerId);
        alert('Vége a játéknak! ' + (snake.length - 1) + ' pontot értél el.');
    }
    if (head.x >= 0 && head.x < canvas.width && head.y >= 0 && head.y < canvas.height) {
        return false;
    }
    return true;
};

function inBody(head) {
    for (const part of snake) {
        if (part.x == head.x && part.y == head.y)
            return true;
    }
    return false;
}
// Már csak be kell kötnünk. Hívjuk meg legeslegfelül a moveSnake()-ben.
// Ha true értékkel tér vissza vége a játéknak. Töröljük a setInterval-t
// Valami üzenetet jelenítsünk meg a felhasználónak..
// Végére értünk! Gratulálunk, ha eljutottál idáig!
// További fejlesztési lehetőségek: Pontok kiíratása, ahogy nő a kígyó egyre gyorsabban halad

// ----------------------------------- GAME OVER -------------------------------------
