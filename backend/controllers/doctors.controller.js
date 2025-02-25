import doctorModel from "../models/doctors.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointment.model.js";
const changeAvailability = async (req, res) => {
  try {
    const { doctorId } = req.body;

    const doctorData = await doctorModel.findById(doctorId);

    await doctorModel.findByIdAndUpdate(doctorId, {
      available: !doctorData.available,
    });

    res
      .status(200)
      .json({ success: true, message: "Doctor availability changed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login doctor
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    // Check if password is correct
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }
    // Create and send JWT token
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
    res.json({
      success: true,
      message: "Doctor logged in successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// get doctor appointment for doctor panel
const getDoctorAppointments = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark appointment as completed
const appointmentCompleted = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    // find the appointment data using the appointment id
    const appointmentData = await appointmentModel.findById(appointmentId);
    // check if the appointment belongs to the doctor
    if (appointmentData && appointmentData.docId === docId) {
      // make the appointment completed boolean to true
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      // return success response
      return res
        .status(200)
        .json({ success: true, message: "Appointment completed" });
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to complete this appointment",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// To cancel the appointment by doctor
const appointmentCancelled = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    // find the appointment data using the appointment id
    const appointmentData = await appointmentModel.findById(appointmentId);
    // check if the appointment belongs to the doctor
    if (appointmentData && appointmentData.docId === docId) {
      // make the appointment completed boolean to true
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      // return success response
      return res
        .status(200)
        .json({ success: true, message: "Appointment cancelled" });
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to cancel this appointment",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({docId})
    // Total earnings
    let earnings = 0;
    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });
    // Total patients
    let patients = [];
    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashboardData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5)
    }
    res.status(200).json({ success: true, dashboardData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get doctor profile
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    // find the doctor
    const docProfileData = await doctorModel.findById(docId).select("-password");
    if (!docProfileData) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    // return the doctor profile
    return res.status(200).json({ success: true, docProfileData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body;
    await doctorModel.findByIdAndUpdate(docId, {fees, address, available})
    // update doctor profile
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    // Cleanup: Remove file if Cloudinary upload fails
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList,
  loginDoctor,
  getDoctorAppointments,
  appointmentCompleted,
  appointmentCancelled,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile
};
