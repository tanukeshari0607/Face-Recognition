const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn1 = document.getElementById('captureBtn1');
const captureBtn2 = document.getElementById('captureBtn2');
const fileInput = document.getElementById('fileInput');
//const uploadBtn = document.getElementById('uploadBtn');
const resultDiv = document.getElementById('result');
const messageDiv = document.getElementById('message');

let capturedDetails;
let isFaceDetected = false;
let descriptors = { desc1: null, desc2: null };
const threshold = 0.4;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo);      

async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
    } catch (err) {
        console.error(err);
    }
}

video.addEventListener('play', () => {
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);                               //To draw facial landmarks
        isFaceDetected = detections.length > 0;
        if(!isFaceDetected){
            showMessage("No Face Detected");
        }
        else{
            hideMessage();
        }
    }, 100);
});

captureBtn1.addEventListener('click', () => {
    captureImage1();
});
captureBtn2.addEventListener('click', () => {
    captureImage2();
});

function captureImage1() {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const ctx = captureCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    console.log("Image Resolution" + captureCanvas.width + "x" + captureCanvas.height);
    faceapi.detectAllFaces(captureCanvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions()
        .then(detections => {
            if(detections.length > 1){
                console.log(resultDiv.textContent = "Multiple faces detected in Image");
            }
            else if(detections.length === 1 && detections[0].landmarks){
                console.log('Captured Image1 Details:', detections);
                capturedDetails = detections;
                descriptors.desc1 = detections[0]?.descriptor; // Assuming there is only one face in the captured image
                updateResult();
            }
            else{
                console.log(resultDiv.textContent = "Not able to detect face in Image")
            }
        });
}

function captureImage2() {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const ctx = captureCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    faceapi.detectAllFaces(captureCanvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions()
        .then(detections => {
            if(detections.length > 1){
                console.log(resultDiv.textContent = "Multiple face detected in Image");
            }
            else if(detections.length === 1 && detections[0].landmarks) {
                console.log('Captured Image2 Details:', detections);
                capturedDetails = detections;
                descriptors.desc2 = detections[0]?.descriptor; // Assuming there is only one face in the captured image
                updateResult();
            }
            else{
                console.log(resultDiv.textContent = "No face detected in Image");
            }
        });
}

function updateResult() {
    if (descriptors.desc1 && descriptors.desc2) {
        const distance = faceapi.utils.round(faceapi.euclideanDistance(descriptors.desc1, descriptors.desc2));
        let text = distance;
        let bgColor = '#ffffff';
        let matchResult = '';

        if (distance > threshold) {
            text += ' (no match)';
            bgColor = '#ce7575';
            matchResult = 'Images Do Not Match!';
        } else {
            text += ' (match)';
            bgColor = '#75ce75';
            matchResult = 'Images Match!';
        }

        resultDiv.textContent = text;
        resultDiv.style.backgroundColor = bgColor;

        // Display the result in the console
        console.log(matchResult);
    }
}

function showMessage(msg){
    messageDiv.textContent = msg;
    messageDiv.style.visibility = 'visible';
}

function hideMessage(){
    messageDiv.style.visibility = 'hidden';
}
//Below code can be used for uploaded images

        // uploadBtn.addEventListener('click', () => {
        //     const uploadedImage = fileInput.files[0];
        //     if (uploadedImage) {
        //         processUploadedImage(uploadedImage);
        //     } else {
        //         console.error('Please select an image to upload.');
        //     }
        // });

        // function processUploadedImage(uploadedImage) {
        //     const reader = new FileReader();
        //     reader.onload = function (e) {
        //         const img = new Image();
        //         img.src = e.target.result;

        //         img.onload = function () {
        //             const uploadCanvas = document.createElement('canvas');
        //             uploadCanvas.width = img.width;
        //             uploadCanvas.height = img.height;
        //             const ctx = uploadCanvas.getContext('2d');
        //             ctx.drawImage(img, 0, 0, uploadCanvas.width, uploadCanvas.height);
        //             console.log("Image Resolution" + uploadCanvas.width + "x" + uploadCanvas.height);
        //             if (uploadCanvas.width >= 400 && uploadCanvas.height >= 400) {
        //                 deferred.resolve(true);
        //             } else {
        //                 alert("The image resolution is too low.");
        //                 deferred.resolve(false);
        //             }
        //             debugger;
        //             faceapi.detectAllFaces(uploadCanvas, new faceapi.TinyFaceDetectorOptions())
        //                 .withFaceLandmarks()
        //                 .withFaceDescriptors()
        //                 .withFaceExpressions()
        //                 .then(detections => {
        //                     console.log('Uploaded Image Details:', detections);
        //                     descriptors.desc2 = detections[0]?.descriptor; // Assuming there is only one face in the uploaded image
        //                     updateResult();
        //                 });
        //         };
        //     };

        //     reader.readAsDataURL(uploadedImage);
        // }
