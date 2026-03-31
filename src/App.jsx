import { useState } from 'react';
import './App.css';
import APIForm from './components/APIForm';
import Gallery from './components/Gallery';

const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

const App = () => {
  const [inputs, setInputs] = useState({
    url: "",
    format: "",
    no_ads: "",
    no_cookie_banners: "",
    width: "",
    height: "",
  });

  // 1. New state variable to hold the final screenshot image URL
  const [currentImage, setCurrentImage] = useState(null);
  const [prevImages, setPrevImages] = useState([]);
  const [quota, setQuota] = useState(null); // <-- NEW QUOTA STATE

  // 2. Helper to clear the form after a successful API call
  const reset = () => {
    setInputs({
      url: "",
      format: "",
      no_ads: "",
      no_cookie_banners: "",
      width: "",
      height: "",
    });
  }

  const getQuota = async () => {
    const response = await fetch(`https://api.apiflash.com/v1/urltoimage/quota?access_key=${ACCESS_KEY}`);
    const result = await response.json();
    setQuota(result);
  }

  // 3. The async function to fetch the screenshot from the ApiFlash server
  const callAPI = async (query) => {
    const response = await fetch(query);
    const json = await response.json();
    
    if (json.url == null) {
      alert("Oops! Something went wrong with that query, let's try again!");
    } else {
      setCurrentImage(json.url);
      setPrevImages((images) => [...images, json.url]); // <-- ADD THIS LINE
      reset();
      getQuota();
    }
  }

  // 4. Assembles the massive URL string to send to ApiFlash
  const makeQuery = (url, format, width, height, no_cookie_banners, no_ads) => {
    let wait_until = "network_idle";
    let response_type = "json";
    let fail_on_status = "400%2C404%2C500-511";
    let url_starter = "https://";
    let fullURL = url_starter + url; // <-- Using the passed 'url'

    // Notice we use the passed variables here instead of 'inputs.format', etc.
    let query = `https://api.apiflash.com/v1/urltoimage?access_key=${ACCESS_KEY}&url=${fullURL}&format=${format}&width=${width}&height=${height}&no_cookie_banners=${no_cookie_banners}&no_ads=${no_ads}&wait_until=${wait_until}&response_type=${response_type}&fail_on_status=${fail_on_status}`;

    callAPI(query).catch(console.error);
  }

  // 5. Handles the click event from the form button
  const submitForm = () => {
    let defaultValues = {
      format: "jpeg",
      no_ads: "true",
      no_cookie_banners: "true",
      width: "1920",
      height: "1080",
    };

    if (inputs.url === "" || inputs.url === " ") {
      alert("You forgot to submit a url!");
    } else {
      // 1. Create a brand new copy of the inputs object
      const updatedInputs = { ...inputs };

      // 2. Loop through our COPY and add the default values
      for (const [key, value] of Object.entries(updatedInputs)) {
        if (value === "") {
          updatedInputs[key] = defaultValues[key];
        }
      }
      
      // 3. Overwrite the old state with our new, completed copy
      setInputs(updatedInputs);
      // Pass the data directly into the function so it doesn't have to wait for state to update!
      makeQuery(
        updatedInputs.url,
        updatedInputs.format,
        updatedInputs.width,
        updatedInputs.height,
        updatedInputs.no_cookie_banners,
        updatedInputs.no_ads
      );
    }
  };

  return (
    <div className="whole-page">
      <h1>Build Your Own Screenshot! 📸</h1>

      {/* NEW QUOTA DISPLAY */}
      {quota ? (
        <p className="quota">
          Remaining API calls: {quota.remaining} out of {quota.limit}
        </p>
      ) : (
        <p></p>
      )}
      
      <APIForm
        inputs={inputs}
        handleChange={(e) =>
          setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value.trim(),
          }))
        }
        onSubmit={submitForm}
      />

      {/* 6. Conditional rendering: Only show this div if we actually have an image */}
      {currentImage ? (
        <img
          className="screenshot"
          src={currentImage}
          alt="Screenshot returned"
        />
      ) : (
        <div> </div>
      )}

      {/* 7. Shows the user exactly what parameters they are sending to the API */}
      <div className="container">
        <h3> Current Query Status: </h3>
        <p>
          https://api.apiflash.com/v1/urltoimage?access_key=ACCESS_KEY
          <br></br>
          &url={inputs.url} <br></br>
          &format={inputs.format} <br></br>
          &width={inputs.width}
          <br></br>
          &height={inputs.height}
          <br></br>
          &no_cookie_banners={inputs.no_cookie_banners}
          <br></br>
          &no_ads={inputs.no_ads}
          <br></br>
        </p>
        <br></br>
        {/* Add the Gallery right here! */}
        <div className="container">
          <Gallery images={prevImages} />
        </div>
      </div>

    </div>
  );
}

export default App;