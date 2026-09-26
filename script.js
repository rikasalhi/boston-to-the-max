const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const nextButton = document.getElementById("nextButton");
const photoName = document.getElementById("photoName");


// ========================================
// PHOTOS
// ========================================

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


// Smallest circle allowed
const MIN_SIZE = 3;


// Animation speed
// LOWER = slower
const ANIMATION_SPEED = 0.035;


// A circle must reach this much of its
// final size before it can split again.
const SPLIT_READY = 0.95;


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
// PREPARE PHOTO
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


    // Make image fill the artwork area
    // without stretching it.

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
// GET COLOR FROM PHOTO
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


    const red =
        imageData.data[index];


    const green =
        imageData.data[index + 1];


    const blue =
        imageData.data[index + 2];


    return `rgb(${red}, ${green}, ${blue})`;
}


// ========================================
// CIRCLE CLASS
// ========================================

class Circle {

    constructor(
        x,
        y,
        size,
        animate = true
    ) {

        this.x = x;
        this.y = y;
        this.size = size;


        // Newly created circles begin smaller
        // and smoothly grow into place.

        if (animate) {

            this.displaySize =
                size * 0.35;

        } else {

            // Starting circle appears normally.

            this.displaySize =
                size;

        }


        this.targetSize =
            size;


        this.color =
            getColor(

                x + size / 2,

                y + size / 2

            );
    }


    // ====================================
    // DRAW CIRCLE
    // ====================================

    draw() {

        // Smoothly approach final size.

        this.displaySize +=

            (
                this.targetSize -
                this.displaySize
            )

            * ANIMATION_SPEED;


        // Snap to final size when extremely close.

        if (

            Math.abs(
                this.targetSize -
                this.displaySize
            ) < 0.1

        ) {

            this.displaySize =
                this.targetSize;

        }


        const radius =
            this.displaySize / 2;


        const centerX =
            this.x +
            this.size / 2;


        const centerY =
            this.y +
            this.size / 2;


        ctx.beginPath();


        ctx.arc(

            centerX,

            centerY,

            radius,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            this.color;


        ctx.fill();

    }


    // ====================================
    // CHECK IF CURSOR IS INSIDE
    // ====================================

    contains(
        mouseX,
        mouseY
    ) {

        /*
            IMPORTANT:

            A newly created circle CANNOT
            immediately split again.

            It has to finish almost all of
            its growth animation first.
        */

        if (

            this.displaySize <

            this.targetSize *
            SPLIT_READY

        ) {

            return false;

        }


        const centerX =
            this.x +
            this.size / 2;


        const centerY =
            this.y +
            this.size / 2;


        const dx =
            mouseX -
            centerX;


        const dy =
            mouseY -
            centerY;


        /*
            Use the currently visible
            circle radius instead of the
            invisible final radius.
        */

        const radius =
            this.displaySize / 2;


        return (

            dx * dx +
            dy * dy

            <=

            radius * radius

        );
    }


    // ====================================
    // SPLIT INTO FOUR
    // ====================================

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

                half,

                true

            ),


            // TOP RIGHT

            new Circle(

                this.x + half,

                this.y,

                half,

                true

            ),


            // BOTTOM LEFT

            new Circle(

                this.x,

                this.y + half,

                half,

                true

            ),


            // BOTTOM RIGHT

            new Circle(

                this.x + half,

                this.y + half,

                half,

                true

            )

        ];
    }
}


// ========================================
// ONE BIG STARTING CIRCLE
// ========================================

function createStartingCircle() {

    circles = [];


    // Size of entire artwork.

    const size =
        Math.min(

            canvas.width * 0.72,

            canvas.height * 0.88

        );


    // Center it.

    const x =
        (canvas.width - size) / 2;


    const y =
        (canvas.height - size) / 2;


    // Starting circle does NOT animate.

    circles.push(

        new Circle(

            x,

            y,

            size,

            false

        )

    );
}


// ========================================
// DRAW EVERYTHING
// ========================================

function draw() {

    ctx.clearRect(

        0,
        0,

        canvas.width,
        canvas.height

    );


    let stillAnimating =
        false;


    for (
        const circle of circles
    ) {

        circle.draw();


        if (

            Math.abs(

                circle.displaySize -
                circle.targetSize

            ) > 0.1

        ) {

            stillAnimating =
                true;

        }
    }


    // Continue animation.

    if (stillAnimating) {

        requestAnimationFrame(
            draw
        );

    }
}


// ========================================
// HOVER
// ========================================

canvas.addEventListener(

    "mousemove",

    function (event) {

        const rect =
            canvas.getBoundingClientRect();


        // Convert mouse position to
        // canvas coordinates.

        const mouseX =

            (
                event.clientX -
                rect.left
            )

            *

            (
                canvas.width /
                rect.width
            );


        const mouseY =

            (
                event.clientY -
                rect.top
            )

            *

            (
                canvas.height /
                rect.height
            );


        const nextCircles =
            [];


        let changed =
            false;


        for (
            const circle of circles
        ) {

            if (

                circle.contains(

                    mouseX,

                    mouseY

                )

                &&

                circle.size >
                MIN_SIZE

            ) {

                // Replace hovered circle
                // with four children.

                nextCircles.push(

                    ...circle.split()

                );


                changed =
                    true;

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

            currentPhoto >=
            photos.length

        ) {

            currentPhoto =
                0;

        }


        loadPhoto();

    }
);


// ========================================
// WINDOW RESIZE
// ========================================

window.addEventListener(

    "resize",

    function () {

        if (
            currentImage
        ) {

            setup();

        }
    }
);


// ========================================
// START WEBSITE
// ========================================

loadPhoto();
