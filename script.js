const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const locationName = document.getElementById("locationName");

// OUR BOSTON PHOTOS
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
let image = new Image();
let imageData;

let circles = [];

const MIN_RADIUS = 2;


// ------------------------------------
// LOAD PHOTO
// ------------------------------------

function loadPhoto() {

    image = new Image();
    image.src = photos[currentPhoto].src;

    locationName.textContent =
        photos[currentPhoto].name;

    image.onload = function () {
        resizeCanvas();
        prepareImage();
    };
}


// ------------------------------------
// SIZE CANVAS
// ------------------------------------

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {

    resizeCanvas();

    if (image.complete) {
        prepareImage();
    }

});


// ------------------------------------
// PREPARE HIDDEN PHOTO
// ------------------------------------

function prepareImage() {

    const hiddenCanvas =
        document.createElement("canvas");

    const hiddenCtx =
        hiddenCanvas.getContext("2d");

    hiddenCanvas.width =
        canvas.width;

    hiddenCanvas.height =
        canvas.height;


    // Makes photo cover entire screen
    // without stretching it

    const scale = Math.max(
        canvas.width / image.width,
        canvas.height / image.height
    );

    const width =
        image.width * scale;

    const height =
        image.height * scale;

    const x =
        (canvas.width - width) / 2;

    const y =
        (canvas.height - height) / 2;


    hiddenCtx.drawImage(
        image,
        x,
        y,
        width,
        height
    );


    imageData =
        hiddenCtx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );


    createStartingCircle();
}


// ------------------------------------
// GET COLOR FROM PHOTO
// ------------------------------------

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


    const index =
        (y * canvas.width + x) * 4;


    const r =
        imageData.data[index];

    const g =
        imageData.data[index + 1];

    const b =
        imageData.data[index + 2];


    return `rgb(${r}, ${g}, ${b})`;
}


// ------------------------------------
// CIRCLE
// ------------------------------------

class Circle {

    constructor(x, y, radius) {

        this.x = x;
        this.y = y;
        this.radius = radius;

        this.color =
            getColor(x, y);
    }


    draw() {

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            this.color;

        ctx.fill();
    }


    contains(x, y) {

        const dx =
            x - this.x;

        const dy =
            y - this.y;


        return (
            dx * dx + dy * dy
            <=
            this.radius * this.radius
        );
    }


    split() {

        if (
            this.radius <= MIN_RADIUS
        ) {

            return [this];
        }


        const r =
            this.radius / 2;


        return [

            new Circle(
                this.x - r,
                this.y - r,
                r
            ),

            new Circle(
                this.x + r,
                this.y - r,
                r
            ),

            new Circle(
                this.x - r,
                this.y + r,
                r
            ),

            new Circle(
                this.x + r,
                this.y + r,
                r
            )

        ];
    }
}


// ------------------------------------
// CREATE FIRST GIANT CIRCLE
// ------------------------------------

function createStartingCircle() {

    circles = [];


    const radius =
        Math.sqrt(
            canvas.width ** 2 +
            canvas.height ** 2
        ) / 2;


    circles.push(
        new Circle(
            canvas.width / 2,
            canvas.height / 2,
            radius
        )
    );


    draw();
}


// ------------------------------------
// DRAW EVERYTHING
// ------------------------------------

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    for (
        const circle of circles
    ) {

        circle.draw();

    }
}


// ------------------------------------
// MOUSE HOVER
// ------------------------------------

canvas.addEventListener(
    "mousemove",
    (event) => {

        const mouseX =
            event.clientX;

        const mouseY =
            event.clientY;


        const newCircles = [];

        let changed = false;


        for (
            const circle of circles
        ) {

            if (
                circle.contains(
                    mouseX,
                    mouseY
                )
                &&
                circle.radius > MIN_RADIUS
            ) {

                newCircles.push(
                    ...circle.split()
                );

                changed = true;

            }

            else {

                newCircles.push(circle);

            }
        }


        circles =
            newCircles;


        if (changed) {
            draw();
        }

    }
);


// ------------------------------------
// CLICK = NEXT BOSTON PHOTO
// ------------------------------------

canvas.addEventListener(
    "click",
    () => {

        currentPhoto++;

        if (
            currentPhoto >=
            photos.length
        ) {

            currentPhoto = 0;
        }


        loadPhoto();

    }
);


// ------------------------------------
// START WEBSITE
// ------------------------------------

loadPhoto();
