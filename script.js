const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const nextButton = document.getElementById("nextButton");
const photoName = document.getElementById("photoName");

const photos = [
    {
        src: "./imageswebsite/newbury.jpg",
        name: "NEWBURY STREET"
    },
    {
        src: "./imageswebsite/common.jpg",
        name: "BOSTON COMMON"
    },
    {
        src: "./imageswebsite/beacon.jpg",
        name: "BEACON HILL"
    }
];

let currentPhoto = 0;
let currentImage = null;
let imageData = null;

let circles = [];

const MIN_SIZE = 3;


// ========================================
// LOAD PHOTO
// ========================================

function loadPhoto() {

    const photo = photos[currentPhoto];

    photoName.textContent = photo.name;

    const image = new Image();

    image.onload = function () {

        currentImage = image;

        setup();
    };

    image.onerror = function () {

        console.error(
            "Could not load:",
            photo.src
        );
    };

    image.src = photo.src;
}


// ========================================
// SETUP
// ========================================

function setup() {

    const rect =
        canvas.getBoundingClientRect();

    canvas.width =
        Math.round(rect.width);

    canvas.height =
        Math.round(rect.height);

    prepareImage();

    createStartingCircle();

    draw();
}


// ========================================
// PREPARE HIDDEN PHOTO
// ========================================

function prepareImage() {

    const hiddenCanvas =
        document.createElement("canvas");

    const hiddenCtx =
        hiddenCanvas.getContext("2d");

    hiddenCanvas.width =
        canvas.width;

    hiddenCanvas.height =
        canvas.height;


    const scale = Math.max(

        canvas.width /
        currentImage.width,

        canvas.height /
        currentImage.height

    );


    const width =
        currentImage.width * scale;

    const height =
        currentImage.height * scale;


    const x =
        (canvas.width - width) / 2;

    const y =
        (canvas.height - height) / 2;


    hiddenCtx.drawImage(

        currentImage,

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
}


// ========================================
// SAMPLE COLOR FROM PHOTO
// ========================================

function getColor(x, y) {

    x = Math.floor(

        Math.max(

            0,

            Math.min(
                canvas.width - 1,
                x
            )

        )

    );


    y = Math.floor(

        Math.max(

            0,

            Math.min(
                canvas.height - 1,
                y
            )

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


// ========================================
// CIRCLE
// ========================================

class Circle {

    constructor(x, y, size) {

        this.x = x;
        this.y = y;

        this.size = size;


        this.color =
            getColor(

                x + size / 2,

                y + size / 2

            );
    }


    draw() {

        const radius =
            this.size / 2;


        ctx.beginPath();


        ctx.arc(

            this.x + radius,

            this.y + radius,

            radius,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            this.color;


        ctx.fill();
    }


    contains(mouseX, mouseY) {

        const centerX =
            this.x + this.size / 2;

        const centerY =
            this.y + this.size / 2;


        const dx =
            mouseX - centerX;

        const dy =
            mouseY - centerY;


        const radius =
            this.size / 2;


        return (

            dx * dx +
            dy * dy

            <=

            radius * radius

        );
    }


    split() {

        if (
            this.size <= MIN_SIZE
        ) {

            return [this];
        }


        const half =
            this.size / 2;


        return [

            // TOP LEFT

            new Circle(

                this.x,
                this.y,

                half

            ),


            // TOP RIGHT

            new Circle(

                this.x + half,
                this.y,

                half

            ),


            // BOTTOM LEFT

            new Circle(

                this.x,
                this.y + half,

                half

            ),


            // BOTTOM RIGHT

            new Circle(

                this.x + half,
                this.y + half,

                half

            )

        ];
    }
}


// ========================================
// ONE STARTING CIRCLE
// ========================================

function createStartingCircle() {

    circles = [];


    /*
       Keep the artwork smaller than
       the canvas so we have white space.
    */

    const size =
        Math.min(

            canvas.width * 0.72,

            canvas.height * 0.88

        );


    const x =
        (canvas.width - size) / 2;


    const y =
        (canvas.height - size) / 2;


    circles.push(

        new Circle(

            x,
            y,

            size

        )

    );
}


// ========================================
// DRAW
// ========================================

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


// ========================================
// MOUSE HOVER
// ========================================

canvas.addEventListener(

    "mousemove",

    function (event) {

        const rect =
            canvas.getBoundingClientRect();


        const mouseX =

            (event.clientX - rect.left)

            *

            (canvas.width / rect.width);


        const mouseY =

            (event.clientY - rect.top)

            *

            (canvas.height / rect.height);


        const nextCircles = [];

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

                circle.size > MIN_SIZE

            ) {

                nextCircles.push(
                    ...circle.split()
                );

                changed = true;

            }

            else {

                nextCircles.push(
                    circle
                );
            }
        }


        circles =
            nextCircles;


        if (changed) {

            draw();
        }
    }
);


// ========================================
// NEXT PHOTO
// ========================================

nextButton.addEventListener(

    "click",

    function () {

        currentPhoto++;

        if (
            currentPhoto >= photos.length
        ) {

            currentPhoto = 0;
        }


        loadPhoto();
    }
);


// ========================================
// RESIZE
// ========================================

window.addEventListener(

    "resize",

    function () {

        if (currentImage) {

            setup();
        }
    }
);


// ========================================
// START
// ========================================

loadPhoto();
