ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS age integer CHECK (age IS NULL OR age BETWEEN 0 AND 130);

UPDATE patients
SET age = EXTRACT(YEAR FROM age(CURRENT_DATE, dob))::integer
WHERE age IS NULL AND dob IS NOT NULL;

ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS report_released_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS abnormal_data jsonb;

CREATE TABLE IF NOT EXISTS patient_identity_mapping (
    real_name varchar(255) PRIMARY KEY,
    fake_patient_id bigint NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE
);
