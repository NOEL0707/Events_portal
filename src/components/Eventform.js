import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
// import MultiSelect from "react-multi-select-component";
import Select from "react-select";
import uuid from "react-uuid";
import axios from "axios";
import Auth from "./auth";
import "../styles/Teamupform.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Loader from "./Loader";
import address from "./address";

const Dropdown = (props) => {
  const options = [
    { label: "InfoSec", value: "InfoSec" },
    { label: "DSC", value: "DSC" },
    { label: "Alpha", value: "Alpha" },
    { label: "ArchiTech", value: "ArchiTech" },
    { label: "E&R", value: "E&R" },
    { label: "Go Myno", value: "Go Myno" },
    { label: "Team Steel-X", value: "Team Steel-X" },
    { label: "M-Dash", value: "M-Dash" },
    { label: "None", value: "None" },
  ];
  const club = props.club;
  const setclub = props.setclub;
  console.log(club);
  const style = {
    control: (base) => ({
      ...base,
      border: 0,
      boxShadow: "none",
    }),
  };

  return (
    <span>
      <Select
        className="select"
        options={options}
        value={club}
        onChange={setclub}
        styles={style}
      />
    </span>
  );
};

const FilesUploader = (props) => {
  let updateFileList = props.updateFileList;
  let fileList = props.fileList;

  //Validations
  const NoOfFilesValidation = (len) => {
    if (len > 5) {
      const msg = "Only 5 files can be uploaded at a time";
      alert(msg);
      return false;
    }
    return true;
  };

  const wrongFileExtensions = (filesList) => {
    //define message container
    let err = "";
    // list allow mime type
    const types = [
      "image/png",
      "image/jpeg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    // loop access array
    for (let x = 0; x < filesList.length; x++) {
      // compare file type find doesn't matach
      if (types.every((type) => filesList[x].type !== type)) {
        // create error message and assign to container
        err += filesList[x].type + " is not a supported format\n";
      }
    }

    if (err !== "") {
      // if message not same old that mean has error
      alert(err);
      return false;
    }
    return true;
  };

  const harmfulFiles = (filesList) => {
    let err = "";
    for (let i = 0; i < filesList.length; i++) {
      let arr = fileList[i].name.split(".");
      if (arr.length > 2) err += filesList[i].name + " is not allowed";
    }
    if (err !== "") {
      alert(err);
      return false;
    }
    return true;
  };

  const checkFileSize = (files) => {
    let size = 5 * 1024 * 1024; //5MB
    let err = "";
    for (var x = 0; x < files.length; x++) {
      if (files[x].size > size) {
        err += files[x].type + "is too large, please pick a smaller file\n";
      }
    }
    if (err !== "") {
      alert(err);
      return false;
    }
    return true;
  };

  const onNewFiles = (filesList) => {
    if (
      NoOfFilesValidation(filesList.length) &&
      wrongFileExtensions(filesList) &&
      harmfulFiles(fileList) &&
      checkFileSize(filesList)
    ) {
      filesList.map((file) => (file.id = uuid()));
      //let newList=fileList;
      if (fileList.length === 0) {
        updateFileList(filesList);
      } else {
        let arr = [];
        for (let i = 0; i < fileList.length; i++) {
          arr.push(fileList[i]);
        }

        for (let i = 0; i < filesList.length; i++) {
          let isThere = false;
          for (let j = 0; j < fileList.length; j++) {
            if (filesList[i].name === fileList[j].name) {
              isThere = true;
              break;
            }
          }
          if (!isThere) {
            arr.push(filesList[i]);
          }
        }
        updateFileList(arr);
      }

      //updateFileList(newList);
    }
  };

  const deleteFile = (delId) => {
    let arr = [];

    for (let ind = 0; ind < fileList.length; ind++) {
      if (fileList[ind].id !== delId) {
        arr.push(fileList[ind]);
      }
    }
    updateFileList(arr);
  };
  // console.log(date);
  return (
    <div
      className="forminput"
      style={{ flexDirection: "column", textAlign: "center" }}
    >
      <label htmlFor="files" style={{ width: "100%", fontSize: "x-large" }}>
        Add files related to the Event :
      </label>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <input
          type="file"
          value=""
          title="&nbsp;"
          id="files"
          name="files"
          multiple={true}
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => {
            onNewFiles(Array.from(e.target.files));
          }}
          style={{ height: "25px", margin: "auto", width: "25%" }}
        />
        <div className="filediv">
          {fileList.map((file) => {
            return (
              <div key={file.id} className="filebox">
                <p className="filename">{file.name}</p>
                <button
                  type="button"
                  className="cancel"
                  onClick={() => {
                    deleteFile(file.id);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} size="2x" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const InternshipForm = () => {
  let [fileList, updateFileList] = useState([]);
  let [EventTitle, setEventTitle] = useState("");
  let [venue, setvenue] = useState("");
  //   let [stipend, setStipend] = useState("");
  const [club, setclub] = useState(""); //branches data
  let [deadline, setDeadline] = useState();
  let [description, setDescription] = useState("");
  // let [duration, setDuration] = useState("");
  let history = useHistory();
  const [btn_disable, setbtn_disable] = useState(false);
  let [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  let [toDate, setToDate] = useState("");
  let lengthValidation = (strng, maxlen) => {
    if (strng.length > maxlen) return false;
    return true;
  };

  let maxLen1 = 50;
  let maxLen2 = 200;
  useEffect(() => {
    if (!lengthValidation(EventTitle, maxLen1)) {
      alert(`Only ${maxLen1} characters allowed`);
      setEventTitle(EventTitle.slice(0, maxLen1));
    }

    if (!lengthValidation(venue, maxLen1)) {
      alert(`Only ${maxLen1} characters allowed`);
      setvenue(venue.slice(0, maxLen1));
    }
    if (!lengthValidation(description, maxLen2)) {
      alert(`Only ${maxLen2} characters allowed`);
      setDescription(description.slice(0, maxLen2));
    }
    let d1 = new Date(fromDate);
    let d2 = new Date(toDate);
    console.log(new Date());
    if (fromDate.length === toDate.length && fromDate.length > 1) {
      if (d1 >= d2) {
        alert("To date must be after from date");
        setFromDate("");
        setToDate("");
      }
    }
    if (fromDate.length !== toDate.length) {
      if (d1 < new Date()) {
        alert("From date and time must be greater than current date and time");
        setFromDate("");
      }
      if (d2 < new Date()) {
        alert("To date and time must be greater than current date and time");
        setToDate("");
      }
    }
  }, [EventTitle, venue, description, maxLen1, maxLen2, fromDate, toDate]);
  // console.log("input date", Date.parse(date), typeof Date.parse(date));
  // console.log("present data time", new Date(), typeof Date());
  const onSubmitHandler = async (e) => {
    console.log("inside sumbit");
    setbtn_disable(true);
    setIsLoading(false);
    e.preventDefault();
    //Checking if branches array is empty
    // if (club.length === "") alert("Atleast 1 Branch need to be club");
    // let branchesclub = [];
    // for (let i = 0; i < club.length; i++) {
    //   branchesclub.push(club[i].value);
    // }
    let data = new FormData();
    data.append("eventtitle", EventTitle);
    data.append("venue", venue);
    data.append("fromdate", fromDate);
    data.append("todate", toDate);
    data.append("club", club.value);
    data.append("deadline", deadline);
    data.append("description", description);
    for (let i = 0; i < fileList.length; i++) data.append("files", fileList[i]);
    console.log("sending event");
    axios
      .post(`http://${address.ip}:4444/events/submit`, data, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          "Access-Control-Allow-Credentials": true,
        },
      })
      .then((res) => {
        if (res.data !== "notloggedin") {
          Auth.login();
          history.push("/myposts");
        } else {
          setbtn_disable(false);
        }
      });
  };
  if (isLoading) {
    return (
      <div>
        <form className="Form" onSubmit={onSubmitHandler}>
          <div className="Title">
            <p>Event Form</p>
          </div>
          <div className="forminput">
            <label htmlFor="intTitle">
              Event Title <span style={{ color: "red" }}>*</span>{" "}
            </label>
            <input
              className="input"
              type="text"
              id="intTitle"
              name="intTitle"
              value={EventTitle}
              onChange={(e) => {
                setEventTitle(e.target.value);
              }}
              required
              placeholder="Coding challenge"
            />
          </div>

          <div className="forminput">
            <label htmlFor="venue">
              Venue <span style={{ color: "red" }}>*</span>
            </label>
            <input
              className="input"
              type="text"
              id="venue"
              name="venue"
              value={venue}
              onChange={(e) => {
                setvenue(e.target.value);
              }}
              required
              placeholder="LH1"
            />
          </div>

          <div className="forminput" style={{ boxSizing: "border-box" }}>
            <label htmlFor="branches">Club</label>
            <div
              style={{ width: "70%", marginTop: "auto", marginRight: "auto" }}
            >
              <Dropdown
                club={club}
                setclub={setclub}
                style={{ padding: "0px" }}
              />
            </div>
          </div>

          <div className="forminput">
            <label htmlFor="duration">
              {" "}
              <u>Event Duration </u>
            </label>
            {/* <input
              className="input"
              type="text"
              id="duration"
              name="duration"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
              }}
            /> */}
            {/* </div> */}

            {/* <div className="forminput"> */}
            <label htmlFor="fromDate">
              From: <span style={{ color: "red" }}>*</span>{" "}
            </label>
            <input
              className="input"
              type="datetime-local"
              id="fromDate"
              name="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
            {/* {console.log(date)} */}
            {/* </div> */}
            {/* <div className="forminput"> */}
            <label htmlFor="toDate">
              To: <span style={{ color: "red" }}>*</span>{" "}
            </label>
            <input
              className="input"
              type="datetime-local"
              id="toDate"
              name="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
            />
          </div>
          <div className="forminput">
            <label htmlFor="deadline">Deadline:</label>
            <input
              className="input"
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="forminput">
            <label htmlFor="description">Event Description </label>
            <textarea
              name="description"
              id="description"
              cols="75"
              rows="75"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              style={{
                width: "100%",
                height: "250px",
                resize: "none",
                marginRight: "auto",
              }}
              placeholder="Any additional details and Links here"
            ></textarea>
          </div>

          <FilesUploader
            fileList={fileList}
            updateFileList={updateFileList}
            style={{ display: "flex" }}
          />
          <div className="btndiv">
            <button className="btn" type="submit" disabled={btn_disable}>
              Submit
            </button>
          </div>
        </form>
      </div>
    );
  } else {
    return <Loader />;
  }
};

export default InternshipForm;
