const modelPath = '/global/vendor/face-api/weights'
//// ssd_mobilenetv1 options
let minConfidence = 0.5
//
//// tiny_face_detector options
let inputSize = 512
let scoreThreshold = 0.5
//
//new faceapi.TinyFaceDetectorOptions({inputSize, scoreThreshold})
//
//async function updateInputImg() {
//    await faceapi.nets.tinyFaceDetector.loadFromUri('/global/vendor/face-api/weights')
//    const inputImgEl = $('#refImg').get(0)
//    const results = await faceapi
//            .detectAllFaces(inputImgEl)
//            .withFaceLandmarks()
//            .withFaceDescriptors()
//}
//
//updateInputImg()

let faceMatcher = null
//
//async function uploadRefImage(e) {
//    const imgFile = $('#refImgUploadInput').get(0).files[0]
//    const img = await faceapi.bufferToImage(imgFile)
//    $('#refImg').get(0).src = img.src
//    updateReferenceImageResults()
//}
//
//async function loadRefImageFromUrl(url) {
//    const img = await requestExternalImage($('#refImgUrlInput').val())
//    $('#refImg').get(0).src = img.src
//    updateReferenceImageResults()
//}
//
//async function uploadQueryImage(e) {
//    const imgFile = $('#queryImgUploadInput').get(0).files[0]
//    const img = await faceapi.bufferToImage(imgFile)
//    $('#queryImg').get(0).src = img.src
//    updateQueryImageResults()
//}
//
//async function loadQueryImageFromUrl(url) {
//    const img = await requestExternalImage($('#queryImgUrlInput').val())
//    $('#queryImg').get(0).src = img.src
//    updateQueryImageResults()
//}
//
async function updateReferenceImageResults() {
    const inputImgEl = $('#refImg').get(0)
    const canvas = $('#refImgOverlay').get(0)

    const fullFaceDescriptions = await faceapi
            .detectAllFaces(inputImgEl, new faceapi.SsdMobilenetv1Options({ minConfidence }))
            .withFaceLandmarks()
            .withFaceDescriptors()

    if (!fullFaceDescriptions.length) {
        return
    }

    // create FaceMatcher with automatically assigned labels
    // from the detection results for the reference image
    faceMatcher = new faceapi.FaceMatcher(fullFaceDescriptions)

//    return

    faceapi.matchDimensions(canvas, inputImgEl)
    // resize detection and landmarks in case displayed image is smaller than
    // original size
    const resizedResults = faceapi.resizeResults(fullFaceDescriptions, inputImgEl)
    // draw boxes with the corresponding label as text
    const labels = faceMatcher.labeledDescriptors
            .map(ld => ld.label)
    resizedResults.forEach(({ detection, descriptor }) => {
        const label = faceMatcher.findBestMatch(descriptor).toString()
        const options = {label}
        const drawBox = new faceapi.draw.DrawBox(detection.box, options)
        drawBox.draw(canvas)
    })    
}


async function updateQueryImageResults() {
    if (!faceMatcher) {
        return
    }

    const inputImgEl = $('#queryImg').get(0)
    const canvas = $('#queryImgOverlay').get(0)

    const results = await faceapi
            .detectAllFaces(inputImgEl, new faceapi.SsdMobilenetv1Options({ minConfidence }))
            .withFaceLandmarks()
            .withFaceDescriptors()

    faceapi.matchDimensions(canvas, inputImgEl)
//    return
    // resize detection and landmarks in case displayed image is smaller than
    // original size
    const resizedResults = faceapi.resizeResults(results, inputImgEl)

    resizedResults.forEach(({ detection, descriptor }) => {
        const label = faceMatcher.findBestMatch(descriptor).toString()
        const options = {label}
        const drawBox = new faceapi.draw.DrawBox(detection.box, options)
        drawBox.draw(canvas)
    })
}
//
async function updateResults() {
    await updateReferenceImageResults()
    await updateQueryImageResults()
}
//
async function run() {
//    // load face detection, face landmark model and face recognition models
////    await changeFaceDetector(selectedFaceDetector)
//    await faceapi.loadFaceLandmarkModel('/global/vendor/face-api/weights')
//    await faceapi.loadFaceRecognitionModel('/global/vendor/face-api/weights')
    await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
    await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath)
    await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath)
    updateResults()
//    const inputImgEl = $('#refImg').get(0)
//    const fullFaceDescriptions = await faceapi
//            .detectAllFaces(inputImgEl, new faceapi.TinyFaceDetectorOptions({inputSize, scoreThreshold}))
//            .withFaceLandmarks()
//            .withFaceDescriptors()
//    
//    const inputImgEl = $('#queryImg').get(0)
}
//
$(document).ready(function () {
////    renderNavBar('#navbar', 'face_recognition')
////    initFaceDetectionControls()
    run()    
//    updateReferenceImageResults()
})