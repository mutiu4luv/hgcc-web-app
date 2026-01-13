import {
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentPaymentProof() {
  const { courseId } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleSubmitProof = async () => {
    if (!file) {
      setMessage("Please upload payment proof");
      return;
    }

    const formData = new FormData();
    formData.append("proof", file);
    formData.append("courseId", courseId);

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}/api/self-learning/payment/proof`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res.data);
      setMessage("✅ Payment proof submitted. Await admin approval.");
      navigate("/student/dashboard");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage(
        err.response?.data?.message || "Failed to submit payment proof"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" color="green" fontWeight="bold">
        💳 Payment Proof
      </Typography>

      <Typography sx={{ mt: 2 }}>Make payment to:</Typography>

      <Typography fontWeight="bold">
        Sterling Bank — 0102263405
        <br />
        Name: HGSC2 DIGITAL SKILLS
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Upload proof of payment (image / PDF / document):
      </Typography>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginTop: 10 }}
      />

      <Button
        sx={{ mt: 3 }}
        variant="contained"
        color="success"
        fullWidth
        disabled={loading}
        onClick={handleSubmitProof}
      >
        {loading ? <CircularProgress size={24} /> : "Submit Proof"}
      </Button>

      {message && <Alert sx={{ mt: 2 }}>{message}</Alert>}
    </Paper>
  );
}
