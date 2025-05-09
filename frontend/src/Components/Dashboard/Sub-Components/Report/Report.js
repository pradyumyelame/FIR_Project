import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import "./Report.css";

const FIRReport = () => {
  const location = useLocation();
  const [data, setFormData] = useState({});
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (location.state && location.state.localData) {
      setFormData(location.state.localData);
      console.log("Received data in Report:", location.state.localData);
    }
  }, [location]);

  const handleNext1 = () => {
    console.log("At the report", data);
    navigate("/fir");
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const lineHeight = 8;
    let y = 20;
  
    const addMainTitle = (text) => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const pageWidth = doc.internal.pageSize.getWidth();
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
      y += 5;
      doc.setLineWidth(0.5);
      doc.line(20, y, pageWidth - 20, y); // underline
      y += lineHeight;
    };
  
    const addTitle = (text) => {
      y += 3;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(text, 20, y);
      y += 3;
      doc.setLineWidth(0.3);
      doc.line(20, y, 190, y); // underline
      y += lineHeight;
    };
  
    const addText = (label, value) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`${label} ${value || ''}`, 20, y);
      y += lineHeight;
    };
  
    const addMultilineText = (label, value, maxWidth = 170) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
  
      const labelWidth = doc.getTextWidth(label + " ");
      const lines = doc.splitTextToSize(value || '', maxWidth - labelWidth);
  
      const firstLine = `${label} ${lines[0]}`;
      doc.text(firstLine, 20, y, { align: 'justify', maxWidth });
      y += lineHeight;
  
      for (let i = 1; i < lines.length; i++) {
        doc.text(lines[i], 20, y, { align: 'justify', maxWidth });
        y += lineHeight;
      }
    };
  
    const addTwoColumnText = (label1, value1, label2, value2, x1 = 20, x2 = 125) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`${label1}: ${value1 || ''}`, x1, y);
      doc.text(`${label2}: ${value2 || ''}`, x2, y);
      y += lineHeight;
    };
  
    // Main title
    addMainTitle("First Information Report");
  
    // FIR number and date/time
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`FIR Number: ${data.firNumber}`, 20, y);
    doc.text(`Date: ${data.date} | Time: ${data.time}`, 125, y);
    y += lineHeight;
  
    // Police Station Details
    addTitle("Police Station Details");
    addTwoColumnText("Police Station", data.policeStation, "District", data.district);
    addTwoColumnText("State", data.state, "Officer Name", data.officerName);
  
    // Complaint Details
    addTitle("Complaint Details");
    addTwoColumnText("Mode of Receiving Info", data.receivedMode, "Offense Type", data.offenseType);
    addTwoColumnText("Offense Date & Time", data.offenseDateTime, "Place of Occurrence", data.occurrencePlace);
    addMultilineText("Incident Description:", data.incidentDescription);
  
    // Complainant Details
    addTitle("Complainant Details");
    addTwoColumnText("Name:", data.complainantName, "Father/Husband Name:", data.guardianName);
    addTwoColumnText("Age:", data.age, "Gender:", data.gender);
    addTwoColumnText("Contact:", data.contact, "Email:", data.email);
    addMultilineText("Address:", data.address);
    // Legal Sections
    addTitle("Legal Sections Applied");
    addMultilineText("", data.firDraft || "None specified");
  
    // Signature section
    addTitle("Signature and Submission");
    addText("Name and Signature of Investigating Officer:", "____________________");
    addText("Rank and Badge No.:", "____________________");
    addText("Date of submission to Magistrate:", "____________________");
    addText("Seal of the Police Station:", "____________________");
  
    // Save the PDF
    doc.save("FIR_Report.pdf");
  };
  
  
  
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token"); // or however you store the JWT
      const response = await fetch(`${BACKEND_URL}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // required if your route uses `verifyToken`
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      if (response.ok) {
        alert("FIR Submitted Successfully!");
        console.log("Saved FIR:", result);
        navigate("/"); // or wherever you want to redirect
      } else {
        alert(`Submission failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting FIR:", error);
      alert("An error occurred while submitting the FIR.");
    }
  };
  
  return (
    <div className="fir-report">
      <h3 className="fir-report-title">First Information Report</h3>
      <p><strong>FIR Number:</strong> {data.firNumber}</p>
      <p><strong>Date:</strong> {data.date} | <strong>Time:</strong> {data.time}</p>

      <h3>Police Station Details</h3>
      <p><strong>Police Station:</strong> {data.policeStation}</p>
      <p><strong>District:</strong> {data.district}</p>
      <p><strong>State:</strong> {data.state}</p>
      <p><strong>Officer Name:</strong> {data.officerName}</p>

      <h3>Complaint Details</h3>
      <p><strong>Mode of Receiving Info:</strong> {data.receivedMode}</p>
      <p><strong>Offense Type:</strong> {data.offenseType}</p>
      <p><strong>Offense Date & Time:</strong> {data.offenseDateTime}</p>
      <p><strong>Place of Occurrence:</strong> {data.occurrencePlace}</p>
      <p><strong>Incident Description:</strong> {data.incidentDescription}</p>

      <h3>Complainant Details</h3>
      <p><strong>Name:</strong> {data.complainantName}</p>
      <p><strong>Father/Husband Name:</strong> {data.guardianName}</p>
      <p><strong>Age:</strong> {data.age} <strong>Gender:</strong> {data.gender}</p>
      <p><strong>Contact:</strong> {data.contact}</p>
      <p><strong>Email:</strong> {data.email}</p>
      <p><strong>Address:</strong> {data.address}</p>

      <h3>Legal Sections Applied</h3>
      <p>{data.firDraft}</p>

      <h3>Signature and Submission</h3>
      <p><strong>Name and Signature of Investigating Officer</strong></p>
      <p><strong>Rank and Badge No.</strong></p>
      <p><strong>Date of submission to Magistrate</strong></p>
      <p><strong>Seal of the Police Station</strong></p>

      <div className="text-center2">
        <button className="submit-btn" onClick={handleNext1}>Back</button>
        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="submit-btn" onClick={generatePDF}>Download</button>
      </div>
    </div>
  );
};

export default FIRReport;
