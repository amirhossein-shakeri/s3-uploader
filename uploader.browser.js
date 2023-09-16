"use-strict"

console.log(`Initializing S3 Browser Uploader...`)

export const upload = (url, fields, file) => {
  console.log(`Uploading {} to {}...`)

  const formData = new FormData()
  Object.keys(fields).forEach(k => {
    console.log(`\t> Appending field [${k}] : ${fields[k]}`)
    formData.append(k, fields[k])
  })
  console.log(`\t> Appending file: `, file)
  formData.append("file", file)

  setStatus("Uploading...")
  return fetch(url, {
    method: "POST",
    body: formData,
  })
    .then(response => {
      if (!response.ok) {
        console.warn(`Failed to upload file: response is not OK`, response)
        setStatus("Failed")
        return
      }
      console.log(`Successfully uploaded {} to S3 on {}`)
      setStatus("Success")
    })
    .catch(err => {
      console.warn(`Failed to upload file: Failed to send request: `, err)
      setStatus("Failed")
      return err
    })
}

export const getPresignedPostAndUpload = async (
  endpoint,
  method = "POST",
  body = {}
) => {
  console.log(`Getting presigned post info from {}...`)
  setStatus("Getting presigned post...")
  const data = await fetch(endpoint, {
    method,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => response.json())
    .catch(err => {
      console.warn(`Failed to get presigned post from the endpoint: `, err)
      setStatus("Fail")
      return null
    })
  console.log("DATA: ", data)
  const uploadResult = await upload(
    data.url,
    data.fields,
    document.getElementById("file-input").files[0]
  )
  console.log("UPLOAD Result: ", uploadResult)
  setStatus("Success")
}

export const setStatus = async status => {
  const statusContainer = document.getElementById("status")
  statusContainer.innerHTML = status
}

console.log(`Adding event listeners`)
const ENDPOINT = "http://localhost:9000/media/"
document.getElementById("upload-button").addEventListener("click", async () => {
  console.log(`Button has been clicked`)
  getPresignedPostAndUpload(ENDPOINT, "POST", {
    fileName: "s3-browser.jpg",
    displayName: "S3 Browser Uploader",
    contentType: "image/jpg",
  })
})

console.log(`Initialized S3 Browser Uploader Successfully`)
