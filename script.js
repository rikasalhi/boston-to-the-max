const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const photos = [
    {
        src: "imageswebsite/newbury.jpg",
        name: "NEWBURY STREET"
    },
    {
        src: "imageswebsite/common.jpg",
        name: "BOSTON COMMON"
    },
    {
        src: "imageswebsite/beacon.jpg",
        name: "BEACON HILL"
    }
];

let currentPhoto = 0;
let img = new Image();
let imageData;

let circles = [];

const MIN_SIZE = 4;


// ------------------------------
// LOAD IMAGE
// ------------------------------

function loadPhoto() {

    img = new Image();
    img.src = photos[currentPhoto].src;

    const label = document.getElementById("locationName");

    if (label) {
        label.textContent = photos[currentPhoto].name;
    }

    img.onload = () => {
        setup();
    };
}


// ------------------------------
// SETUP
// ------------------------------

function setup() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    createImageData();
    createGrid();

    draw();
}


// ------------------------------
// CREATE HIDDEN IMAGE
// ------------------------------

function createImageData() {

    const temp = document.createElement("canvas");
    const tempCtx = temp.getContext("2d");

    temp.width = canvas.width;
    temp.height = canvas.height;

    const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
    );

    const width = img.width * scale;
    const height = img.height * scale;

    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;

    tempCtx.drawImage(
        img,
        x,
        y,
        width,
        height
    );

    imageData = tempCtx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


// ------------------------------
// GET PHOTO COLOR
// ------------------------------

function getColor(x, y) {

    x = Math.floor(
        Math.max(0, Math.min(canvas.width - 1, x))
    );

    y = Math.floor(
        Math.max(0, Math.min(canvas.height - 1, y))
    );

    const i = (y * canvas.width + x) * 4;

    return `rgb(
        ${imageData.data[i]},
        ${imageData.data[i + 1]},
        ${imageData.data[i + 2]}
    )`;
}


// ------------------------------
// CIRCLE OBJECT
// ------------------------------

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


    contains(mouseX, mouseY) {

        return (
            mouseX >= this.x &&
            mouseX <= this.x + this.size &&
            mouseY >= this.y &&
            mouseY <= this.y + this.size
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


// ------------------------------
// CREATE STARTING GRID
// ------------------------------

function createGrid() {

    circles = [];

    const size = 256;

    for (
        let y = 0;
        y < canvas.height;
        y += size
    ) {

        for (
            let x = 0;
            x < canvas.width;
            x += size
        ) {

            circles.push(
                new Circle(
                    x,
                    y,
                    size
                )
            );

        }
    }
}


// ------------------------------
// DRAW
// ------------------------------

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    circles.forEach(circle => {
        circle.draw();
    });
}


// ------------------------------
// HOVER
// ------------------------------

canvas.addEventListener(
    "mousemove",
    event => {

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        let changed = false;

        const next = [];

        circles.forEach(circle => {

            if (
                circle.contains(mouseX, mouseY) &&
                circle.size > MIN_SIZE
            ) {

                next.push(
                    ...circle.split()
                );

                changed = true;

            } else {

                next.push(circle);

            }

        });

        circles = next;

        if (changed) {
            draw();
        }
    }
);


// ------------------------------
// CLICK FOR NEXT PHOTO
// ------------------------------

canvas.addEventListener(
    "click",
    () => {

        currentPhoto =
            (currentPhoto + 1) %
            photos.length;

        loadPhoto();
    }
);


// ------------------------------
// RESIZE
// ------------------------------

window.addEventListener(
    "resize",
    () => {
        setup();
    }
);


// ------------------------------
// START
// ------------------------------

loadPhoto();
