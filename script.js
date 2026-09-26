const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const nextButton = document.getElementById("nextButton");


// ------------------------------------
// BOSTON PHOTOS
// ------------------------------------

const photos = [

    {
        src: "imageswebsite/newbury.jpg",
        name: "Newbury Street"
    },

    {
        src: "imageswebsite/common.jpg",
        name: "Boston Common"
    },

    {
        src: "imageswebsite/beacon.jpg",
        name: "Beacon Hill"
    }

];


let currentPhoto = 0;

let img = new Image();

let imageData;

let circles = [];

let splitCount = 0;


// How tiny the circles can become

const MIN_SIZE = 4;


// How much exploring before NEXT appears

const SHOW_NEXT_AFTER = 250;


// ------------------------------------
// LOAD PHOTO
// ------------------------------------

function loadPhoto() {

    // Hide NEXT button again

    nextButton.classList.remove("show");


    // Reset counter

    splitCount = 0;


    // Create new image

    img = new Image();


    // Load correct photo

    img.src = photos[currentPhoto].src;


    img.onload = function () {

        setup();

    };


    img.onerror = function () {

        console.error(
            "Could not load:",
            photos[currentPhoto].src
        );

    };

}


// ------------------------------------
// SETUP CANVAS
// ------------------------------------

function setup() {

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;


    createImageData();

    createStartingGrid();

    draw();

}


// ------------------------------------
// PREPARE PHOTO
// ------------------------------------

function createImageData() {

    const tempCanvas =
        document.createElement("canvas");


    const tempCtx =
        tempCanvas.getContext("2d");


    tempCanvas.width =
        canvas.width;


    tempCanvas.height =
        canvas.height;



    // Scale photo so it fills screen

    const scale = Math.max(

        canvas.width / img.width,

        canvas.height / img.height

    );


    const width =
        img.width * scale;


    const height =
        img.height * scale;


    const x =
        (canvas.width - width) / 2;


    const y =
        (canvas.height - height) / 2;



    tempCtx.drawImage(

        img,

        x,

        y,

        width,

        height

    );



    imageData =
        tempCtx.getImageData(

            0,

            0,

            canvas.width,

            canvas.height

        );

}


// ------------------------------------
// GET COLOR FROM PHOTO
// ------------------------------------

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


// ------------------------------------
// CIRCLE CLASS
// ------------------------------------

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

        return (

            mouseX >= this.x &&

            mouseX <=
            this.x + this.size &&

            mouseY >= this.y &&

            mouseY <=
            this.y + this.size

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


// ------------------------------------
// CREATE STARTING CIRCLES
// ------------------------------------

function createStartingGrid() {

    circles = [];


    const startingSize = 256;



    for (

        let y = 0;

        y < canvas.height;

        y += startingSize

    ) {


        for (

            let x = 0;

            x < canvas.width;

            x += startingSize

        ) {


            circles.push(

                new Circle(

                    x,

                    y,

                    startingSize

                )

            );

        }

    }

}


// ------------------------------------
// DRAW CIRCLES
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
// MOUSE MOVEMENT
// ------------------------------------

canvas.addEventListener(

    "mousemove",

    function (event) {


        const mouseX =
            event.clientX;


        const mouseY =
            event.clientY;



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


                splitCount++;


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



        // Reveal NEXT after enough interaction

        if (
            splitCount >= SHOW_NEXT_AFTER
        ) {

            nextButton.classList.add(
                "show"
            );

        }

    }

);


// ------------------------------------
// NEXT PHOTO
// ------------------------------------

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


// ------------------------------------
// RESIZE WINDOW
// ------------------------------------

window.addEventListener(

    "resize",

    function () {

        setup();

    }

);


// ------------------------------------
// START WEBSITE
// ------------------------------------

loadPhoto();
