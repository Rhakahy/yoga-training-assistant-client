import { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Form, Button } from "react-bootstrap";
export default function App() {
  const [response, setResponse] = useState("");
  const [filename, setFilename] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [status, setStatus] = useState("Klik untuk upload");

  const mainRef = useRef(null);
  const resultRef = useRef(null);
  const uploadRef = useRef();
  const getResponseRef = useRef();
  const formButtonRef = useRef();
  const statusRef = useRef();

  const handleUpload = (e) => {
    uploadRef.current.click();
  };

  useEffect(() => {
    if (isUpload) {
      getResponseRef.current.click();
    }
  }, [isUpload]);

  useEffect(() => {
    if (!isSubmitted) {
      resultRef.current.style.opacity = 0;
      mainRef.current.style.left = "25%";
    } else {
      resultRef.current.style.opacity = 1;
      mainRef.current.style.left = "7%";
      setImgUrl(`http://192.168.18.14:5000/getImage?filename=${filename}`);
    }
  }, [isSubmitted, filename]);

  const handleInputChange = (e) => {
    if (e.target.files[0]) {
      formButtonRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpload(false);
    setStatus("Uploading...");
    const formData = new FormData(e.target);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://192.168.18.14:5000/upload");
    await xhr.send(formData);

    xhr.onload = () => {
      setFilename(JSON.parse(xhr.responseText).filename);
      setIsUpload(true);
      setStatus("Uploaded successfully");
    };
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setIsUpload(false);
    setFilename("");
    setImgUrl("");
    setStatus("Klik untuk upload");
  };

  const getResponse = async () => {
    await fetch("http://192.168.18.14:5000/getResponse?filename=" + filename)
      .then((res) => res.text())
      .then((data) => {
        const resp = data.split("-splitter-");
        setResponse({
          label: resp[0],
          probability: resp[1],
        });
        setIsSubmitted(true);
      });
  };

  return (
    <div className="main">
      <div
        className="main-container"
        ref={mainRef}
        onMouseOver={() => {
          setStatus("Klik untuk upload");
          mainRef.current.style.transform = "scale(1.02)";
          mainRef.current.style.backgroundColor = "var(--bs-light)";
          statusRef.current.style.color = "var(--bs-dark)";
        }}
        onMouseLeave={() => {
          mainRef.current.style.transform = "scale(1)";
          mainRef.current.style.backgroundColor = "var(--bs-cyan)";
          statusRef.current.style.color = "var(--bs-light)";
        }}
      >
        <div className="input-form">
          <form
            method="POST"
            action={"http://192.168.18.14:5000/upload"}
            id="form"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
          >
            <Form.Control
              ref={uploadRef}
              type="file"
              name="file"
              id="file"
              style={{ height: "100%", width: "100%", visibility: "hidden" }}
              onChange={handleInputChange}
            />
            <button
              ref={formButtonRef}
              type="submit"
              style={{ display: "none" }}
            />
          </form>
          <div className="input-placeholder" onClick={handleUpload}>
            <h3 ref={statusRef} style={{ color: "var(--bs-light)" }}>
              {status}
            </h3>
          </div>
        </div>
        <div>
          <button
            style={{ display: "none" }}
            onClick={getResponse}
            ref={getResponseRef}
          >
            Get Response
          </button>
        </div>
      </div>
      <div className="result-container p-3" ref={resultRef}>
        <h4 style={{ textAlign: "center" }}>Detection</h4>
        <div className="result-content" style={{ textAlign: "center" }}>
          <img
            style={{
              maxWidth: "90%",
              maxHeight: "90%",

              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "10px",
            }}
            className="mx-auto"
            src={imgUrl}
            alt="result"
          />
          <div className="result-label mt-3">
            <h5>Pose Yoga</h5>
            <p>{response.label}</p>
          </div>
          <div className="result-probability">
            <h5>Akurasi</h5>
            <p>{(response.probability * 100).toFixed(2)}%</p>
          </div>
        </div>
        <Button
          variant="outline-info"
          className="reset-button"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
