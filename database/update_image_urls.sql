-- ============================================================
-- Update image_url in recommendations table
-- Images sourced from Bezawada folder → served via /images/bezawada/
-- ============================================================

USE hormonal_health;

-- ─── PCOS – Yoga ─────────────────────────────────────────────
UPDATE recommendations SET image_url = '/images/bezawada/Top.jpg'
    WHERE disease_name = 'PCOS' AND category = 'yoga' AND title IN ('Supta Baddha Konasana', 'Balasana', 'Malasana', 'Adho Mukha Svanasana', 'Dhanurasana', 'Paschimottanasana');

UPDATE recommendations SET image_url = '/images/bezawada/b848269cfb7fb5dbd3e40580172d41e2.jpg'
    WHERE disease_name = 'PCOS' AND category = 'yoga' AND title IN ('Marjaryasana-Bitilasana', 'Setu Bandhasana');

UPDATE recommendations SET image_url = '/images/bezawada/Top.jpg'
    WHERE disease_name = 'PCOS' AND category = 'yoga' AND title = 'Surya Namaskar';

-- ─── PCOS – Exercise ──────────────────────────────────────────
UPDATE recommendations SET image_url = '/images/bezawada/th.jpeg'
    WHERE disease_name = 'PCOS' AND category = 'exercise' AND title = 'Brisk Walking';

UPDATE recommendations SET image_url = '/images/bezawada/cardio-light-workout.jpg'
    WHERE disease_name = 'PCOS' AND category = 'exercise' AND title IN ('Swimming', 'Cycling');

UPDATE recommendations SET image_url = '/images/bezawada/cardio-light-workout.jpg'
    WHERE disease_name = 'PCOS' AND category = 'exercise' AND title = 'Resistance Training';

UPDATE recommendations SET image_url = '/images/bezawada/th.jpeg'
    WHERE disease_name = 'PCOS' AND category = 'exercise' AND title = 'Jogging';

UPDATE recommendations SET image_url = '/images/bezawada/cardio-light-workout.jpg'
    WHERE disease_name = 'PCOS' AND category = 'exercise' AND title = 'Pilates';

UPDATE recommendations SET image_url = '/images/bezawada/Screenshot 2026-02-15 131826.png'
    WHERE disease_name = 'PCOS' AND category = 'exercise' AND title = 'HIIT';

UPDATE recommendations SET image_url = '/images/bezawada/Screenshot 2026-02-15 131826.png'
    WHERE disease_name = 'PCOS' AND category = 'exercise' AND title IN ('Boxing', 'Zumba');

-- ─── Thyroid – Yoga ──────────────────────────────────────────
UPDATE recommendations SET image_url = '/images/bezawada/b848269cfb7fb5dbd3e40580172d41e2.jpg'
    WHERE disease_name = 'Thyroid' AND category = 'yoga' AND title IN ('Marjaryasana', 'Setu Bandhasana', 'Ustrasana');

UPDATE recommendations SET image_url = '/images/bezawada/Screenshot 2026-02-15 133125.png'
    WHERE disease_name = 'Thyroid' AND category = 'yoga' AND title IN ('Tadasana', 'Vrikshasana', 'Viparita Karani');

UPDATE recommendations SET image_url = '/images/bezawada/Screenshot 2026-02-15 132918.png'
    WHERE disease_name = 'Thyroid' AND category = 'yoga' AND title IN ('Sarvangasana', 'Halasana', 'Matsyasana');

-- ─── Thyroid – Exercise ──────────────────────────────────────
UPDATE recommendations SET image_url = '/images/bezawada/th.jpeg'
    WHERE disease_name = 'Thyroid' AND category = 'exercise' AND title IN ('Walking', 'Tai Chi');

UPDATE recommendations SET image_url = '/images/bezawada/Top.jpg'
    WHERE disease_name = 'Thyroid' AND category = 'exercise' AND title = 'Yoga';

UPDATE recommendations SET image_url = '/images/bezawada/th.jpeg'
    WHERE disease_name = 'Thyroid' AND category = 'exercise' AND title = 'Jogging';

UPDATE recommendations SET image_url = '/images/bezawada/cardio-light-workout.jpg'
    WHERE disease_name = 'Thyroid' AND category = 'exercise' AND title = 'Water Aerobics';

UPDATE recommendations SET image_url = '/images/bezawada/cardio-light-workout.jpg'
    WHERE disease_name = 'Thyroid' AND category = 'exercise' AND title = 'Cycling';

UPDATE recommendations SET image_url = '/images/bezawada/images.jpeg'
    WHERE disease_name = 'Thyroid' AND category = 'exercise' AND title IN ('Strength Training', 'Running', 'CrossFit');

-- ─── Thyroid – Diet ──────────────────────────────────────────
UPDATE recommendations SET image_url = '/images/bezawada/istockphoto-1307904011-612x612.jpg'
    WHERE disease_name = 'Thyroid' AND category = 'diet' AND title IN ('lodized Salt', 'Nuts', 'Whole Eggs');

UPDATE recommendations SET image_url = '/images/bezawada/diet-plan-for-thyroid.webp'
    WHERE disease_name = 'Thyroid' AND category = 'diet' AND title IN ('Seaweed', 'Dairy Products', 'Beans');

UPDATE recommendations SET image_url = '/images/bezawada/7adbb67cb3e94365c0bafd31ae0d0c44.jpg'
    WHERE disease_name = 'Thyroid' AND category = 'diet' AND title IN ('Gluten-Free Diet', 'Cruciferous Veggies (Cooked)', 'Probiotics');

-- ─── Endometriosis – Yoga ────────────────────────────────────
UPDATE recommendations SET image_url = '/images/bezawada/Top.jpg'
    WHERE disease_name = 'Endometriosis' AND category = 'yoga' AND title IN ('Balasana', 'Supta Baddha Konasana', 'Viparita Karani', 'Setu Bandhasana', 'Cat-Cow', 'Happy Baby Pose');

UPDATE recommendations SET image_url = '/images/bezawada/b848269cfb7fb5dbd3e40580172d41e2.jpg'
    WHERE disease_name = 'Endometriosis' AND category = 'yoga' AND title IN ('Supta Matsyendrasana', 'Malasana', 'Pigeon Pose');

-- ─── Endometriosis – Exercise ────────────────────────────────
UPDATE recommendations SET image_url = '/images/bezawada/th.jpeg'
    WHERE disease_name = 'Endometriosis' AND category = 'exercise' AND title IN ('Walking', 'Swimming');

UPDATE recommendations SET image_url = '/images/bezawada/cardio-light-workout.jpg'
    WHERE disease_name = 'Endometriosis' AND category = 'exercise' AND title = 'Static Stretching';

UPDATE recommendations SET image_url = '/images/bezawada/cardio-light-workout.jpg'
    WHERE disease_name = 'Endometriosis' AND category = 'exercise' AND title IN ('Pilates', 'Light Resistance');

UPDATE recommendations SET image_url = '/images/bezawada/Top.jpg'
    WHERE disease_name = 'Endometriosis' AND category = 'exercise' AND title IN ('Yoga', 'Power Yoga');

UPDATE recommendations SET image_url = '/images/bezawada/Screenshot 2026-02-15 131826.png'
    WHERE disease_name = 'Endometriosis' AND category = 'exercise' AND title IN ('Elliptical', 'Cycling');

SELECT title, category, disease_name, image_url 
FROM recommendations 
WHERE image_url IS NOT NULL AND image_url != ''
ORDER BY disease_name, category, title;
