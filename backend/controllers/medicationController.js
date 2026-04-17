const db = require("../config/db");

// Get all medications for a user
const getMedications = (req, res) => {
    const userId = req.user.id;
    const query = "SELECT * FROM medications WHERE user_id = ?";

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching medications:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
    });
};

// Add a new medication
const addMedication = (req, res) => {
    const userId = req.user.id;
    const { name, dosage, time, remaining_tablets, total_tablets } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Medication name is required" });
    }

    const query = "INSERT INTO medications (user_id, medicine_name, dosage, time, remaining_tablets, total_tablets) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [userId, name, dosage, time, remaining_tablets, total_tablets];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error adding medication:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(201).json({ message: "Medication added successfully", id: result.insertId });

    });
};

// Update a medication
const updateMedication = (req, res) => {
    const userId = req.user.id;
    const medicationId = req.params.id;
    const { name, dosage, time, remaining_tablets, total_tablets } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Medication name is required" });
    }

    const query = "UPDATE medications SET medicine_name = ?, dosage = ?, time = ?, remaining_tablets = ?, total_tablets = ? WHERE med_id = ? AND user_id = ?";
    const values = [name, dosage, time, remaining_tablets, total_tablets, medicationId, userId];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error updating medication:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Medication not found or unauthorized" });
        }
        res.status(200).json({ message: "Medication updated successfully" });
    });
};

// Delete a medication
const deleteMedication = (req, res) => {
    const userId = req.user.id;
    const medicationId = req.params.id;

    const query = "DELETE FROM medications WHERE med_id = ? AND user_id = ?";

    db.query(query, [medicationId, userId], (err, result) => {
        if (err) {
            console.error("Error deleting medication:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Medication not found or unauthorized" });
        }
        res.status(200).json({ message: "Medication deleted successfully" });
    });
};


module.exports = {
    getMedications,
    addMedication,
    updateMedication,
    deleteMedication
};
