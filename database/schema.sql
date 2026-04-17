-- Hormonal Health Database Schema
-- Valid for MySQL 8

CREATE DATABASE IF NOT EXISTS hormonal_health;
USE hormonal_health;

-- TABLE 1: users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABLE 2: user_profile
CREATE TABLE IF NOT EXISTS user_profile (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    age INT,
    height FLOAT,
    weight FLOAT,
    cycle_length INT,
    last_period_date DATE,
    known_condition VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABLE 3: master_symptoms
CREATE TABLE IF NOT EXISTS master_symptoms (
    symptom_id INT AUTO_INCREMENT PRIMARY KEY,
    symptom_name VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

-- TABLE 4: diseases
CREATE TABLE IF NOT EXISTS diseases (
    disease_id INT AUTO_INCREMENT PRIMARY KEY,
    disease_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- TABLE 5: disease_symptom_weights
CREATE TABLE IF NOT EXISTS disease_symptom_weights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT NOT NULL,
    symptom_id INT NOT NULL,
    weight INT NOT NULL,
    FOREIGN KEY (disease_id) REFERENCES diseases(disease_id) ON DELETE CASCADE,
    FOREIGN KEY (symptom_id) REFERENCES master_symptoms(symptom_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABLE 6: health_logs
CREATE TABLE IF NOT EXISTS health_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    mood VARCHAR(100),
    sleep_hours FLOAT,
    stress_level INT,
    weight FLOAT,
    step_count INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABLE 7: user_symptom_logs
CREATE TABLE IF NOT EXISTS user_symptom_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_id INT NOT NULL,
    symptom_id INT NOT NULL,
    FOREIGN KEY (log_id) REFERENCES health_logs(log_id) ON DELETE CASCADE,
    FOREIGN KEY (symptom_id) REFERENCES master_symptoms(symptom_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABLE 8: medications
CREATE TABLE IF NOT EXISTS medications (
    med_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    medicine_name VARCHAR(150),
    dosage VARCHAR(100),
    time TIME,
    total_tablets INT,
    remaining_tablets INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABLE 9: recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT NOT NULL,
    type ENUM('yoga', 'exercise', 'diet', 'ayurveda'),
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    FOREIGN KEY (disease_id) REFERENCES diseases(disease_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SEED DATA

-- Insert master_symptoms
INSERT INTO master_symptoms (symptom_name) VALUES 
('Irregular periods'),
('Missed periods'),
('Acne'),
('Hair fall'),
('Excess facial hair'),
('Sudden weight gain'),
('Unexplained weight loss'),
('Fatigue'),
('Mood swings'),
('Anxiety'),
('Depression'),
('Sleep disturbance'),
('Cold intolerance'),
('Heat intolerance'),
('Bloating'),
('Severe cramps'),
('Low activity'),
('Heavy bleeding');

-- Insert diseases
INSERT INTO diseases (disease_name) VALUES 
('PCOS'),
('Thyroid'),
('PMS');
