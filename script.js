const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const nextButton = document.getElementById("nextButton");

const photos = [
    "imageswebsite/newbury.jpg",
    "imageswebsite/common.jpg",
    "imageswebsite/beacon.jpg"
];

let currentPhoto = 0;
let img = new Image();
let imageData = null;
let circles = [];

const MIN_SIZE = 4;
const START_SIZE = 256;


// ================================
// LOAD A PHOTO
// ================================

function loadPhoto(index) {

    currentPhoto = index;

    img = new Image();

    img.onload = function () {
        setup();
    };

    img.onerror = function () {
        console.error("IMAGE FAILED:", photos[currentPhoto]);
    };

    img.src = photos[currentPhoto];
}


// ================================
// SET UP CANVAS
// ================================

function setup() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    prepareImage();
    createGrid();
    draw();
}


// ================================
// PREPARE HIDDEN PHOTO
// ================================

function prepareImage() {

    const hiddenCanvas = document.createElement("canvas");
    const hiddenCtx = hiddenCanvas.getContext("2d");

    hiddenCanvas.width = canvas.width;
    hiddenCanvas.height = canvas.height;

    const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
    );

    const width = img.width * scale;
    const height = img.height * scale;

    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;

    hiddenCtx.drawImage(
        img,
        x,
        y,
        width,
        height
    );

    imageData = hiddenCtx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


// ================================
// SAMPLE COLOR
// ================================

function getColor(x, y) {

    x = Math.floor(
        Math.max(
            0,
            Math.min(canvas.width - 1, x)
        )
    );

    y = Math.floor(
        Math.max(
            0,
            Math.min(canvas.height - 1, y)
        )
    );

    const i = (y * canvas.width + x) * 4;

    return `rgb(
        ${imageData.data[i]},
        ${imageData.data[i + 1]},
        ${imageData.data[i + 2]}
    )`;
}


// ================================
// CIRCLE
// ================================

class Circle {

    constructor(x, y, size) {

        this.x = x;
        this.y = y;
        this.size = size;

        this.color = getColor(
            x + size / 2,
            y + size / 2
        );
    }


    draw() {

        const radius = this.size / 2;

        ctx.beginPath();

        ctx.arc(
            this.x + radius,
            this.y + radius,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = this.color;
        ctx.fill();
    }


    contains(x, y) {

        return (
            x >= this.x &&
            x <= this.x + this.size &&
            y >= this.y &&
            y <= this.y + this.size
        );
    }


    split() {

        if (this.size <= MIN_SIZE) {
            return [this];
        }

        const half = this.size / 2;

        return [
            new Circle(
                this.x,
                this.y,
                half
            ),

            new Circle(
                this.x + half,
                this.y,
                half
            ),

            new Circle(
                this.x,
                this.y + half,
                half
            ),

            new Circle(
                this.x + half,
                this.y + half,
                half
            )
        ];
    }
}


// ================================
// STARTING GRID
// ================================

function createGrid() {

    circles = [];

    for (
        let y = 0;
        y < canvas.height;
        y += START_SIZE
    ) {

        for (
            let x = 0;
            x < canvas.width;
            x += START_SIZE
        ) {

            circles.push(
                new Circle(
                    x,
                    y,
                    START_SIZE
                )
            );
        }
    }
}


// ================================
// DRAW
// ================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    for (const circle of circles) {
        circle.draw();
    }
}


// ================================
// HOVER = SPLIT
// ================================

canvas.addEventListener(
    "mousemove",
    function (event) {

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const newCircles = [];

        let changed = false;

        for (const circle of circles) {

            if (
                circle.contains(mouseX, mouseY) &&
                circle.size > MIN_SIZE
            ) {

                newCircles.push(
                    ...circle.split()
                );

                changed = true;

            } else {

                newCircles.push(circle);
            }
        }

        circles = newCircles;

        if (changed) {
            draw();
        }
    }
);


// ================================
// NEXT PHOTO
// ================================

nextButton.addEventListener(
    "click",
    function () {

        let nextPhoto = currentPhoto + 1;

        if (nextPhoto >= photos.length) {
            nextPhoto = 0;
        }

        loadPhoto(nextPhoto);
    }
);


// ================================
// WINDOW RESIZE
// ================================

window.addEventListener(
    "resize",
    function () {

        if (img.complete) {
            setup();
        }
    }
);


// ================================
// START
// ================================

loadPhoto(0);
