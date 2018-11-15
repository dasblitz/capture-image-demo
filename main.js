function captureImage(input) {
  const img = input.files[0]

  // get the exif data to figure out orientation
  EXIF.getData(img, function() {
    const allMetaData = EXIF.getAllTags(this)
    const allMetaDataSpan = document.getElementById('allMetaDataSpan')
    allMetaDataSpan.innerHTML = JSON.stringify(allMetaData, null, '\t')
    const exifOrientation = parseInt(allMetaData.Orientation, 10)
    displayImage(img, exifOrientation)
  })
}

function displayImage(file, exifOrientation) {
  const reader = new FileReader()

  reader.onload = function(e) {
    const dataURL = e.target.result
    const canvas = document.querySelector('canvas')
    const img = new Image()
    const landscape = isLandscape(exifOrientation)

    img.onload = function() {
      canvas.width = landscape ? img.width : img.height
      canvas.height = landscape ? img.height : img.width
      drawRotated(img, exifOrientation, canvas)
      console.log(canvas.toDataURL('image/jpeg'))
    }

    img.src = dataURL
  }

  reader.readAsDataURL(file)
}

function isLandscape(exifOrientation) {
  // assuming orientations will be one of 1, 3, 6, 8
  // as explained here: https://www.impulseadventure.com/photo/exif-orientation.html
  return exifOrientation < 4
}

function getDegreesForExifOrientation(exifOrientation) {
  switch (exifOrientation) {
    case 6:
      return 90
    case 8:
      return -90
    case 3:
      return 180
    default:
      return 0
  }
}

// Draws an image on a canvas taking into account the exif orientation
function drawRotated(img, exifOrientation, canvas) {
  const context = canvas.getContext('2d')
  const degrees = getDegreesForExifOrientation(exifOrientation)
  context.clearRect(0, 0, canvas.width, canvas.height)

  // save the unrotated context of the canvas so we can restore it later
  // the alternative is to untranslate & unrotate after drawing
  context.save()

  // move to the center of the canvas
  context.translate(canvas.width / 2, canvas.height / 2)

  // rotate the canvas to the specified degrees
  context.rotate((degrees * Math.PI) / 180)

  // draw the image
  // since the context is rotated, the image will be rotated also
  context.drawImage(img, -img.width / 2, -img.height / 2)

  // we’re done with the rotating so restore the unrotated context
  context.restore()
}
